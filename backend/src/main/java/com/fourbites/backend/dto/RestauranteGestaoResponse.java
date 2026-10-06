package com.fourbites.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

import com.fourbites.backend.entity.Categoria;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.RestauranteAlteracao;
import com.fourbites.backend.entity.RestauranteFoto;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.entity.Usuario;

// Tudo o que o responsável e o admin veem.

public record RestauranteGestaoResponse(

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
        Medias medias,             
        Integer responsavelId,
        Integer compatibilidade,   
        Integer favoritoPosicao,
        Integer minhaAvaliacaoId,
   
        String cnpj,
        String motivoRejeicao,
        OffsetDateTime dataEnvio,
        OffsetDateTime dataAnalise,
        Responsavel responsavel,
        AlteracaoPendente alteracaoPendente
) {

    public record Medias(BigDecimal comida, BigDecimal ambiente, BigDecimal atendimento, BigDecimal custo) {
    }

    public record Responsavel(Integer id, String nome, String email, String telefone) {
    }

    public record AlteracaoPendente(Integer id, StatusAnalise status, OffsetDateTime dataEnvio,
                                    String motivoRejeicao) {
    }

    
    public static RestauranteGestaoResponse de(Restaurante r, RestauranteAlteracao alteracao) {
        Categoria categoria = r.getCategoria();
        Usuario responsavel = r.getResponsavel();
        List<String> fotos = r.getFotos().stream().map(RestauranteFoto::getUrl).toList();

        return new RestauranteGestaoResponse(
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
                responsavel == null ? null : responsavel.getId(),
                null,
                null,
                null,
                r.getCnpj(),
                r.getMotivoRejeicao(),
                r.getDataCadastro(),
                r.getDataAnalise(),
                responsavel == null ? null : new Responsavel(responsavel.getId(), responsavel.getNome(),
                        responsavel.getEmail(), responsavel.getTelefone()),
                alteracao == null ? null : new AlteracaoPendente(alteracao.getId(), alteracao.getStatus(),
                        alteracao.getDataEnvio(), alteracao.getMotivoRejeicao()));
    }
}
