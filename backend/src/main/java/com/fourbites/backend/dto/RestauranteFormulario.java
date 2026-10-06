package com.fourbites.backend.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Criar ou editar um restaurante (o mesmo para admin e responsável).

public record RestauranteFormulario(

        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres.")
        String nome,

        String cnpj,

        Integer categoriaId,

        @Size(max = 100, message = "A categoria sugerida deve ter no máximo 100 caracteres.")
        String categoriaSugerida,

        @NotBlank(message = "A descrição é obrigatória.")
        String descricao,

        @NotBlank(message = "O telefone é obrigatório.")
        @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres.")
        String telefone,

        @NotNull(message = "Informe o mês e o ano de abertura.")
        @PastOrPresent(message = "A data de abertura não pode estar no futuro.")
        LocalDate dataFundacao,

        @NotNull(message = "O endereço é obrigatório.")
        @Valid
        EnderecoDTO endereco,

        @NotBlank(message = "A faixa de preço é obrigatória.")
        @Pattern(regexp = "^[$]{1,3}$", message = "A faixa de preço deve ser $, $$ ou $$$.")
        String faixaPreco,

        @NotNull(message = "Informe as formas de pagamento (a lista pode ser vazia).")
        List<Integer> formasPagamentoIds,

        @NotNull(message = "Informe os horários de funcionamento (a lista pode ser vazia).")
        @Valid
        List<HorarioDTO> horarios,

        boolean aceitaPets,

        boolean acessivel,

        List<@NotBlank(message = "Endereço de foto inválido.") @Size(max = 500) String> fotos,

        @Size(max = 500, message = "O endereço do cardápio deve ter no máximo 500 caracteres.")
        String cardapioUrl,

        @Size(max = 500, message = "O link do cardápio deve ter no máximo 500 caracteres.")
        String cardapioLink
) {
}

