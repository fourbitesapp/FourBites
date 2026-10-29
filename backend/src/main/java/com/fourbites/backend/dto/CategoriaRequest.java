package com.fourbites.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Criar ou editar categoria (admin). cor e icone são opcionais: vazio = padrão do front.
public record CategoriaRequest(
        @NotBlank(message = "O nome da categoria é obrigatório.")
        @Size(max = 100, message = "O nome da categoria deve ter no máximo 100 caracteres.")
        String nome,

        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "A cor deve estar no formato #RRGGBB.")
        String cor,

        @Size(max = 40, message = "O nome do ícone deve ter no máximo 40 caracteres.")
        @Pattern(regexp = "^[a-z ]+$", message = "Ícone inválido.")
        String icone
) {
}
