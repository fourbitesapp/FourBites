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
import com.fourbites.backend.entity.Curtida;
import com.fourbites.backend.entity.Papel;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.RestauranteAlteracao;
import com.fourbites.backend.entity.Seguidor;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.repository.AvaliacaoRepository;
import com.fourbites.backend.repository.CurtidaRepository;
import com.fourbites.backend.repository.RestauranteAlteracaoRepository;
import com.fourbites.backend.repository.RestauranteRepository;
import com.fourbites.backend.repository.SeguidorRepository;
import com.fourbites.backend.repository.UsuarioRepository;

@Service
public class NotificacaoService {

    private static final int DIAS = 30;
    private static final int MAXIMO = 30;

    private final UsuarioRepository usuarioRepository;
    private final SeguidorRepository seguidorRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final RestauranteRepository restauranteRepository;
    private final RestauranteAlteracaoRepository alteracaoRepository;
    private final CurtidaRepository curtidaRepository;

    public NotificacaoService(UsuarioRepository usuarioRepository, SeguidorRepository seguidorRepository,
                              AvaliacaoRepository avaliacaoRepository, RestauranteRepository restauranteRepository,
                              RestauranteAlteracaoRepository alteracaoRepository,
                              CurtidaRepository curtidaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.seguidorRepository = seguidorRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.restauranteRepository = restauranteRepository;
        this.alteracaoRepository = alteracaoRepository;
        this.curtidaRepository = curtidaRepository;
    }

    @Transactional(readOnly = true)
    public NotificacoesResponse listar(Integer usuarioId) {
        Usuario usuario = buscarUsuario(usuarioId);
        OffsetDateTime desde = OffsetDateTime.now().minusDays(DIAS);
        OffsetDateTime vistasEm = usuario.getNotificacoesVistasEm();

        List<NotificacaoResponse> itens = usuario.getPapel() == Papel.RESTAURANTE
                ? avisosDoRestaurante(usuarioId, desde, vistasEm)
                : avisosDoUsuario(usuarioId, desde, vistasEm);

        // Da mais recente para a mais antiga.
        List<NotificacaoResponse> recentes = itens.stream()
                .sorted(Comparator.comparing(NotificacaoResponse::data).reversed())
                .limit(MAXIMO)
                .toList();
        long novas = recentes.stream().filter(NotificacaoResponse::nova).count();
        return new NotificacoesResponse(novas, recentes);
    }

    // Conta RESTAURANTE
    private List<NotificacaoResponse> avisosDoRestaurante(Integer usuarioId, OffsetDateTime desde,
                                                         OffsetDateTime vistasEm) {
        List<NotificacaoResponse> itens = new ArrayList<>();

        for (Restaurante r : restauranteRepository.findByResponsavelIdAndDataAnaliseAfter(usuarioId, desde)) {
            if (r.getStatus() == StatusAnalise.APROVADO) {
                itens.add(avisoDeRestaurante("CADASTRO_APROVADO", r.getDataAnalise(), r, null, vistasEm));
            } else if (r.getStatus() == StatusAnalise.REJEITADO) {
                itens.add(avisoDeRestaurante("CADASTRO_REJEITADO", r.getDataAnalise(), r, r.getMotivoRejeicao(), vistasEm));
            }
        }

        for (RestauranteAlteracao a : alteracaoRepository.findByRestauranteResponsavelIdAndDataAnaliseAfter(usuarioId, desde)) {
            if (a.getStatus() == StatusAnalise.APROVADO) {
                itens.add(avisoDeRestaurante("ALTERACAO_APROVADA", a.getDataAnalise(), a.getRestaurante(), null, vistasEm));
            } else if (a.getStatus() == StatusAnalise.REJEITADO) {
                itens.add(avisoDeRestaurante("ALTERACAO_REJEITADA", a.getDataAnalise(), a.getRestaurante(),
                        a.getMotivoRejeicao(), vistasEm));
            }
        }
        return itens;
    }

    private NotificacaoResponse avisoDeRestaurante(String tipo, OffsetDateTime data, Restaurante r, String motivo,
                                                   OffsetDateTime vistasEm) {
        return new NotificacaoResponse(tipo, data, null, r.getId(), r.getNome(), ehNova(data, vistasEm), motivo);
    }

    // Conta USUARIO
    private List<NotificacaoResponse> avisosDoUsuario(Integer usuarioId, OffsetDateTime desde,
                                                     OffsetDateTime vistasEm) {
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
                        null, null, ehNova(s.getDataInicio(), vistasEm), null));
            }
        }

        // 2) Avaliações de quem o usuário segue
        List<Integer> seguidos = seguidorRepository.idsSeguidos(usuarioId);
        if (!seguidos.isEmpty()) {
            for (Avaliacao a : avaliacaoRepository
                    .findByUsuarioIdInAndDataAvaliacaoAfterOrderByDataAvaliacaoDesc(seguidos, desde)) {
                itens.add(new NotificacaoResponse("AVALIACAO", a.getDataAvaliacao(), UsuarioResumoResponse.de(a.getUsuario()),
                        a.getRestaurante().getId(), a.getRestaurante().getNome(), ehNova(a.getDataAvaliacao(), vistasEm), null));
            }
        }

        // 3) Curtidas nas avaliações do usuário (uma notificação por curtida)
        List<Curtida> curtidas = curtidaRepository.recebidasDesde(usuarioId, desde);
        Map<Integer, Usuario> quemCurtiu = usuarioRepository
                .findAllById(curtidas.stream().map(Curtida::getUsuarioId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(Usuario::getId, Function.identity()));
        Map<Integer, Avaliacao> avaliacoesCurtidas = avaliacaoRepository
                .findAllById(curtidas.stream().map(Curtida::getAvaliacaoId).distinct().toList())
                .stream()
                .collect(Collectors.toMap(Avaliacao::getId, Function.identity()));
        for (Curtida c : curtidas) {
            Usuario autor = quemCurtiu.get(c.getUsuarioId());
            Avaliacao a = avaliacoesCurtidas.get(c.getAvaliacaoId());
            if (autor != null && a != null) {
                itens.add(new NotificacaoResponse("CURTIDA", c.getDataCurtida(), UsuarioResumoResponse.de(autor),
                        a.getRestaurante().getId(), a.getRestaurante().getNome(), ehNova(c.getDataCurtida(), vistasEm), null));
            }
        }

        return itens;
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
