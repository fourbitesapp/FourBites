package com.fourbites.backend.dto;

import java.math.BigDecimal;

import com.fourbites.backend.util.Notas;

// Notas de um restaurante já calculadas
public record ResumoNotas(
        BigDecimal notaMedia,
        long totalAvaliacoes,
        RestauranteGestaoResponse.Medias medias
) {

    // Restaurante que ainda não recebeu nenhuma avaliação.
    public static final ResumoNotas SEM_AVALIACOES = new ResumoNotas(null, 0, null);

    public static ResumoNotas daLinha(Object[] linha) {
        return new ResumoNotas(
                Notas.arredondar((Number) linha[1], 2),
                ((Number) linha[2]).longValue(),
                new RestauranteGestaoResponse.Medias(
                        Notas.arredondar((Number) linha[3], 1),
                        Notas.arredondar((Number) linha[4], 1),
                        Notas.arredondar((Number) linha[5], 1),
                        Notas.arredondar((Number) linha[6], 1)));
    }
}
