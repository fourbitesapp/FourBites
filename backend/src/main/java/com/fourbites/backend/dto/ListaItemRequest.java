package com.fourbites.backend.dto;

import jakarta.validation.constraints.NotNull;

// Restaurante para colocar numa lista
public record ListaItemRequest(
        @NotNull(message = "Escolha um restaurante.")
        Integer restauranteId
) {
}