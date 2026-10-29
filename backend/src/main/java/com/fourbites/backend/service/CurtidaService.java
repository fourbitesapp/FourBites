package com.fourbites.backend.service;

import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.UsuarioResumoResponse;
import com.fourbites.backend.entity.Avaliacao;
import com.fourbites.backend.entity.Curtida;
import com.fourbites.backend.entity.CurtidaId;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.exception.RegraNegocioException;
import com.fourbites.backend.repository.AvaliacaoRepository;
import com.fourbites.backend.repository.CurtidaRepository;
import com.fourbites.backend.repository.UsuarioRepository;

// Curtir e descurtir avaliações, e a lista de quem curtiu.

@Service
public class CurtidaService {

    private final CurtidaRepository curtidaRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public CurtidaService(CurtidaRepository curtidaRepository, AvaliacaoRepository avaliacaoRepository,
                          UsuarioRepository usuarioRepository) {
        this.curtidaRepository = curtidaRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public void curtir(Integer meuId, Integer avaliacaoId) {
        Avaliacao avaliacao = buscarAvaliacao(avaliacaoId);

        if (avaliacao.getUsuario().getId().equals(meuId)) {
            throw new RegraNegocioException("Você não pode curtir a sua própria avaliação.");
        }
        if (!curtidaRepository.existsByUsuarioIdAndAvaliacaoId(meuId, avaliacaoId)) {
            curtidaRepository.save(new Curtida(meuId, avaliacaoId));
        }
    }

    @Transactional
    public void descurtir(Integer meuId, Integer avaliacaoId) {
        curtidaRepository.deleteById(new CurtidaId(meuId, avaliacaoId));
    }

    // Lista pública de quem curtiu, da curtida mais recente para a mais antiga.
    @Transactional(readOnly = true)
    public List<UsuarioResumoResponse> quemCurtiu(Integer avaliacaoId) {
        buscarAvaliacao(avaliacaoId);
        List<Integer> ids = curtidaRepository.idsDeQuemCurtiu(avaliacaoId);
        Map<Integer, Usuario> usuarios = usuarioRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Usuario::getId, Function.identity()));
        return ids.stream()
                .map(usuarios::get)
                .filter(usuario -> usuario != null)
                .map(UsuarioResumoResponse::de)
                .toList();
    }

    // Total de curtidas de cada avaliação 
    @Transactional(readOnly = true)
    public Map<Integer, Long> totais(Collection<Integer> avaliacaoIds) {
        Map<Integer, Long> totais = new HashMap<>();
        if (avaliacaoIds.isEmpty()) {
            return totais;
        }
        for (Object[] linha : curtidaRepository.contarPorAvaliacao(avaliacaoIds)) {
            totais.put(((Number) linha[0]).intValue(), ((Number) linha[1]).longValue());
        }
        return totais;
    }

    // Quais dessas avaliações quem está vendo já curtiu 
    @Transactional(readOnly = true)
    public Set<Integer> curtidasPor(Integer usuarioId, Collection<Integer> avaliacaoIds) {
        if (usuarioId == null || avaliacaoIds.isEmpty()) {
            return Set.of();
        }
        return new HashSet<>(curtidaRepository.curtidasDoUsuario(usuarioId, avaliacaoIds));
    }

    private Avaliacao buscarAvaliacao(Integer id) {
        return avaliacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Avaliação não encontrada."));
    }
}

