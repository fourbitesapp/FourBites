package com.fourbites.backend.service;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.AvaliacaoRequest;
import com.fourbites.backend.dto.AvaliacaoResponse;
import com.fourbites.backend.dto.ResumoNotas;
import com.fourbites.backend.entity.Avaliacao;
import com.fourbites.backend.entity.AvaliacaoFoto;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.entity.Usuario;
import com.fourbites.backend.exception.ConflitoException;
import com.fourbites.backend.exception.RecursoNaoEncontradoException;
import com.fourbites.backend.exception.SemPermissaoException;
import com.fourbites.backend.repository.AvaliacaoRepository;
import com.fourbites.backend.repository.RestauranteRepository;
import com.fourbites.backend.repository.UsuarioRepository;
import com.fourbites.backend.util.Notas;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final RestauranteRepository restauranteRepository;
    private final UsuarioRepository usuarioRepository;

    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository,
                            RestauranteRepository restauranteRepository,
                            UsuarioRepository usuarioRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.restauranteRepository = restauranteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // Publica uma avaliação. Cada usuário só pode avaliar cada restaurante uma vez.
    @Transactional
    public AvaliacaoResponse criar(Integer usuarioId, Integer restauranteId, AvaliacaoRequest dados) {
        Restaurante restaurante = buscarRestaurantePublicado(restauranteId);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));

        if (avaliacaoRepository.existsByUsuarioIdAndRestauranteId(usuarioId, restauranteId)) {
            throw new ConflitoException("Você já avaliou este restaurante. Edite a sua avaliação.");
        }

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setUsuario(usuario);
        avaliacao.setRestaurante(restaurante);
        preencher(avaliacao, dados);

        return AvaliacaoResponse.de(avaliacaoRepository.save(avaliacao));
    }

    // Edita uma avaliação. Só quem escreveu pode editar.
    @Transactional
    public AvaliacaoResponse editar(Integer usuarioId, Integer avaliacaoId, AvaliacaoRequest dados) {
        Avaliacao avaliacao = avaliacaoRepository.findById(avaliacaoId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Avaliação não encontrada."));

        if (!avaliacao.getUsuario().getId().equals(usuarioId)) {
            throw new SemPermissaoException("Você só pode editar as suas próprias avaliações.");
        }

        preencher(avaliacao, dados);
        avaliacao.setDataAtualizacao(OffsetDateTime.now());

        return AvaliacaoResponse.de(avaliacao);
    }

    @Transactional(readOnly = true)
    public AvaliacaoResponse buscarPorId(Integer id) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Avaliação não encontrada."));
        return AvaliacaoResponse.de(avaliacao);
    }

    // Avaliações de um restaurante, da mais recente para a mais antiga.
    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listarDoRestaurante(Integer restauranteId) {
        buscarRestaurantePublicado(restauranteId);
        return avaliacaoRepository.findByRestauranteIdOrderByDataAvaliacaoDesc(restauranteId).stream()
                .map(AvaliacaoResponse::de)
                .toList();
    }

    // Avaliações escritas por um usuário (aparecem no perfil dele), mais recentes primeiro.
    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listarDoUsuario(String username) {
        Usuario usuario = usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        return avaliacaoRepository.findByUsuarioIdOrderByDataAvaliacaoDesc(usuario.getId()).stream()
                .map(AvaliacaoResponse::de)
                .toList();
    }

    //Notas dos restaurantes (usadas na busca e no perfil)

    @Transactional(readOnly = true)
    public Map<Integer, ResumoNotas> notasDeTodosOsRestaurantes() {
        Map<Integer, ResumoNotas> notas = new HashMap<>();
        for (Object[] linha : avaliacaoRepository.calcularMediasDeTodos()) {
            notas.put(((Number) linha[0]).intValue(), ResumoNotas.daLinha(linha));
        }
        return notas;
    }

    @Transactional(readOnly = true)
    public ResumoNotas notasDoRestaurante(Integer restauranteId) {
        List<Object[]> linhas = avaliacaoRepository.calcularMediasDoRestaurante(restauranteId);
        return linhas.isEmpty() ? ResumoNotas.SEM_AVALIACOES : ResumoNotas.daLinha(linhas.get(0));
    }

    // Id da avaliação que o usuário fez deste restaurante, ou null se ainda não avaliou.
    @Transactional(readOnly = true)
    public Integer idDaAvaliacaoDoUsuario(Integer usuarioId, Integer restauranteId) {
        return avaliacaoRepository.findByUsuarioIdAndRestauranteId(usuarioId, restauranteId)
                .map(Avaliacao::getId)
                .orElse(null);
    }

    //Regras internas

    // Copia as notas, o comentário e as fotos, e calcula a nota geral.
    private void preencher(Avaliacao avaliacao, AvaliacaoRequest dados) {
        avaliacao.setNotaComida(dados.notaComida());
        avaliacao.setNotaAmbiente(dados.notaAmbiente());
        avaliacao.setNotaAtendimento(dados.notaAtendimento());
        avaliacao.setNotaCusto(dados.notaCusto());
        avaliacao.setNotaGeral(Notas.notaGeral(dados.notaComida(), dados.notaAmbiente(),
                dados.notaAtendimento(), dados.notaCusto()));

        String comentario = dados.comentario();
        avaliacao.setComentario(comentario == null || comentario.isBlank() ? null : comentario.trim());

        avaliacao.getFotos().clear();
        List<String> fotos = dados.fotos() == null ? List.of() : dados.fotos();
        for (String url : fotos) {
            AvaliacaoFoto foto = new AvaliacaoFoto();
            foto.setAvaliacao(avaliacao);
            foto.setUrl(url.trim());
            avaliacao.getFotos().add(foto);
        }
    }

    // Só restaurantes aprovados e ativos podem ser avaliados e ter as avaliações listadas.
    private Restaurante buscarRestaurantePublicado(Integer restauranteId) {
        Restaurante restaurante = restauranteRepository.findById(restauranteId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Restaurante não encontrado."));
        if (restaurante.getStatus() != StatusAnalise.APROVADO || !restaurante.isAtivo()) {
            throw new RecursoNaoEncontradoException("Restaurante não encontrado.");
        }
        return restaurante;
    }
}
