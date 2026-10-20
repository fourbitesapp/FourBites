package com.fourbites.backend.dto;

import jakarta.validation.constraints.NotBlank;

// Rejeição de um cadastro ou de uma alteração
public record RejeitarRequest(
        @NotBlank(message = "Escreva o motivo da rejeição.")
        String motivo
) {
}
