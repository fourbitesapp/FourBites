package com.fourbites.backend.dto;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record HorarioDTO(

        @NotNull(message = "Informe o dia da semana.")
        @Min(value = 1, message = "O dia da semana vai de 1 (segunda) a 7 (domingo).")
        @Max(value = 7, message = "O dia da semana vai de 1 (segunda) a 7 (domingo).")
        Integer diaSemana,

        @NotNull(message = "Informe o horário de abertura.")
        @JsonFormat(pattern = "HH:mm")
        LocalTime abertura,

        @NotNull(message = "Informe o horário de fechamento.")
        @JsonFormat(pattern = "HH:mm")
        LocalTime fechamento
) {
}
