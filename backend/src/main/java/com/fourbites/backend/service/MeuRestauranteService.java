package com.fourbites.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.RestauranteFormulario;
import com.fourbites.backend.dto.RestauranteGestaoResponse;
import com.fourbites.backend.dto.ResumoNotas;
import com.fourbites.backend.entity.Categoria;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.RestauranteAlteracao;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.CampoInvalidoException;
import com.fourbites.backend.exception.ConflitoException;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.exception.RegraNegocioException;
import com.fourbites.backend.exception.SemPermissaoException;
import com.fourbites.backend.repository.CategoriaRepository;
import com.fourbites.backend.repository.RestauranteAlteracaoRepository;
import com.fourbites.backend.repository.RestauranteRepository;
import com.fourbites.backend.repository.UsuarioRepository;

import tools.jackson.databind.json.JsonMapper;

// Área do responsável (conta RESTAURANTE): cadastrar, ver e editar os próprios restaurantes.
@Service
public class MeuRestauranteService {

    private final RestauranteRepository restauranteRepository;
    private final RestauranteAlteracaoRepository alteracaoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RestauranteService restauranteService;
    private final AvaliacaoService avaliacaoService;
    private final JsonMapper jsonMapper;

    public MeuRestauranteService(RestauranteRepository restauranteRepository,
                                 RestauranteAlteracaoRepository alteracaoRepository,
                                 CategoriaRepository categoriaRepository,
                                 UsuarioRepository usuarioRepository,
                                 RestauranteService restauranteService,
                                 AvaliacaoService avaliacaoService,
                                 JsonMapper jsonMapper) {
        this.restauranteRepository = restauranteRepository;
        this.alteracaoRepository = alteracaoRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.restauranteService = restauranteService;
        this.avaliacaoService = avaliacaoService;
        this.jsonMapper = jsonMapper;
    }

    @Transactional(readOnly = true)
    public List<RestauranteGestaoResponse> listar(Integer responsavelId) {
        return restauranteRepository.findByResponsavelIdOrderByDataCadastroDesc(responsavelId).stream()
                .map(this::paraResposta)
                .toList();
    }

    @Transactional(readOnly = true)
    public RestauranteGestaoResponse buscar(Integer responsavelId, Integer restauranteId) {
        return paraResposta(buscarDoResponsavel(responsavelId, restauranteId));
    }

    @Transactional
    public RestauranteGestaoResponse cadastrar(Integer responsavelId, RestauranteFormulario dados) {
        Usuario responsavel = usuarioRepository.findById(responsavelId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));

        Restaurante restaurante = new Restaurante();
        restaurante.setCnpj(restauranteService.conferirCnpj(dados.cnpj(), true));
        preencherCategoria(restaurante, dados);
        restauranteService.preencherDadosComuns(restaurante, dados);

        restaurante.setResponsavel(responsavel);
        restaurante.setStatus(StatusAnalise.PENDENTE);
        restaurante.setAtivo(true);

        return paraResposta(restauranteRepository.save(restaurante));
    }

    @Transactional
    public RestauranteGestaoResponse editar(Integer responsavelId, Integer restauranteId, RestauranteFormulario dados) {
        Restaurante restaurante = buscarDoResponsavel(responsavelId, restauranteId);

        switch (restaurante.getStatus()) {
            case PENDENTE -> throw new RegraNegocioException(
                    "Este cadastro está em análise. Aguarde a resposta do administrador para editar.");

            case REJEITADO -> {
                preencherCategoria(restaurante, dados);
                restauranteService.preencherDadosComuns(restaurante, dados);
                restaurante.setStatus(StatusAnalise.PENDENTE);
                restaurante.setMotivoRejeicao(null);
                restaurante.setDataAnalise(null);
            }

            case APROVADO -> {
                if (alteracaoRepository.existsByRestauranteIdAndStatus(restauranteId, StatusAnalise.PENDENTE)) {
                    throw new ConflitoException("Já existe uma alteração em análise para este restaurante.");
                }
                conferirAntesDeGuardar(dados);

                RestauranteAlteracao alteracao = new RestauranteAlteracao();
                alteracao.setRestaurante(restaurante);
                alteracao.setDados(jsonMapper.writeValueAsString(dados));
                alteracao.setStatus(StatusAnalise.PENDENTE);
                alteracaoRepository.save(alteracao);
            }
        }
        return paraResposta(restaurante);
    }

    private void conferirAntesDeGuardar(RestauranteFormulario dados) {
        Restaurante rascunho = new Restaurante();
        preencherCategoria(rascunho, dados);
        restauranteService.preencherDadosComuns(rascunho, dados);
    }

    private void preencherCategoria(Restaurante restaurante, RestauranteFormulario dados) {
        if (dados.categoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dados.categoriaId())
                    .orElseThrow(() -> new CampoInvalidoException("categoriaId", "A categoria escolhida não existe."));
            restaurante.setCategoria(categoria);
            restaurante.setCategoriaSugerida(null);
            return;
        }
        if (dados.categoriaSugerida() == null || dados.categoriaSugerida().isBlank()) {
            throw new CampoInvalidoException("categoriaId", "Escolha uma categoria ou informe uma nova.");
        }
        restaurante.setCategoria(null);
        restaurante.setCategoriaSugerida(dados.categoriaSugerida().trim());
    }

    // 404 se não existe; 403 se é de outro responsável.
    private Restaurante buscarDoResponsavel(Integer responsavelId, Integer restauranteId) {
        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Restaurante não encontrado."));
        if (restaurante.getResponsavel() == null || !restaurante.getResponsavel().getId().equals(responsavelId)) {
            throw new SemPermissaoException("Este restaurante não é seu.");
        }
        return restaurante;
    }

    // A resposta leva a alteração mais recente (pendente ou rejeitada, com o motivo).
    private RestauranteGestaoResponse paraResposta(Restaurante restaurante) {
        RestauranteAlteracao ultima = restaurante.getId() == null
                ? null
                : alteracaoRepository.findFirstByRestauranteIdOrderByDataEnvioDesc(restaurante.getId())
                        .filter(a -> a.getStatus() != StatusAnalise.APROVADO)
                        .orElse(null);
        // Nota média e total de avaliações (restaurante recém-criado ainda não tem id antes de salvar).
        ResumoNotas notas = restaurante.getId() == null
                ? ResumoNotas.SEM_AVALIACOES
                : avaliacaoService.notasDoRestaurante(restaurante.getId());
        return RestauranteGestaoResponse.de(restaurante, ultima, notas);
    }
}
