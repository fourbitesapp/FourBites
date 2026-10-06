package com.fourbites.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import com.fourbites.backend.entity.Categoria;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.StatusAnalise;

public record RestauranteResumoResponse(
        Integer id,
        String nome,
        OpcaoResponse categoria,
        String categoriaSugerida,
        String faixaPreco,
        String bairro,
        String cidade,
        BigDecimal notaMedia,      
        long totalAvaliacoes,
        String fotoCapa,
        BigDecimal latitude,
        BigDecimal longitude,
        BigDecimal distanciaKm,     
        boolean aceitaPets,
        boolean acessivel,
        StatusAnalise status,
        boolean ativo
) {

    public static RestauranteResumoResponse de(Restaurante r, BigDecimal distanciaKm) {
        Categoria categoria = r.getCategoria();
        List<String> fotos = r.getFotos().stream().map(foto -> foto.getUrl()).toList();

        return new RestauranteResumoResponse(
                r.getId(),
                r.getNome(),
                categoria == null ? null : new OpcaoResponse(categoria.getId(), categoria.getNome()),
                r.getCategoriaSugerida(),
                r.getFaixaPreco(),
                r.getBairro(),
                r.getCidade(),
                null,
                0,
                fotos.isEmpty() ? null : fotos.get(0),
                r.getLatitude(),
                r.getLongitude(),
                distanciaKm,
                r.isAceitaPets(),
                r.isAcessivel(),
                r.getStatus(),
                r.isAtivo());
    }
}
