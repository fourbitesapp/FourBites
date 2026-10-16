package com.fourbites.backend.service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.RankingItemResponse;
import com.fourbites.backend.dto.RestauranteResumoResponse;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.exception.CampoInvalidoException;
import com.fourbites.backend.repository.AvaliacaoRepository;
import com.fourbites.backend.repository.RestauranteRepository;
import com.fourbites.backend.util.Notas;

// Ranking dos restaurantes mais bem avaliados (aparece na Home).
@Service
public class RankingService {

    private static final long MINIMO_AVALIACOES = 2; // decisão d05
    private static final int TAMANHO_RANKING = 10;

    private final AvaliacaoRepository avaliacaoRepository;
    private final RestauranteRepository restauranteRepository;
    private final AvaliacaoService avaliacaoService;

    public RankingService(AvaliacaoRepository avaliacaoRepository,
                          RestauranteRepository restauranteRepository,
                          AvaliacaoService avaliacaoService) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.restauranteRepository = restauranteRepository;
        this.avaliacaoService = avaliacaoService;
    }

    // "semanal" (últimos 7 dias) ou "mensal" (últimos 30 dias).
    @Transactional(readOnly = true)
    public List<RankingItemResponse> calcular(String periodo) {
        OffsetDateTime desde = inicioDoPeriodo(periodo);

        List<Object[]> linhas = avaliacaoRepository.rankingDoPeriodo(desde, StatusAnalise.APROVADO,
                MINIMO_AVALIACOES, PageRequest.of(0, TAMANHO_RANKING));

        // id do restaurante, média no período, quantidade no período.
        List<Integer> ids = linhas.stream().map(linha -> ((Number) linha[0]).intValue()).toList();
        Map<Integer, Restaurante> restaurantes = restauranteRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Restaurante::getId, Function.identity()));

        List<RankingItemResponse> ranking = new ArrayList<>();
        for (Object[] linha : linhas) {
            Restaurante restaurante = restaurantes.get(((Number) linha[0]).intValue());
            ranking.add(new RankingItemResponse(
                    ranking.size() + 1,
                    RestauranteResumoResponse.de(restaurante, null,
                            avaliacaoService.notasDoRestaurante(restaurante.getId())),
                    Notas.arredondar((Number) linha[1], 2),
                    ((Number) linha[2]).longValue()));
        }
        return ranking;
    }

    private OffsetDateTime inicioDoPeriodo(String periodo) {
        OffsetDateTime agora = OffsetDateTime.now();
        if ("semanal".equalsIgnoreCase(periodo)) {
            return agora.minusDays(7);
        }
        if ("mensal".equalsIgnoreCase(periodo)) {
            return agora.minusDays(30);
        }
        throw new CampoInvalidoException("periodo", "O período deve ser semanal ou mensal.");
    }
}
