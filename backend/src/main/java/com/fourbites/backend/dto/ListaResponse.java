package com.fourbites.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

// Uma lista de restaurantes
public record ListaResponse(
        Integer id,
        String nome,
        String descricao,
        String cor,
        String icone,
        boolean publica,
        int totalRestaurantes,
        List<String> capas,
        UsuarioResumoResponse dono,
        boolean minha,
        OffsetDateTime dataAtualizacao,
        List<RestauranteResumoResponse> restaurantes
) {
}
