package com.fourbites.backend.dto;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Criar ou editar uma avaliação.
public record AvaliacaoRequest(

        @NotNull(message = "Dê uma nota para a comida.")
        @Min(value = 1, message = "A nota vai de 1 a 5.")
        @Max(value = 5, message = "A nota vai de 1 a 5.")
        Integer notaComida,

        @NotNull(message = "Dê uma nota para o ambiente.")
        @Min(value = 1, message = "A nota vai de 1 a 5.")
        @Max(value = 5, message = "A nota vai de 1 a 5.")
        Integer notaAmbiente,

        @NotNull(message = "Dê uma nota para o atendimento.")
        @Min(value = 1, message = "A nota vai de 1 a 5.")
        @Max(value = 5, message = "A nota vai de 1 a 5.")
        Integer notaAtendimento,

        @NotNull(message = "Dê uma nota para o custo-benefício.")
        @Min(value = 1, message = "A nota vai de 1 a 5.")
        @Max(value = 5, message = "A nota vai de 1 a 5.")
        Integer notaCusto,

        @Size(max = 2000, message = "O comentário deve ter no máximo 2000 caracteres.")
        String comentario,

        @Size(max = 5, message = "Envie no máximo 5 fotos.")
        List<@NotBlank(message = "Endereço de foto inválido.") @Size(max = 500) String> fotos
) {
}
