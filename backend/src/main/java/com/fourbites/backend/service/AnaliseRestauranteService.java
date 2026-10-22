package com.fourbites.backend.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.AlteracaoResponse;
import com.fourbites.backend.dto.AprovarCadastroRequest;
import com.fourbites.backend.dto.RestauranteFormulario;
import com.fourbites.backend.dto.RestauranteGestaoResponse;
import com.fourbites.backend.dto.ResumoNotas;
import com.fourbites.backend.entity.Categoria;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.RestauranteAlteracao;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.exception.CampoInvalidoException;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.exception.RegraNegocioException;
import com.fourbites.backend.repository.CategoriaRepository;
import com.fourbites.backend.repository.RestauranteAlteracaoRepository;
import com.fourbites.backend.repository.RestauranteRepository;
import com.fourbites.backend.util.Texto;

import tools.jackson.databind.json.JsonMapper;

// Painel admin: lista de restaurantes, fila de cadastros e fila de alterações (aprovar ou rejeitar).
@Service
public class AnaliseRestauranteService {

    private final RestauranteRepository restauranteRepository;
    private final RestauranteAlteracaoRepository alteracaoRepository;
    private final CategoriaRepository categoriaRepository;
    private final RestauranteService restauranteService;
    private final AvaliacaoService avaliacaoService;
    private final JsonMapper jsonMapper;

    public AnaliseRestauranteService(RestauranteRepository restauranteRepository,
                                     RestauranteAlteracaoRepository alteracaoRepository,
                                     CategoriaRepository categoriaRepository,
                                     RestauranteService restauranteService,
                                     AvaliacaoService avaliacaoService,
                                 JsonMapper jsonMapper) {
        this.restauranteRepository = restauranteRepository;
        this.alteracaoRepository = alteracaoRepository;
        this.categoriaRepository = categoriaRepository;
        this.restauranteService = restauranteService;
        this.avaliacaoService = avaliacaoService;
        this.jsonMapper = jsonMapper;
    }

    // ---------- Restaurantes ----------

    // status vazio = todos (por nome); PENDENTE = fila, do mais antigo para o mais novo.
    // busca procura no nome, no bairro, na categoria e na categoria sugerida.
    @Transactional(readOnly = true)
    public List<RestauranteGestaoResponse> listar(StatusAnalise status, String busca) {
        List<Restaurante> restaurantes = status == null
                ? restauranteRepository.findAllByOrderByNomeAsc()
                : restauranteRepository.findByStatusOrderByDataCadastroAsc(status);
        String termo = Texto.simplificar(busca);

        return restaurantes.stream()
                .filter(r -> termo.isEmpty() || combina(r, termo))
                .map(this::paraResposta)
                .toList();
    }

    @Transactional(readOnly = true)
    public RestauranteGestaoResponse buscar(Integer id) {
        return paraResposta(buscarRestaurante(id));
    }

    // Só cadastros PENDENTES. A categoria precisa ficar definida: a que o responsável escolheu,
    // uma existente (categoriaId) ou uma nova (novaCategoria).
    @Transactional
    public RestauranteGestaoResponse aprovarCadastro(Integer id, AprovarCadastroRequest dados) {
        Restaurante restaurante = buscarRestaurante(id);
        exigirPendente(restaurante);

        Categoria categoria = resolverCategoria(restaurante, dados);
        restaurante.setCategoria(categoria);
        restaurante.setCategoriaSugerida(null);
        restaurante.setStatus(StatusAnalise.APROVADO);
        restaurante.setMotivoRejeicao(null);
        restaurante.setDataAnalise(OffsetDateTime.now());
        return paraResposta(restaurante);
    }

    @Transactional
    public RestauranteGestaoResponse rejeitarCadastro(Integer id, String motivo) {
        Restaurante restaurante = buscarRestaurante(id);
        exigirPendente(restaurante);

        restaurante.setStatus(StatusAnalise.REJEITADO);
        restaurante.setMotivoRejeicao(motivo.trim());
        restaurante.setDataAnalise(OffsetDateTime.now());
        return paraResposta(restaurante);
    }

    // ---------- Alterações de restaurantes aprovados ----------

