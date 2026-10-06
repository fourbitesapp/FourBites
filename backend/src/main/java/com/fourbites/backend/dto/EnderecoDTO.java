package com.fourbites.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EnderecoDTO(

        @NotBlank(message = "O CEP é obrigatório.")
        @Pattern(regexp = "^[0-9]{5}-?[0-9]{3}$", message = "Informe um CEP válido (8 números).")
        String cep,

        @NotBlank(message = "O logradouro é obrigatório.")
        @Size(max = 150, message = "O logradouro deve ter no máximo 150 caracteres.")
        String logradouro,

        @NotBlank(message = "O número é obrigatório.")
        @Size(max = 10, message = "O número deve ter no máximo 10 caracteres.")
        String numero,

        @Size(max = 100, message = "O complemento deve ter no máximo 100 caracteres.")
        String complemento,

        @NotBlank(message = "O bairro é obrigatório.")
        @Size(max = 100, message = "O bairro deve ter no máximo 100 caracteres.")
        String bairro,

        @NotBlank(message = "A cidade é obrigatória.")
        @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres.")
        String cidade,

        @NotBlank(message = "O estado (UF) é obrigatório.")
        @Pattern(regexp = "^[A-Za-z]{2}$", message = "A UF deve ter 2 letras.")
        String uf
) {
}
