package com.fourbites.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.Coordenadas;
import com.fourbites.backend.dto.EnderecoDTO;
import com.fourbites.backend.dto.HorarioDTO;
import com.fourbites.backend.dto.RestauranteFormulario;
import com.fourbites.backend.dto.RestauranteDetalheResponse;
import com.fourbites.backend.dto.RestauranteGestaoResponse;
import com.fourbites.backend.dto.RestauranteResumoResponse;
import com.fourbites.backend.dto.ResumoNotas;
import com.fourbites.backend.entity.Categoria;
import com.fourbites.backend.entity.Favorito;
import com.fourbites.backend.entity.FormaPagamento;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.RestauranteFoto;
import com.fourbites.backend.entity.RestauranteHorario;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.exception.CampoInvalidoException;
import com.fourbites.backend.exception.ConflitoException;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.repository.CategoriaRepository;
import com.fourbites.backend.repository.FavoritoRepository;
import com.fourbites.backend.repository.FormaPagamentoRepository;
import com.fourbites.backend.repository.RestauranteRepository;
import com.fourbites.backend.util.Distancia;
import com.fourbites.backend.util.Texto;
import com.fourbites.backend.util.ValidadorCnpj;

@Service
public class RestauranteService {

    private final RestauranteRepository restauranteRepository;
    private final CategoriaRepository categoriaRepository;
    private final FormaPagamentoRepository formaPagamentoRepository;
    private final NominatimService nominatimService;
    private final AvaliacaoService avaliacaoService;
    private final UploadService uploadService;
    private final RecomendacaoService recomendacaoService;
    private final FavoritoRepository favoritoRepository;

    public RestauranteService(RestauranteRepository restauranteRepository,
                              CategoriaRepository categoriaRepository,
                              FormaPagamentoRepository formaPagamentoRepository,
                              NominatimService nominatimService,
                              AvaliacaoService avaliacaoService,
                              UploadService uploadService,
                              RecomendacaoService recomendacaoService,
                              FavoritoRepository favoritoRepository) {
        this.restauranteRepository = restauranteRepository;
        this.categoriaRepository = categoriaRepository;
        this.formaPagamentoRepository = formaPagamentoRepository;
        this.nominatimService = nominatimService;
        this.avaliacaoService = avaliacaoService;
        this.uploadService = uploadService;
        this.recomendacaoService = recomendacaoService;
        this.favoritoRepository = favoritoRepository;
    }

    @Transactional
    public RestauranteGestaoResponse cadastrarPeloAdmin(RestauranteFormulario dados) {
        Restaurante restaurante = new Restaurante();

        restaurante.setCnpj(conferirCnpj(dados.cnpj(), false));
        restaurante.setCategoria(resolverCategoriaDoAdmin(dados));
        restaurante.setCategoriaSugerida(null);
        preencherDadosComuns(restaurante, dados);

        restaurante.setResponsavel(null);
        restaurante.setStatus(StatusAnalise.APROVADO);
        restaurante.setDataAnalise(OffsetDateTime.now());
        restaurante.setAtivo(true);

        Restaurante salvo = restauranteRepository.save(restaurante);
        return RestauranteGestaoResponse.de(salvo, null);
    }

    // Admin tira um restaurante do ar (ativo = false) ou devolve (ativo = true), sem apagar nada.
    @Transactional
    public RestauranteGestaoResponse alterarAtivo(Integer id, boolean ativo) {
        Restaurante restaurante = restauranteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Restaurante não encontrado."));
        restaurante.setAtivo(ativo);
        return RestauranteGestaoResponse.de(restaurante, null);
    }

