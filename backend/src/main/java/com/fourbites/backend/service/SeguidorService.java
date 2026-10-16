package com.fourbites.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.entity.Papel;
import com.fourbites.backend.entity.Seguidor;
import com.fourbites.backend.entity.SeguidorId;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.exception.RegraNegocioException;
import com.fourbites.backend.repository.SeguidorRepository;
import com.fourbites.backend.repository.UsuarioRepository;

// Seguir e deixar de seguir outros usuários
@Service
public class SeguidorService {

    private final SeguidorRepository seguidorRepository;
    private final UsuarioRepository usuarioRepository;

    public SeguidorService(SeguidorRepository seguidorRepository, UsuarioRepository usuarioRepository) {
        this.seguidorRepository = seguidorRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public void seguir(Integer meuId, String username) {
        Usuario seguido = buscarUsuario(username);

        if (seguido.getId().equals(meuId)) {
            throw new RegraNegocioException("Você não pode seguir a si mesmo.");
        }
        if (seguido.getPapel() != Papel.USUARIO) {
            throw new RegraNegocioException("Só é possível seguir perfis de usuários.");
        }
        if (!seguidorRepository.existsBySeguidorIdAndSeguidoId(meuId, seguido.getId())) {
            seguidorRepository.save(new Seguidor(meuId, seguido.getId()));
        }
    }

    @Transactional
    public void deixarDeSeguir(Integer meuId, String username) {
        Usuario seguido = buscarUsuario(username);
        seguidorRepository.deleteById(new SeguidorId(meuId, seguido.getId()));
    }

    private Usuario buscarUsuario(String username) {
        return usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
    }
}
