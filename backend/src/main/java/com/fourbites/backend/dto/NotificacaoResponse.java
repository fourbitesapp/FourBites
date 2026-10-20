package com.fourbites.backend.dto;

import java.time.OffsetDateTime;

public record NotificacaoResponse(
        String tipo,
        OffsetDateTime data,
        UsuarioResumoResponse usuario,
        Integer restauranteId,
        String restauranteNome,
        boolean nova
) {
}
