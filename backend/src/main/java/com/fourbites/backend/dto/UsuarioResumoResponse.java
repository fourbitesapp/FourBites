package com.fourbites.backend.dto;

import com.fourbites.backend.entity.Usuario;

// Usuário numa lista (resultado da busca de pessoas).
public record UsuarioResumoResponse(
        Integer id,
        String nome,
        String username,
        String fotoPerfil
) {

    public static UsuarioResumoResponse de(Usuario usuario) {
        return new UsuarioResumoResponse(usuario.getId(), usuario.getNome(), usuario.getUsername(), usuario.getFotoPerfil());
    }
}