package com.fourbites.backend.dto;

import java.math.BigDecimal;

public record Coordenadas(
        BigDecimal latitude,
        BigDecimal longitude
) {
}
