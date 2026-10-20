package com.fourbites.backend.dto;

import jakarta.validation.constraints.Size;

// Aprovação de um cadastro pelo admin. 
public record AprovarCadastroRequest(
        Integer categoriaId,

        @Size(max = 100, message = "O nome da categoria deve ter no máximo 100 caracteres.")
        String novaCategoria
) {
}
