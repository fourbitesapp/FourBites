package com.fourbites.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.FavoritoResponse;
import com.fourbites.backend.dto.RestauranteResumoResponse;
import com.fourbites.backend.entity.Favorito;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.CampoInvalidoException;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.repository.FavoritoRepository;
import com.fourbites.backend.repository.RestauranteRepository;
import com.fourbites.backend.repository.UsuarioRepository;

@Service
public class FavoritoService {

    private static final int MAXIMO_FAVORITOS = 4;

    private final FavoritoRepository favoritoRepository;
    private final RestauranteRepository restauranteRepository;
    private final UsuarioRepository usuarioRepository;
    private final AvaliacaoService avaliacaoService;

    public FavoritoService(FavoritoRepository favoritoRepository,
                           RestauranteRepository restauranteRepository,
                           UsuarioRepository usuarioRepository,
                           AvaliacaoService avaliacaoService) {
        this.favoritoRepository = favoritoRepository;
        this.restauranteRepository = restauranteRepository;
        this.usuarioRepository = usuarioRepository;
        this.avaliacaoService = avaliacaoService;
    }

    // Favoritos do usuário logado.
    @Transactional(readOnly = true)
    public List<FavoritoResponse> listarMeus(Integer usuarioId) {
        return montarLista(usuarioId);
    }

    @Transactional(readOnly = true)
    public List<FavoritoResponse> listarDoUsuario(String username) {
        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        return montarLista(usuario.getId());
    }

    @Transactional
    public List<FavoritoResponse> colocar(Integer usuarioId, Integer posicao, Integer restauranteId) {
        conferirPosicao(posicao);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .filter(this::publicado)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Restaurante não encontrado."));

        Optional<Favorito> naPosicao = favoritoRepository.findByUsuarioIdAndPosicao(usuarioId, posicao);
        Optional<Favorito> doRestaurante = favoritoRepository.findByUsuarioIdAndRestauranteId(usuarioId, restauranteId);

        if (doRestaurante.isPresent() && doRestaurante.get().getPosicao().equals(posicao)) {
            return montarLista(usuarioId);
        }

        Integer posicaoAntiga = doRestaurante.map(Favorito::getPosicao).orElse(null);
        Restaurante quemSai = naPosicao.map(Favorito::getRestaurante).orElse(null);

        naPosicao.ifPresent(favoritoRepository::delete);
        doRestaurante.ifPresent(favoritoRepository::delete);
        favoritoRepository.flush();

        favoritoRepository.save(new Favorito(usuario, restaurante, posicao));
        if (posicaoAntiga != null && quemSai != null) {
            favoritoRepository.save(new Favorito(usuario, quemSai, posicaoAntiga));
        }

        return montarLista(usuarioId);
    }

    // Esvazia uma posição.
    @Transactional
    public List<FavoritoResponse> remover(Integer usuarioId, Integer posicao) {
        conferirPosicao(posicao);
        favoritoRepository.findByUsuarioIdAndPosicao(usuarioId, posicao)
                .ifPresent(favoritoRepository::delete);
        favoritoRepository.flush();
        return montarLista(usuarioId);
    }

    private List<FavoritoResponse> montarLista(Integer usuarioId) {
        return favoritoRepository.findByUsuarioIdOrderByPosicao(usuarioId).stream()
                .filter(favorito -> publicado(favorito.getRestaurante()))
                .map(favorito -> new FavoritoResponse(
                        favorito.getPosicao(),
                        RestauranteResumoResponse.de(favorito.getRestaurante(), null,
                                avaliacaoService.notasDoRestaurante(favorito.getRestaurante().getId()))))
                .toList();
    }

    private void conferirPosicao(Integer posicao) {
        if (posicao == null || posicao < 1 || posicao > MAXIMO_FAVORITOS) {
            throw new CampoInvalidoException("posicao", "A posição deve ser de 1 a 4.");
        }
    }

    private boolean publicado(Restaurante restaurante) {
        return restaurante.getStatus() == StatusAnalise.APROVADO && restaurante.isAtivo();
    }
}
