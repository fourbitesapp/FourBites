package com.fourbites.backend.service;

import java.time.LocalDate;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.AtualizarUsuarioRequest;
import com.fourbites.backend.dto.CadastroResponsavelRequest;
import com.fourbites.backend.dto.CadastroUsuarioRequest;
import com.fourbites.backend.dto.UsuarioPublicoResponse;
import com.fourbites.backend.dto.UsuarioResponse;
import com.fourbites.backend.entity.Papel;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.ConflitoException;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.exception.RegraNegocioException;
import com.fourbites.backend.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    //Cadastrar usuário comum (papel USUARIO)
    @Transactional
    public UsuarioResponse cadastrar(CadastroUsuarioRequest dados) {
        return criarConta(dados.nome(), dados.username(), dados.email(), dados.telefone(),
                dados.senha(), dados.confirmacaoSenha(), dados.dataNascimento(), Papel.USUARIO);
    }

    //Cadastrar responsável por restaurante (papel RESTAURANTE, sem data de nascimento)
    @Transactional
    public UsuarioResponse cadastrarResponsavel(CadastroResponsavelRequest dados) {
        return criarConta(dados.nome(), dados.username(), dados.email(), dados.telefone(),
                dados.senha(), dados.confirmacaoSenha(), null, Papel.RESTAURANTE);
    }

    //Regras comuns aos dois cadastros
    private UsuarioResponse criarConta(String nome, String usernameInformado, String emailInformado,
                                       String telefone, String senha, String confirmacaoSenha,
                                       LocalDate dataNascimento, Papel papel) {
        if (!senha.equals(confirmacaoSenha)) {
            throw new RegraNegocioException("A senha e a confirmação de senha não coincidem.");
        }

        String email = normalizarEmail(emailInformado);
        String username = usernameInformado.trim();

        if (usuarioRepository.existsByEmail(email)) {
            throw new ConflitoException("Este e-mail já está em uso.");
        }
        if (usuarioRepository.existsByUsernameIgnoreCase(username)) {
            throw new ConflitoException("Este nome de usuário já está em uso.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(nome.trim());
        usuario.setUsername(username);
        usuario.setEmail(email);
        usuario.setTelefone(telefone.trim());
        usuario.setDataNascimento(dataNascimento);
        usuario.setPapel(papel);
        usuario.setSenha(passwordEncoder.encode(senha));

        Usuario salvo = usuarioRepository.save(usuario);
        return UsuarioResponse.de(salvo);
    }

    //Perfil público (sem dados privados)
    @Transactional(readOnly = true)
    public UsuarioPublicoResponse buscarPerfilPublico(String username) {
        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        return UsuarioPublicoResponse.de(usuario);
    }

    //Dados da própria conta (usuário logado)
    @Transactional(readOnly = true)
    public UsuarioResponse buscarPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        return UsuarioResponse.de(usuario);
    }

    //Editar perfil
    @Transactional
    public UsuarioResponse atualizar(Integer id, AtualizarUsuarioRequest dados) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));

        String username = dados.username().trim();

        if (usuarioRepository.existsByUsernameIgnoreCaseAndIdNot(username, id)) {
            throw new ConflitoException("Este nome de usuário não está disponível.");
        }

        usuario.setNome(dados.nome().trim());
        usuario.setUsername(username);
        usuario.setTelefone(dados.telefone().trim());
        usuario.setBio(textoOuNulo(dados.bio()));

        Usuario salvo = usuarioRepository.save(usuario);
        return UsuarioResponse.de(salvo);
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String textoOuNulo(String texto) { //Bio!
        if (texto == null || texto.isBlank()) {
            return null;
        }
        return texto.trim();
    }
}
