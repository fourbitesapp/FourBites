package com.fourbites.backend.service;
import java.util.List;

import org.springframework.stereotype.Service;

import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario salvar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public Usuario buscarPorId(Integer id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    public Usuario atualizar(Integer id, Usuario usuario) {
        Usuario usuarioExistente = usuarioRepository.findById(id).orElse(null);
        if (usuarioExistente != null) {
            usuarioExistente.setNome(usuario.getNome());
            usuarioExistente.setUsername(usuario.getUsername());
            usuarioExistente.setEmail(usuario.getEmail());
            usuarioExistente.setFotoPerfil(usuario.getFotoPerfil());
            usuarioExistente.setBio(usuario.getBio());
            usuarioExistente.setDataNascimento(usuario.getDataNascimento());
            return usuarioRepository.save(usuarioExistente);
        }
        return null;
    }
}