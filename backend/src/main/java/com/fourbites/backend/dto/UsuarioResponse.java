package com.fourbites.backend.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import com.fourbites.backend.entity.Papel;
import com.fourbites.backend.entity.Usuario;

public record UsuarioResponse(
        Integer id,
        String nome,
        String username,
        String email,
        String telefone,
        LocalDate dataNascimento,
        String fotoPerfil,
        String bio,
        Papel papel,
        OffsetDateTime dataCadastro
) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getUsername(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getDataNascimento(),
                usuario.getFotoPerfil(),
                usuario.getBio(),
                usuario.getPapel(),
                usuario.getDataCadastro());
    }
}

