package com.fourbites.backend.dto;

import com.fourbites.backend.entity.Categoria;

// Categoria no painel admin, com a cor, o ícone e quantos restaurantes usam ela
public record CategoriaAdminResponse(Integer id, String nome, String cor, String icone, long totalRestaurantes) {

    public static CategoriaAdminResponse de(Categoria categoria, long totalRestaurantes) {
        return new CategoriaAdminResponse(categoria.getId(), categoria.getNome(), categoria.getCor(),
                categoria.getIcone(), totalRestaurantes);
    }
}