    @Transactional(readOnly = true)
    public List<RestauranteResumoResponse> buscarPublicos(String busca, Integer categoriaId, String faixaPreco,
                                                          Double notaMin, boolean pets, boolean acessivel,
                                                          Double lat, Double lng, String ordem) {
        String termo = Texto.simplificar(busca);
        boolean temLocalizacao = lat != null && lng != null;

        Map<Integer, ResumoNotas> notasPorRestaurante = avaliacaoService.notasDeTodosOsRestaurantes();

        List<RestauranteResumoResponse> resultado = new ArrayList<>();
        for (Restaurante r : restauranteRepository.findByStatusAndAtivoTrue(StatusAnalise.APROVADO)) {
            if (categoriaId != null && !categoriaId.equals(r.getCategoria().getId())) {
                continue;
            }
            if (faixaPreco != null && !faixaPreco.isBlank() && !faixaPreco.equals(r.getFaixaPreco())) {
                continue;
            }
            if (pets && !r.isAceitaPets()) {
                continue;
            }
            if (acessivel && !r.isAcessivel()) {
                continue;
            }
            if (!termo.isEmpty() && !combinaComABusca(r, termo)) {
                continue;
            }

            ResumoNotas notas = notasPorRestaurante.getOrDefault(r.getId(), ResumoNotas.SEM_AVALIACOES);

            if (notaMin != null && (notas.notaMedia() == null || notas.notaMedia().doubleValue() < notaMin)) {
                continue;
            }

            BigDecimal distanciaKm = null;
            if (temLocalizacao) {
                double km = Distancia.emKm(lat, lng, r.getLatitude().doubleValue(), r.getLongitude().doubleValue());
                distanciaKm = BigDecimal.valueOf(km).setScale(1, RoundingMode.HALF_UP);
            }
            resultado.add(RestauranteResumoResponse.de(r, distanciaKm, notas));
        }

        resultado.sort(Comparator.comparing(r -> Texto.simplificar(r.nome())));

        if ("distancia".equals(ordem) && temLocalizacao) {
            resultado.sort(Comparator.comparing(RestauranteResumoResponse::distanciaKm));
        } else if ("nota".equals(ordem)) {
            
            resultado.sort(Comparator.comparing(RestauranteResumoResponse::notaMedia,
                    Comparator.nullsLast(Comparator.<BigDecimal>reverseOrder())));
        } else if ("avaliacoes".equals(ordem)) {
            resultado.sort(Comparator.comparing(RestauranteResumoResponse::totalAvaliacoes).reversed());
        }
        return resultado;
    }

    private boolean combinaComABusca(Restaurante r, String termo) {
        return Texto.simplificar(r.getNome()).contains(termo)
                || Texto.simplificar(r.getCategoria().getNome()).contains(termo)
                || Texto.simplificar(r.getBairro()).contains(termo);
    }


    @Transactional(readOnly = true)
    public RestauranteDetalheResponse buscarDetalhe(Integer id, Integer usuarioLogadoId, boolean admin) {
        Restaurante restaurante = restauranteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Restaurante não encontrado."));

        boolean publicado = restaurante.getStatus() == StatusAnalise.APROVADO && restaurante.isAtivo();
        boolean dono = restaurante.getResponsavel() != null
                && restaurante.getResponsavel().getId().equals(usuarioLogadoId);

        if (!publicado && !dono && !admin) {
            throw new RecursoNaoEncontradoException("Restaurante não encontrado.");
        }
        ResumoNotas notas = avaliacaoService.notasDoRestaurante(id);
        Integer minhaAvaliacaoId = usuarioLogadoId == null
                ? null
                : avaliacaoService.idDaAvaliacaoDoUsuario(usuarioLogadoId, id);

        // Só para usuário comum logado: o quanto combina com ele e em que posição está nos favoritos dele.
        Integer compatibilidade = recomendacaoService.compatibilidade(usuarioLogadoId, restaurante, notas.notaMedia());
        Integer favoritoPosicao = null;
        if (usuarioLogadoId != null) {
            Optional<Favorito> favorito = favoritoRepository.findByUsuarioIdAndRestauranteId(usuarioLogadoId, id);
            if (favorito.isPresent()) {
                favoritoPosicao = favorito.get().getPosicao();
            }
        }

        return RestauranteDetalheResponse.de(restaurante, notas, minhaAvaliacaoId, compatibilidade, favoritoPosicao);
    }

