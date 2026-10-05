package com.fourbites.backend.dto;

import java.util.List;

import com.fourbites.backend.entity.UsuarioPreferencia;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record PreferenciasDTO(

        @NotNull(message = "Informe a lista de categorias (pode ser vazia).")
        List<Integer> categoriaIds,

        @Pattern(regexp = "^[$]{1,3}$", message = "A faixa de preço deve ser $, $$ ou $$$.")
        String faixaPreco, 

        boolean precisaAcessibilidade,

        boolean levaPets
) {

    public static PreferenciasDTO de(UsuarioPreferencia preferencia) {
        return new PreferenciasDTO(
                preferencia.getCategoriaIds().stream().sorted().toList(),
                preferencia.getFaixaPreco(),
                preferencia.isPrecisaAcessibilidade(),
                preferencia.isLevaPets());
    }
}

