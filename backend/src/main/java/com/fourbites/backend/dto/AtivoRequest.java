package com.fourbites.backend.dto;

import jakarta.validation.constraints.NotNull;

public record AtivoRequest(

        @NotNull(message = "Informe se o restaurante fica ativo (true) ou inativo (false).")
        Boolean ativo
) {
}