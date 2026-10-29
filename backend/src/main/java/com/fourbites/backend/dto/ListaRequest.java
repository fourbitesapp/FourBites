package com.fourbites.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Criar ou editar uma lista. cor e icone são opcionais (vazio = padrão do front).
public record ListaRequest(
        @NotBlank(message = "Dê um nome para a lista.")
        @Size(max = 60, message = "O nome deve ter no máximo 60 caracteres.")
        String nome,

        @Size(max = 200, message = "A descrição deve ter no máximo 200 caracteres.")
        String descricao,

        @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "A cor deve estar no formato #RRGGBB.")
        String cor,

        @Size(max = 40, message = "Ícone inválido.")
        @Pattern(regexp = "^bi-[a-z0-9-]+$", message = "Ícone inválido.")
        String icone,

        boolean publica
) {
}