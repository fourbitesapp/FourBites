package com.fourbites.backend.dto;

import java.time.OffsetDateTime;
import com.fourbites.backend.entity.Usuario;

public record UsuarioPublicoResponse(
        Integer id,
        String nome,
        String username,
        String fotoPerfil,
        String bio,
        String capaCor,
        String capaFrase,
        OffsetDateTime dataCadastro,
        long totalAvaliacoes,
        long seguidores,
        long seguindo,
        boolean seguidoPorMim
) {

    public static UsuarioPublicoResponse de(Usuario usuario, long totalAvaliacoes, long seguidores,
                                            long seguindo, boolean seguidoPorMim) {
        return new UsuarioPublicoResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getUsername(),
                usuario.getFotoPerfil(),
                usuario.getBio(),
                usuario.getCapaCor(),
                usuario.getCapaFrase(),
                usuario.getDataCadastro(),
                totalAvaliacoes,
                seguidores,
                seguindo,
                seguidoPorMim);
    }
}