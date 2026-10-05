package com.fourbites.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaRequest(

        @NotBlank(message = "O token é obrigatório.")
        String token,

        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
        String senha,

        @NotBlank(message = "A confirmação de senha é obrigatória.")
        String confirmacaoSenha
) {
}
