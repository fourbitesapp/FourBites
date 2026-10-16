package com.fourbites.backend.dto;

import jakarta.validation.constraints.NotNull;

public record FavoritoRequest(

        @NotNull(message = "Escolha um restaurante.")
        Integer restauranteId
) {
}