    // Copia os dados do formulário para o restaurante
    public void preencherDadosComuns(Restaurante restaurante, RestauranteFormulario dados) {
        EnderecoDTO endereco = dados.endereco();

 
        uploadService.conferirEnderecos("fotos", dados.fotos());
        uploadService.conferirEndereco("cardapioUrl", dados.cardapioUrl());

        restaurante.setNome(dados.nome().trim());
        restaurante.setDescricao(dados.descricao().trim());
        restaurante.setTelefone(dados.telefone().trim());
        restaurante.setFaixaPreco(dados.faixaPreco());
        restaurante.setAceitaPets(dados.aceitaPets());
        restaurante.setAcessivel(dados.acessivel());
        restaurante.setDataFundacao(dados.dataFundacao().withDayOfMonth(1)); 
        restaurante.setCardapioUrl(textoOuNulo(dados.cardapioUrl()));
        restaurante.setCardapioLink(textoOuNulo(dados.cardapioLink()));

        restaurante.setCep(formatarCep(endereco.cep()));
        restaurante.setLogradouro(endereco.logradouro().trim());
        restaurante.setNumero(endereco.numero().trim());
        restaurante.setComplemento(textoOuNulo(endereco.complemento()));
        restaurante.setBairro(endereco.bairro().trim());
        restaurante.setCidade(endereco.cidade().trim());
        restaurante.setUf(endereco.uf().toUpperCase());

        Coordenadas coordenadas = nominatimService
                .buscar(restaurante.getLogradouro(), restaurante.getNumero(), restaurante.getBairro(),
                        restaurante.getCidade(), restaurante.getUf())
                .orElseThrow(() -> new CampoInvalidoException("endereco",
                        "Não foi possível localizar este endereço no mapa. Confira os dados e tente de novo."));
        restaurante.setLatitude(coordenadas.latitude());
        restaurante.setLongitude(coordenadas.longitude());

        restaurante.getFormasPagamento().clear();
        restaurante.getFormasPagamento().addAll(buscarFormasPagamento(dados.formasPagamentoIds()));

        restaurante.getHorarios().clear();
        for (HorarioDTO horario : dados.horarios()) {
            RestauranteHorario novo = new RestauranteHorario();
            novo.setRestaurante(restaurante);
            novo.setDiaSemana(horario.diaSemana());
            novo.setAbertura(horario.abertura());
            novo.setFechamento(horario.fechamento());
            restaurante.getHorarios().add(novo);
        }

        restaurante.getFotos().clear();
        List<String> fotos = dados.fotos() == null ? List.of() : dados.fotos();
        for (int i = 0; i < fotos.size(); i++) {
            RestauranteFoto foto = new RestauranteFoto();
            foto.setRestaurante(restaurante);
            foto.setUrl(fotos.get(i).trim());
            foto.setOrdem(i + 1);
            restaurante.getFotos().add(foto);
        }
    }

    public String conferirCnpj(String cnpjInformado, boolean obrigatorio) {
        if (cnpjInformado == null || cnpjInformado.isBlank()) {
            if (obrigatorio) {
                throw new CampoInvalidoException("cnpj", "O CNPJ é obrigatório.");
            }
            return null;
        }
        if (!ValidadorCnpj.valido(cnpjInformado)) {
            throw new CampoInvalidoException("cnpj", "Este CNPJ não é válido. Confira os números.");
        }
        String cnpj = ValidadorCnpj.somenteDigitos(cnpjInformado);
        if (restauranteRepository.existsByCnpj(cnpj)) {
            throw new ConflitoException("Já existe um restaurante cadastrado com este CNPJ.");
        }
        return cnpj;
    }

    // Categoria escolhida pelo admin
    public Categoria resolverCategoriaDoAdmin(RestauranteFormulario dados) {
        if (dados.categoriaId() != null) {
            return categoriaRepository.findById(dados.categoriaId())
                    .orElseThrow(() -> new CampoInvalidoException("categoriaId", "A categoria escolhida não existe."));
        }
        String sugerida = textoOuNulo(dados.categoriaSugerida());
        if (sugerida == null) {
            throw new CampoInvalidoException("categoriaId", "Escolha uma categoria ou informe uma nova.");
        }
        return categoriaRepository.findByNomeIgnoreCase(sugerida)
                .orElseGet(() -> {
                    Categoria nova = new Categoria();
                    nova.setNome(sugerida);
                    return categoriaRepository.save(nova);
                });
    }

    private Set<FormaPagamento> buscarFormasPagamento(List<Integer> ids) {
        Set<Integer> semRepetidos = new HashSet<>(ids);
        List<FormaPagamento> encontradas = formaPagamentoRepository.findAllById(semRepetidos);
        if (encontradas.size() != semRepetidos.size()) {
            throw new CampoInvalidoException("formasPagamentoIds", "Uma das formas de pagamento não existe.");
        }
        return new HashSet<>(encontradas);
    }

    // "11010001" ou "11010-001" viram sempre "11010-001".
    private String formatarCep(String cep) {
        String digitos = cep.replaceAll("[^0-9]", "");
        return digitos.substring(0, 5) + "-" + digitos.substring(5);
    }

    private String textoOuNulo(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        return texto.trim();
    }
}
