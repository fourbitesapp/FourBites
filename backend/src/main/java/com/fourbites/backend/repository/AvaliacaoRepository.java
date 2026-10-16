package com.fourbites.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fourbites.backend.entity.Avaliacao;
import com.fourbites.backend.entity.StatusAnalise;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {

    boolean existsByUsuarioIdAndRestauranteId(Integer usuarioId, Integer restauranteId);

    Optional<Avaliacao> findByUsuarioIdAndRestauranteId(Integer usuarioId, Integer restauranteId);

    @EntityGraph(attributePaths = {"usuario", "restaurante", "restaurante.categoria"})
    List<Avaliacao> findByRestauranteIdOrderByDataAvaliacaoDesc(Integer restauranteId);

    @EntityGraph(attributePaths = {"usuario", "restaurante", "restaurante.categoria"})
    List<Avaliacao> findByUsuarioIdOrderByDataAvaliacaoDesc(Integer usuarioId);

    long countByUsuarioId(Integer usuarioId);

    // Avaliações de quem o usuário segue, só de restaurantes publicados.
    @EntityGraph(attributePaths = {"usuario", "restaurante", "restaurante.categoria"})
    @Query("""
            select a from Avaliacao a
            where a.usuario.id in :autores
              and a.restaurante.status = :publicado and a.restaurante.ativo = true
            order by a.dataAvaliacao desc
            """)
    List<Avaliacao> feedDosAutores(@Param("autores") List<Integer> autores,
                                   @Param("publicado") StatusAnalise publicado,
                                   Pageable limite);

    // As demais avaliações, deixando de fora os autores da lista.
    @EntityGraph(attributePaths = {"usuario", "restaurante", "restaurante.categoria"})
    @Query("""
            select a from Avaliacao a
            where a.usuario.id not in :excluidos
              and a.restaurante.status = :publicado and a.restaurante.ativo = true
            order by a.dataAvaliacao desc
            """)
    List<Avaliacao> feedExceto(@Param("excluidos") List<Integer> excluidos,
                               @Param("publicado") StatusAnalise publicado,
                               Pageable limite);

    // Médias calculadas pelo banco
    @Query("""
            select a.restaurante.id, avg(a.notaGeral), count(a),
                   avg(a.notaComida), avg(a.notaAmbiente), avg(a.notaAtendimento), avg(a.notaCusto)
            from Avaliacao a
            group by a.restaurante.id
            """)
    List<Object[]> calcularMediasDeTodos();

    // A mesma conta, só para um restaurante. Sem avaliações, a lista vem vazia.
    @Query("""
            select a.restaurante.id, avg(a.notaGeral), count(a),
                   avg(a.notaComida), avg(a.notaAmbiente), avg(a.notaAtendimento), avg(a.notaCusto)
            from Avaliacao a
            where a.restaurante.id = :restauranteId
            group by a.restaurante.id
            """)
    List<Object[]> calcularMediasDoRestaurante(@Param("restauranteId") Integer restauranteId);
}
