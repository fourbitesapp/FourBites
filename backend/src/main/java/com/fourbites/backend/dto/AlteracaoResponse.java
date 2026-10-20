package com.fourbites.backend.dto;

import java.time.OffsetDateTime;

import com.fourbites.backend.entity.StatusAnalise;

// Uma alteração na fila do admin: a versão publicada (restaurante) e a versão proposta pelo responsável.
public record AlteracaoResponse(
        Integer id,
        OffsetDateTime dataEnvio,
        StatusAnalise status,
        RestauranteGestaoResponse restaurante,
        RestauranteFormulario proposto
) {
}