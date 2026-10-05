package com.fourbites.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AtualizarUsuarioRequest( 

        @NotBlank(message = "O nome completo é obrigatório.")
        @Size(max = 100, message = "O nome completo deve ter no máximo 100 caracteres.")
        String nome,

        @NotBlank(message = "O nome de usuário é obrigatório.")
        @Size(max = 50, message = "O nome de usuário deve ter no máximo 50 caracteres.")
        @Pattern(regexp = "^[A-Za-z0-9._]+$",
                 message = "O nome de usuário só pode ter letras, números, ponto e sublinhado.")
        String username,

        String bio,

        @NotBlank(message = "O telefone é obrigatório.")
        @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres.")
        String telefone
) {
}