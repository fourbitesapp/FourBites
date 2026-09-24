package com.fourbites.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.AtualizarUsuarioRequest;
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

    //Cadastrar usuário
    @Transactional
    public UsuarioResponse cadastrar(CadastroUsuarioRequest dados) {
        if (!dados.senha().equals(dados.confirmacaoSenha())) {
            throw new RegraNegocioException("A senha e a confirmação de senha não coincidem.");
        }

        String email = normalizarEmail(dados.email());
        String username = dados.username().trim();

        if (usuarioRepository.existsByEmail(email)) {
            throw new ConflitoException("Este e-mail já está em uso.");
        }
        if (usuarioRepository.existsByUsername(username)) {
            throw new ConflitoException("Este nome de usuário já está em uso.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dados.nome().trim());
        usuario.setUsername(username);
        usuario.setEmail(email);
        usuario.setTelefone(dados.telefone().trim());
        usuario.setDataNascimento(dados.dataNascimento());
        usuario.setPapel(Papel.USUARIO); 
        usuario.setSenha(passwordEncoder.encode(dados.senha())); 

        Usuario salvo = usuarioRepository.save(usuario);
        return UsuarioResponse.de(salvo);
    }

    //Perfil público (sem dados privados)
    @Transactional(readOnly = true)
    public UsuarioPublicoResponse buscarPerfilPublico(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        return UsuarioPublicoResponse.de(usuario);
    }

    //Editar perfil
    @Transactional
    public UsuarioResponse atualizar(Integer id, AtualizarUsuarioRequest dados) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));

        String username = dados.username().trim();

        if (usuarioRepository.existsByUsernameAndIdNot(username, id)) {
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
