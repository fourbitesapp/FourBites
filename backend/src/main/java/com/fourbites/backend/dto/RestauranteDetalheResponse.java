package com.fourbites.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fourbites.backend.entity.Categoria;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.StatusAnalise;


public record RestauranteDetalheResponse(

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
        boolean ativo,

        String descricao,
        String telefone,
        LocalDate dataFundacao,
        EnderecoDTO endereco,
        List<HorarioDTO> horarios,
        List<OpcaoResponse> formasPagamento,
        List<String> fotos,
        String cardapioUrl,
        String cardapioLink,
        RestauranteGestaoResponse.Medias medias, 
        Integer responsavelId,
        Integer compatibilidade,   
        Integer favoritoPosicao,
        Integer minhaAvaliacaoId
) {

    public static RestauranteDetalheResponse de(Restaurante r) {
        Categoria categoria = r.getCategoria();
        List<String> fotos = r.getFotos().stream().map(foto -> foto.getUrl()).toList();

        return new RestauranteDetalheResponse(
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
                null,
                r.isAceitaPets(),
                r.isAcessivel(),
                r.getStatus(),
                r.isAtivo(),
                r.getDescricao(),
                r.getTelefone(),
                r.getDataFundacao(),
                new EnderecoDTO(r.getCep(), r.getLogradouro(), r.getNumero(),
                        r.getComplemento() == null ? "" : r.getComplemento(),
                        r.getBairro(), r.getCidade(), r.getUf()),
                r.getHorarios().stream()
                        .map(h -> new HorarioDTO(h.getDiaSemana(), h.getAbertura(), h.getFechamento()))
                        .toList(),
                r.getFormasPagamento().stream()
                        .map(f -> new OpcaoResponse(f.getId(), f.getNome()))
                        .sorted((a, b) -> a.id().compareTo(b.id()))
                        .toList(),
                fotos,
                r.getCardapioUrl(),
                r.getCardapioLink(),
                null,
                r.getResponsavel() == null ? null : r.getResponsavel().getId(),
                null,
                null,
                null);
    }
}
