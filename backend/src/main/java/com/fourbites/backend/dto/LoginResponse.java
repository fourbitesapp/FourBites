package com.fourbites.backend.dto;

public record LoginResponse(
        String token,
        UsuarioResponse usuario
) {
}

