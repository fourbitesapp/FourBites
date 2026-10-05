package com.fourbites.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.LoginRequest;
import com.fourbites.backend.dto.LoginResponse;
import com.fourbites.backend.dto.UsuarioResponse;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.CredenciaisInvalidasException;
import com.fourbites.backend.repository.UsuarioRepository;
import com.fourbites.backend.seguranca.JwtService;

@Service
public class AuthService {

    private static final String MENSAGEM_ERRO = "E-mail ou senha incorretos.";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest dados) {
        String email = dados.email().trim().toLowerCase();

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new CredenciaisInvalidasException(MENSAGEM_ERRO));

        if (!passwordEncoder.matches(dados.senha(), usuario.getSenha())) {
            throw new CredenciaisInvalidasException(MENSAGEM_ERRO);
        }

        String token = jwtService.gerarToken(usuario);
        return new LoginResponse(token, UsuarioResponse.de(usuario));
    }
}
