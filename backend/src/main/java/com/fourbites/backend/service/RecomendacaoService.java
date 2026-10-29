package com.fourbites.backend.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fourbites.backend.dto.RecomendacaoResponse;
import com.fourbites.backend.dto.RestauranteResumoResponse;
import com.fourbites.backend.dto.ResumoNotas;
import com.fourbites.backend.entity.Papel;
import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.StatusAnalise;
import com.fourbites.backend.entity.UsuarioPreferencia;
import com.fourbites.backend.repository.AvaliacaoRepository;
import com.fourbites.backend.repository.FavoritoRepository;
import com.fourbites.backend.repository.RestauranteRepository;
import com.fourbites.backend.repository.UsuarioPreferenciaRepository;
import com.fourbites.backend.repository.UsuarioRepository;
import com.fourbites.backend.util.Compatibilidade;
import com.fourbites.backend.util.Compatibilidade.DadosDoRestaurante;
import com.fourbites.backend.util.Compatibilidade.PerfilDoUsuario;

// Recomendações e percentual de compatibilidade 
@Service
public class RecomendacaoService {

    private static final int TAMANHO_LISTA = 10;

    private final RestauranteRepository restauranteRepository;
    private final AvaliacaoRepository avaliacaoRepository;
    private final FavoritoRepository favoritoRepository;
    private final UsuarioPreferenciaRepository preferenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AvaliacaoService avaliacaoService;

    public RecomendacaoService(RestauranteRepository restauranteRepository,
                               AvaliacaoRepository avaliacaoRepository,
                               FavoritoRepository favoritoRepository,
                               UsuarioPreferenciaRepository preferenciaRepository,
                               UsuarioRepository usuarioRepository,
                               AvaliacaoService avaliacaoService) {
        this.restauranteRepository = restauranteRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.favoritoRepository = favoritoRepository;
        this.preferenciaRepository = preferenciaRepository;
        this.usuarioRepository = usuarioRepository;
        this.avaliacaoService = avaliacaoService;
    }

    // os 10 restaurantes publicados mais compatíveis que o usuário ainda não avaliou.
    @Transactional(readOnly = true)
    public List<RecomendacaoResponse> recomendar(Integer usuarioId) {
        PerfilDoUsuario perfil = montarPerfil(usuarioId);
        Set<Integer> jaAvaliados = new HashSet<>(avaliacaoRepository.restaurantesAvaliados(usuarioId));
        Map<Integer, ResumoNotas> notas = avaliacaoService.notasDeTodosOsRestaurantes();

        return restauranteRepository.findByStatusAndAtivoTrue(StatusAnalise.APROVADO).stream()
                .filter(restaurante -> !jaAvaliados.contains(restaurante.getId()))
                .map(restaurante -> {
                    ResumoNotas resumo = notas.getOrDefault(restaurante.getId(), ResumoNotas.SEM_AVALIACOES);
                    int compatibilidade = Compatibilidade.calcular(perfil, dados(restaurante, resumo.notaMedia()));
                    return new RecomendacaoResponse(RestauranteResumoResponse.de(restaurante, null, resumo),
                            compatibilidade);
                })
                .sorted(Comparator.comparingInt(RecomendacaoResponse::compatibilidade).reversed()
                        .thenComparing(r -> r.restaurante().notaMedia(),
                                Comparator.nullsLast(Comparator.<BigDecimal>reverseOrder()))
                        .thenComparing(r -> r.restaurante().nome()))
                .limit(TAMANHO_LISTA)
                .toList();
    }

    // Compatibilidade de um restaurante para o perfil.
    @Transactional(readOnly = true)
    public Integer compatibilidade(Integer usuarioId, Restaurante restaurante, BigDecimal notaMedia) {
        if (usuarioId == null) {
            return null;
        }
        boolean usuarioComum = usuarioRepository.findById(usuarioId)
                .map(usuario -> usuario.getPapel() == Papel.USUARIO)
                .orElse(false);
        if (!usuarioComum) {
            return null;
        }
        return Compatibilidade.calcular(montarPerfil(usuarioId), dados(restaurante, notaMedia));
    }

    // Junta as preferências marcadas e o histórico (categorias bem avaliadas + categorias favoritas).
    private PerfilDoUsuario montarPerfil(Integer usuarioId) {
        UsuarioPreferencia preferencia = preferenciaRepository.findById(usuarioId).orElse(null);

        Set<Integer> historico = new HashSet<>(avaliacaoRepository.categoriasBemAvaliadas(usuarioId));
        historico.addAll(favoritoRepository.categoriasFavoritas(usuarioId));

        if (preferencia == null) {
            return new PerfilDoUsuario(Set.of(), null, false, false, false, false, false, false, historico);
        }
        return new PerfilDoUsuario(
                preferencia.getCategoriaIds(),
                preferencia.getFaixaPreco(),
                preferencia.isPrecisaAcessibilidade(),
                preferencia.isLevaPets(),
                preferencia.isLevaCriancas(),
                preferencia.isPrecisaEstacionamento(),
                preferencia.isFuma(),
                preferencia.isPrefereLgbtFriendly(),
                historico);
    }

    private DadosDoRestaurante dados(Restaurante restaurante, BigDecimal notaMedia) {
        return new DadosDoRestaurante(
                restaurante.getCategoria() == null ? null : restaurante.getCategoria().getId(),
                restaurante.getFaixaPreco(),
                restaurante.isAcessivel(),
                restaurante.isAceitaPets(),
                restaurante.isAreaCriancas(),
                restaurante.isEstacionamento(),
                restaurante.isAreaFumantes(),
                restaurante.isLgbtFriendly(),
                notaMedia);
    }
}

