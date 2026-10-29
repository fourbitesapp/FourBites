package com.fourbites.backend.dto;

import com.fourbites.backend.entity.Categoria;

// Categoria nas listas e nos restaurantes: nome, cor (#RRGGBB) e nome do desenho do ícone 
public record CategoriaResponse(Integer id, String nome, String cor, String icone) {

    public static CategoriaResponse de(Categoria categoria) {
        return categoria == null ? null
                : new CategoriaResponse(categoria.getId(), categoria.getNome(), categoria.getCor(), categoria.getIcone());
    }
}