    @Transactional(readOnly = true)
    public List<AlteracaoResponse> listarAlteracoes(StatusAnalise status) {
        StatusAnalise filtro = status == null ? StatusAnalise.PENDENTE : status;
        return alteracaoRepository.findByStatusOrderByDataEnvioAsc(filtro).stream()
                .map(a -> new AlteracaoResponse(a.getId(), a.getDataEnvio(), a.getStatus(),
                        RestauranteGestaoResponse.de(a.getRestaurante(), a), lerProposta(a)))
                .toList();
    }

    @Transactional
    public void aprovarAlteracao(Integer id) {
        RestauranteAlteracao alteracao = buscarAlteracaoPendente(id);
        RestauranteFormulario proposto = lerProposta(alteracao);
        Restaurante restaurante = alteracao.getRestaurante();

        restaurante.setCategoria(restauranteService.resolverCategoriaDoAdmin(proposto));
        restaurante.setCategoriaSugerida(null);
        restauranteService.preencherDadosComuns(restaurante, proposto);

        alteracao.setStatus(StatusAnalise.APROVADO);
        alteracao.setDataAnalise(OffsetDateTime.now());
    }

    @Transactional
    public void rejeitarAlteracao(Integer id, String motivo) {
        RestauranteAlteracao alteracao = buscarAlteracaoPendente(id);
        alteracao.setStatus(StatusAnalise.REJEITADO);
        alteracao.setMotivoRejeicao(motivo.trim());
        alteracao.setDataAnalise(OffsetDateTime.now());
    }

    // ---------- Apoio ----------

    private Categoria resolverCategoria(Restaurante restaurante, AprovarCadastroRequest dados) {
        if (dados != null && dados.categoriaId() != null) {
            return categoriaRepository.findById(dados.categoriaId())
                    .orElseThrow(() -> new CampoInvalidoException("categoriaId", "A categoria escolhida não existe."));
        }
        if (dados != null && dados.novaCategoria() != null && !dados.novaCategoria().isBlank()) {
            String nome = dados.novaCategoria().trim();
            return categoriaRepository.findByNomeIgnoreCase(nome).orElseGet(() -> {
                Categoria nova = new Categoria();
                nova.setNome(nome);
                return categoriaRepository.save(nova);
            });
        }
        if (restaurante.getCategoria() == null) {
            throw new CampoInvalidoException("categoriaId",
                    "Este cadastro sugeriu uma categoria nova. Crie a categoria ou escolha uma existente.");
        }
        return restaurante.getCategoria();
    }

    private void exigirPendente(Restaurante restaurante) {
        if (restaurante.getStatus() != StatusAnalise.PENDENTE) {
            throw new RegraNegocioException("Este cadastro não está aguardando análise.");
        }
    }

    private Restaurante buscarRestaurante(Integer id) {
        return restauranteRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Restaurante não encontrado."));
    }

    private RestauranteAlteracao buscarAlteracaoPendente(Integer id) {
        RestauranteAlteracao alteracao = alteracaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Alteração não encontrada."));
        if (alteracao.getStatus() != StatusAnalise.PENDENTE) {
            throw new RegraNegocioException("Esta alteração não está aguardando análise.");
        }
        return alteracao;
    }

    private RestauranteFormulario lerProposta(RestauranteAlteracao alteracao) {
        return jsonMapper.readValue(alteracao.getDados(), RestauranteFormulario.class);
    }

    private RestauranteGestaoResponse paraResposta(Restaurante restaurante) {
        RestauranteAlteracao pendente = alteracaoRepository
                .findFirstByRestauranteIdOrderByDataEnvioDesc(restaurante.getId())
                .filter(a -> a.getStatus() == StatusAnalise.PENDENTE)
                .orElse(null);
        // Nota média e total de avaliações 
        ResumoNotas notas = restaurante.getId() == null
                ? ResumoNotas.SEM_AVALIACOES
                : avaliacaoService.notasDoRestaurante(restaurante.getId());
        return RestauranteGestaoResponse.de(restaurante, pendente, notas);
    }

    private boolean combina(Restaurante r, String termo) {
        return Texto.simplificar(r.getNome()).contains(termo)
                || Texto.simplificar(r.getBairro()).contains(termo)
                || (r.getCategoria() != null && Texto.simplificar(r.getCategoria().getNome()).contains(termo))
                || Texto.simplificar(r.getCategoriaSugerida()).contains(termo);
    }
}
