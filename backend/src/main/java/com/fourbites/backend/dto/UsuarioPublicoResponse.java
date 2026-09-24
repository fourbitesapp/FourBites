package com.fourbites.backend.dto;

import java.time.OffsetDateTime;
import com.fourbites.backend.entity.Usuario;

public record UsuarioPublicoResponse(
        Integer id,
        String nome,
        String username,
        String fotoPerfil,
        String bio,
        OffsetDateTime dataCadastro
) {

    public static UsuarioPublicoResponse de(Usuario usuario) {
        return new UsuarioPublicoResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getUsername(),
                usuario.getFotoPerfil(),
                usuario.getBio(),
                usuario.getDataCadastro());
    }
}