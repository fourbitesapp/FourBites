package com.fourbites.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fourbites.backend.entity.Avaliacao;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Integer> {

    boolean existsByUsuarioIdAndRestauranteId(Integer usuarioId, Integer restauranteId);

    Optional<Avaliacao> findByUsuarioIdAndRestauranteId(Integer usuarioId, Integer restauranteId);

    @EntityGraph(attributePaths = {"usuario", "restaurante", "restaurante.categoria"})
    List<Avaliacao> findByRestauranteIdOrderByDataAvaliacaoDesc(Integer restauranteId);

    @EntityGraph(attributePaths = {"usuario", "restaurante", "restaurante.categoria"})
    List<Avaliacao> findByUsuarioIdOrderByDataAvaliacaoDesc(Integer usuarioId);

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
