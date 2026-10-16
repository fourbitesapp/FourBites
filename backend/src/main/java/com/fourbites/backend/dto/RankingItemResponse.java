package com.fourbites.backend.dto;

import java.math.BigDecimal;

// Uma linha do ranking: a posição, o restaurante e como ele foi no período.
public record RankingItemResponse(
        int posicao,
        RestauranteResumoResponse restaurante,
        BigDecimal notaPeriodo,
        long avaliacoesPeriodo
) {
}

