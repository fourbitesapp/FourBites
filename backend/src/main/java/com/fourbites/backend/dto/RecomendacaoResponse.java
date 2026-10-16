package com.fourbites.backend.dto;

// Um restaurante recomendado e o quanto ele combina com o usuário
public record RecomendacaoResponse(RestauranteResumoResponse restaurante, int compatibilidade) {
}

