package com.fourbites.backend.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.UsuarioResumoResponse;
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
        // Perfis de pessoas: usuários e o perfil oficial (admin). Conta de restaurante não tem perfil.
        if (seguido.getPapel() == Papel.RESTAURANTE) {
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

    // Listas do perfil (públicas), em ordem alfabética.
    @Transactional(readOnly = true)
    public List<UsuarioResumoResponse> listarSeguidores(String username) {
        return paraLista(seguidorRepository.idsSeguidores(buscarUsuario(username).getId()));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResumoResponse> listarSeguindo(String username) {
        return paraLista(seguidorRepository.idsSeguidos(buscarUsuario(username).getId()));
    }

    private List<UsuarioResumoResponse> paraLista(List<Integer> ids) {
        return usuarioRepository.findAllById(ids).stream()
                .sorted(Comparator.comparing(Usuario::getNome, String.CASE_INSENSITIVE_ORDER))
                .map(UsuarioResumoResponse::de)
                .toList();
    }

    private Usuario buscarUsuario(String username) {
        return usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
    }
}
