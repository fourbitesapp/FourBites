package com.fourbites.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

        // E-mail ou nome de usuário 
        @NotBlank(message = "Informe o e-mail ou o nome de usuário.")
        String login,

        @NotBlank(message = "A senha é obrigatória.")
        String senha
) {
}