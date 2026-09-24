package com.fourbites.backend.dto;

import java.time.OffsetDateTime;
import java.util.Map;

public record ErroResponse(
        int status,
        String mensagem,
        Map<String, String> campos,
        OffsetDateTime dataHora
) {

    public ErroResponse(int status, String mensagem) {
        this(status, mensagem, null, OffsetDateTime.now());
    }

    public ErroResponse(int status, String mensagem, Map<String, String> campos) {
        this(status, mensagem, campos, OffsetDateTime.now());
    }
}

