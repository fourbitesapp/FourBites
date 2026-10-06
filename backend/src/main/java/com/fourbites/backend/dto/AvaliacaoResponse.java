package com.fourbites.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import com.fourbites.backend.entity.Avaliacao;
import com.fourbites.backend.entity.Categoria;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.Usuario;

public record AvaliacaoResponse(
        Integer id,
        Autor usuario,
        RestauranteDaAvaliacao restaurante,
        Integer notaComida,
        Integer notaAmbiente,
        Integer notaAtendimento,
        Integer notaCusto,
        BigDecimal notaGeral,
        String comentario,
        List<String> fotos,
        OffsetDateTime dataAvaliacao,
        boolean editada
) {

    public record Autor(Integer id, String nome, String username, String fotoPerfil) {
    }

    public record RestauranteDaAvaliacao(Integer id, String nome, String fotoCapa, OpcaoResponse categoria,
                                         String bairro) {
    }

    public static AvaliacaoResponse de(Avaliacao a) {
        Usuario autor = a.getUsuario();
        Restaurante r = a.getRestaurante();
        Categoria categoria = r.getCategoria();
        String fotoCapa = r.getFotos().isEmpty() ? null : r.getFotos().get(0).getUrl();

        return new AvaliacaoResponse(
                a.getId(),
                new Autor(autor.getId(), autor.getNome(), autor.getUsername(), autor.getFotoPerfil()),
                new RestauranteDaAvaliacao(r.getId(), r.getNome(), fotoCapa,
                        categoria == null ? null : new OpcaoResponse(categoria.getId(), categoria.getNome()),
                        r.getBairro()),
                a.getNotaComida(),
                a.getNotaAmbiente(),
                a.getNotaAtendimento(),
                a.getNotaCusto(),
                a.getNotaGeral(),
                a.getComentario(),
                a.getFotos().stream().map(foto -> foto.getUrl()).toList(),
                a.getDataAvaliacao(),
                a.getDataAtualizacao() != null);
    }
}
