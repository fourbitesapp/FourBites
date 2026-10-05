package com.fourbites.backend.service;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.RedefinirSenhaRequest;
import com.fourbites.backend.entity.TokenRecuperacaoSenha;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.RegraNegocioException;
import com.fourbites.backend.repository.TokenRecuperacaoSenhaRepository;
import com.fourbites.backend.repository.UsuarioRepository;

@Service
public class RecuperacaoSenhaService {
    private static final Logger log = LoggerFactory.getLogger(RecuperacaoSenhaService.class);
    private static final String LINK_INVALIDO = "Este link é inválido ou já expirou. Peça um novo.";

    private final UsuarioRepository usuarioRepository;
    private final TokenRecuperacaoSenhaRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final String frontendUrl;
    private final long validadeMinutos;

    private final SecureRandom sorteio = new SecureRandom();

    public RecuperacaoSenhaService(UsuarioRepository usuarioRepository,
                                   TokenRecuperacaoSenhaRepository tokenRepository,
                                   PasswordEncoder passwordEncoder,
                                   EmailService emailService,
                                   @Value("${app.frontend-url}") String frontendUrl,
                                   @Value("${app.recuperacao.validade-minutos}") long validadeMinutos) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
        this.validadeMinutos = validadeMinutos;
    }

    // "Esqueci minha senha": nunca lança erro, para não revelar se o e-mail está cadastrado.
    @Transactional
    public void solicitar(String emailInformado) {
        String email = emailInformado.trim().toLowerCase();

        Optional<Usuario> encontrado = usuarioRepository.findByEmail(email);
        if (encontrado.isEmpty()) {
            return;
        }
        Usuario usuario = encontrado.get();

        TokenRecuperacaoSenha token = new TokenRecuperacaoSenha();
        token.setUsuario(usuario);
        token.setToken(gerarToken());
        token.setExpiraEm(OffsetDateTime.now().plusMinutes(validadeMinutos));
        tokenRepository.save(token);

        String link = frontendUrl + "/redefinir-senha?token=" + token.getToken();
        try {
            emailService.enviarRecuperacaoSenha(usuario.getEmail(), usuario.getNome(), link);
        } catch (RuntimeException e) {
            log.error("Não foi possível enviar o e-mail de recuperação para {}", usuario.getEmail(), e);
        }
    }

    // Troca a senha se o token existir, não tiver vencido e ainda não tiver sido usado.
    @Transactional
    public void redefinir(RedefinirSenhaRequest dados) {
        if (!dados.senha().equals(dados.confirmacaoSenha())) {
            throw new RegraNegocioException("A senha e a confirmação de senha não coincidem.");
        }

        TokenRecuperacaoSenha token = tokenRepository.findByToken(dados.token())
                .orElseThrow(() -> new RegraNegocioException(LINK_INVALIDO));

        if (token.isUsado() || token.getExpiraEm().isBefore(OffsetDateTime.now())) {
            throw new RegraNegocioException(LINK_INVALIDO);
        }

        Usuario usuario = token.getUsuario();
        usuario.setSenha(passwordEncoder.encode(dados.senha()));
        token.setUsado(true); 
    }

    private String gerarToken() {
        byte[] bytes = new byte[32];
        sorteio.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
