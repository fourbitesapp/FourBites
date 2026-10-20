package com.fourbites.backend.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.NotificacaoResponse;
import com.fourbites.backend.dto.NotificacoesResponse;
import com.fourbites.backend.dto.UsuarioResumoResponse;
import com.fourbites.backend.entity.Avaliacao;
import com.fourbites.backend.entity.Seguidor;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.repository.AvaliacaoRepository;
import com.fourbites.backend.repository.SeguidorRepository;
import com.fourbites.backend.repository.UsuarioRepository;

@Service
public class NotificacaoService {

    private static final int DIAS = 30;
    private static final int MAXIMO = 30;

    private final UsuarioRepository usuarioRepository;
    private final SeguidorRepository seguidorRepository;
    private final AvaliacaoRepository avaliacaoRepository;

    public NotificacaoService(UsuarioRepository usuarioRepository, SeguidorRepository seguidorRepository,
                              AvaliacaoRepository avaliacaoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.seguidorRepository = seguidorRepository;
        this.avaliacaoRepository = avaliacaoRepository;
    }

    @Transactional(readOnly = true)
    public NotificacoesResponse listar(Integer usuarioId) {
        Usuario usuario = buscarUsuario(usuarioId);
        OffsetDateTime desde = OffsetDateTime.now().minusDays(DIAS);
        OffsetDateTime vistasEm = usuario.getNotificacoesVistasEm();

        List<NotificacaoResponse> itens = new ArrayList<>();

        // 1) Novos seguidores
        List<Seguidor> seguidores = seguidorRepository
                .findBySeguidoIdAndDataInicioAfterOrderByDataInicioDesc(usuarioId, desde);
        Map<Integer, Usuario> quemSeguiu = usuarioRepository
                .findAllById(seguidores.stream().map(Seguidor::getSeguidorId).toList())
                .stream()
                .collect(Collectors.toMap(Usuario::getId, Function.identity()));
        for (Seguidor s : seguidores) {
            Usuario autor = quemSeguiu.get(s.getSeguidorId());
            if (autor != null) {
                itens.add(new NotificacaoResponse("SEGUIDOR", s.getDataInicio(), UsuarioResumoResponse.de(autor),
                        null, null, ehNova(s.getDataInicio(), vistasEm)));
            }
        }

        // 2) Avaliações de quem o usuário segue
        List<Integer> seguidos = seguidorRepository.idsSeguidos(usuarioId);
        if (!seguidos.isEmpty()) {
            for (Avaliacao a : avaliacaoRepository
                    .findByUsuarioIdInAndDataAvaliacaoAfterOrderByDataAvaliacaoDesc(seguidos, desde)) {
                itens.add(new NotificacaoResponse("AVALIACAO", a.getDataAvaliacao(), UsuarioResumoResponse.de(a.getUsuario()),
                        a.getRestaurante().getId(), a.getRestaurante().getNome(), ehNova(a.getDataAvaliacao(), vistasEm)));
            }
        }

        // Junta as duas listas, da mais recente para a mais antiga.
        List<NotificacaoResponse> recentes = itens.stream()
                .sorted(Comparator.comparing(NotificacaoResponse::data).reversed())
                .limit(MAXIMO)
                .toList();
        long novas = recentes.stream().filter(NotificacaoResponse::nova).count();
        return new NotificacoesResponse(novas, recentes);
    }

    // Abrir marca tudo como visto.
    @Transactional
    public void marcarComoVistas(Integer usuarioId) {
        buscarUsuario(usuarioId).setNotificacoesVistasEm(OffsetDateTime.now());
    }

    private boolean ehNova(OffsetDateTime quando, OffsetDateTime vistasEm) {
        return vistasEm == null || quando.isAfter(vistasEm);
    }

    private Usuario buscarUsuario(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
    }
}
