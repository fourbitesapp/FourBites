package com.fourbites.backend.service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.ListaRequest;
import com.fourbites.backend.dto.ListaResponse;
import com.fourbites.backend.dto.RestauranteResumoResponse;
import com.fourbites.backend.dto.ResumoNotas;
import com.fourbites.backend.dto.UsuarioResumoResponse;
import com.fourbites.backend.entity.Lista;
import com.fourbites.backend.entity.ListaRestaurante;
import com.fourbites.backend.entity.ListaSeguidor;
import com.fourbites.backend.entity.ListaSeguidorId;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.ConflitoException;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.exception.RegraNegocioException;
import com.fourbites.backend.exception.SemPermissaoException;
import com.fourbites.backend.repository.ListaRepository;
import com.fourbites.backend.repository.ListaSeguidorRepository;
import com.fourbites.backend.repository.RestauranteRepository;
import com.fourbites.backend.repository.UsuarioRepository;

// Listas de restaurantes do usuário. Pública: todos veem no perfil. Privada: só o dono.
// Sem limite de listas nem de restaurantes; o mesmo restaurante pode estar em várias listas (uma vez em cada).
// Restaurante que deixa de estar publicado (inativo, por exemplo) some da lista sem ser apagado.
@Service
public class ListaService {

    private static final int CAPAS = 4;

    private final ListaRepository listaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RestauranteRepository restauranteRepository;
    private final AvaliacaoService avaliacaoService;
    private final ListaSeguidorRepository listaSeguidorRepository;

    public ListaService(ListaRepository listaRepository, UsuarioRepository usuarioRepository,
                        RestauranteRepository restauranteRepository, AvaliacaoService avaliacaoService,
                        ListaSeguidorRepository listaSeguidorRepository) {
        this.listaRepository = listaRepository;
        this.usuarioRepository = usuarioRepository;
        this.restauranteRepository = restauranteRepository;
        this.avaliacaoService = avaliacaoService;
        this.listaSeguidorRepository = listaSeguidorRepository;
    }

    // Todas as listas do usuário logado (públicas e privadas).
    @Transactional(readOnly = true)
    public List<ListaResponse> listarMinhas(Integer usuarioId) {
        return listaRepository.findByUsuarioIdOrderByDataAtualizacaoDesc(usuarioId).stream()
                .map(lista -> resumo(lista, usuarioId))
                .toList();
    }

    // Perfil público: só as listas públicas (o próprio dono vê todas pelo /usuarios/me/listas).
    @Transactional(readOnly = true)
    public List<ListaResponse> listarPublicasDoUsuario(String username, Integer usuarioLogadoId) {
        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        return listaRepository.findByUsuarioIdAndPublicaTrueOrderByDataAtualizacaoDesc(usuario.getId()).stream()
                .map(lista -> resumo(lista, usuarioLogadoId))
                .toList();
    }

    // Home: listas públicas do perfil oficial (o Farelo).
    @Transactional(readOnly = true)
    public List<ListaResponse> listarOficiais(Integer usuarioLogadoId) {
        return listaRepository.findByUsuarioOficialTrueAndPublicaTrueOrderByDataAtualizacaoDesc().stream()
                .map(lista -> resumo(lista, usuarioLogadoId))
                .toList();
    }

    // Perfil: listas (públicas) que o usuário segue.
    @Transactional(readOnly = true)
    public List<ListaResponse> listarSeguidasPor(String username, Integer usuarioLogadoId) {
        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        return listaRepository.seguidasPor(usuario.getId()).stream()
                .map(lista -> resumo(lista, usuarioLogadoId))
                .toList();
    }

    // Seguir: só listas públicas e de outra pessoa. Seguir de novo não duplica.
    @Transactional
    public void seguir(Integer id, Integer usuarioId) {
        Lista lista = listaRepository.findById(id)
                .filter(Lista::isPublica)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Lista não encontrada."));
        if (ehDono(lista, usuarioId)) {
            throw new RegraNegocioException("Você não pode seguir a sua própria lista.");
        }
        if (!listaSeguidorRepository.existsByUsuarioIdAndListaId(usuarioId, id)) {
            listaSeguidorRepository.save(new ListaSeguidor(usuarioId, id));
        }
    }

    @Transactional
    public void deixarDeSeguir(Integer id, Integer usuarioId) {
        listaSeguidorRepository.deleteById(new ListaSeguidorId(usuarioId, id));
    }

    // Lista privada de outra pessoa responde 404, como se não existisse.
    @Transactional(readOnly = true)
    public ListaResponse buscar(Integer id, Integer usuarioLogadoId) {
        Lista lista = listaRepository.findById(id)
                .filter(l -> l.isPublica() || ehDono(l, usuarioLogadoId))
                .orElseThrow(() -> new RecursoNaoEncontradoException("Lista não encontrada."));
        return completa(lista, usuarioLogadoId);
    }

