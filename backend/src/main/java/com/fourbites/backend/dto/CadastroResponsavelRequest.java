package com.fourbites.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CadastroResponsavelRequest(

        @NotBlank(message = "O nome completo é obrigatório.")
        @Size(max = 100, message = "O nome completo deve ter no máximo 100 caracteres.")
        String nome,

        @NotBlank(message = "O nome de usuário é obrigatório.")
        @Size(max = 50, message = "O nome de usuário deve ter no máximo 50 caracteres.")
        @Pattern(regexp = "^[A-Za-z0-9._]+$",
                 message = "O nome de usuário só pode ter letras, números, ponto e sublinhado.")
        String username,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "Informe um e-mail válido.")
        @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres.")
        String email,

        @NotBlank(message = "O telefone é obrigatório.")
        @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres.")
        String telefone,

        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
        String senha,

        @NotBlank(message = "A confirmação de senha é obrigatória.")
        String confirmacaoSenha
) {
}