package com.fourbites.backend.dto;

// Categoria no painel admin, com quantos restaurantes usam ela
public record CategoriaAdminResponse(Integer id, String nome, long totalRestaurantes) {
}