    @Transactional
    public ListaResponse criar(Integer usuarioId, ListaRequest dados) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        Lista lista = new Lista();
        lista.setUsuario(usuario);
        preencher(lista, dados);
        listaRepository.save(lista);
        return completa(lista, usuarioId);
    }

    @Transactional
    public ListaResponse atualizar(Integer id, Integer usuarioId, ListaRequest dados) {
        Lista lista = buscarMinha(id, usuarioId);
        preencher(lista, dados);
        return completa(lista, usuarioId);
    }

    @Transactional
    public void excluir(Integer id, Integer usuarioId) {
        listaRepository.delete(buscarMinha(id, usuarioId));
    }

    @Transactional
    public ListaResponse adicionar(Integer id, Integer usuarioId, Integer restauranteId) {
        Lista lista = buscarMinha(id, usuarioId);
        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .filter(this::publicado)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Restaurante não encontrado."));
        boolean jaEsta = lista.getItens().stream().anyMatch(i -> i.getRestaurante().getId().equals(restauranteId));
        if (jaEsta) {
            throw new ConflitoException("Este restaurante já está na lista.");
        }
        lista.getItens().add(0, new ListaRestaurante(lista, restaurante));
        lista.setDataAtualizacao(OffsetDateTime.now());
        listaRepository.flush();
        return completa(lista, usuarioId);
    }

    @Transactional
    public ListaResponse remover(Integer id, Integer usuarioId, Integer restauranteId) {
        Lista lista = buscarMinha(id, usuarioId);
        lista.getItens().removeIf(i -> i.getRestaurante().getId().equals(restauranteId));
        lista.setDataAtualizacao(OffsetDateTime.now());
        return completa(lista, usuarioId);
    }

    // ---------- Apoio ----------

    private void preencher(Lista lista, ListaRequest dados) {
        lista.setNome(dados.nome().trim());
        lista.setDescricao(vazioParaNulo(dados.descricao()));
        lista.setCor(vazioParaNulo(dados.cor()));
        lista.setIcone(vazioParaNulo(dados.icone()));
        lista.setPublica(dados.publica());
    }

    private Lista buscarMinha(Integer id, Integer usuarioId) {
        Lista lista = listaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Lista não encontrada."));
        if (!ehDono(lista, usuarioId)) {
            // Privada de outra pessoa: 404 (não revela que existe). Pública: 403.
            if (!lista.isPublica()) {
                throw new RecursoNaoEncontradoException("Lista não encontrada.");
            }
            throw new SemPermissaoException("Só quem criou a lista pode mudar ela.");
        }
        return lista;
    }

    private boolean ehDono(Lista lista, Integer usuarioId) {
        return usuarioId != null && lista.getUsuario().getId().equals(usuarioId);
    }

    private boolean publicado(Restaurante restaurante) {
        return restaurante.getStatus() == StatusAnalise.APROVADO && restaurante.isAtivo();
    }

    private List<Restaurante> restaurantesPublicados(Lista lista) {
        return lista.getItens().stream().map(ListaRestaurante::getRestaurante).filter(this::publicado).toList();
    }

    private ListaResponse resumo(Lista lista, Integer usuarioLogadoId) {
        return montar(lista, usuarioLogadoId, null);
    }

    private ListaResponse completa(Lista lista, Integer usuarioLogadoId) {
        Map<Integer, ResumoNotas> notas = avaliacaoService.notasDeTodosOsRestaurantes();
        List<RestauranteResumoResponse> restaurantes = restaurantesPublicados(lista).stream()
                .map(r -> RestauranteResumoResponse.de(r, null, notas.getOrDefault(r.getId(), ResumoNotas.SEM_AVALIACOES)))
                .toList();
        return montar(lista, usuarioLogadoId, restaurantes);
    }

    private ListaResponse montar(Lista lista, Integer usuarioLogadoId, List<RestauranteResumoResponse> restaurantes) {
        List<Restaurante> publicados = restaurantesPublicados(lista);
        List<String> capas = publicados.stream()
                .filter(r -> !r.getFotos().isEmpty())
                .map(r -> r.getFotos().get(0).getUrl())
                .limit(CAPAS)
                .toList();
        boolean minha = ehDono(lista, usuarioLogadoId);
        boolean seguindo = usuarioLogadoId != null && !minha
                && listaSeguidorRepository.existsByUsuarioIdAndListaId(usuarioLogadoId, lista.getId());
        return new ListaResponse(lista.getId(), lista.getNome(), lista.getDescricao(), lista.getCor(), lista.getIcone(),
                lista.isPublica(), publicados.size(), capas, UsuarioResumoResponse.de(lista.getUsuario()),
                minha, seguindo, lista.getDataAtualizacao(), restaurantes);
    }

    private String vazioParaNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}

