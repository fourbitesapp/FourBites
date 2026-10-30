package com.fourbites.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import com.fourbites.backend.entity.Categoria;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.StatusAnalise;

public record RestauranteResumoResponse(
        Integer id,
        String nome,
        CategoriaResponse categoria,
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
        boolean estacionamento,
        boolean areaCriancas,
        boolean areaFumantes,
        StatusAnalise status,
        boolean ativo
) {

    public static RestauranteResumoResponse de(Restaurante r, BigDecimal distanciaKm, ResumoNotas notas) {
        Categoria categoria = r.getCategoria();
        List<String> fotos = r.getFotos().stream().map(foto -> foto.getUrl()).toList();

        return new RestauranteResumoResponse(
                r.getId(),
                r.getNome(),
                CategoriaResponse.de(categoria),
                r.getCategoriaSugerida(),
                r.getFaixaPreco(),
                r.getBairro(),
                r.getCidade(),
                notas.notaMedia(),
                notas.totalAvaliacoes(),
                fotos.isEmpty() ? null : fotos.get(0),
                r.getLatitude(),
                r.getLongitude(),
                distanciaKm,
                r.isAceitaPets(),
                r.isAcessivel(),
                r.isEstacionamento(),
                r.isAreaCriancas(),
                r.isAreaFumantes(),
                r.getStatus(),
                r.isAtivo());
    }
}
