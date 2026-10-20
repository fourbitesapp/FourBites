package com.fourbites.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fourbites.backend.entity.RestauranteAlteracao;
import com.fourbites.backend.entity.StatusAnalise;

public interface RestauranteAlteracaoRepository extends JpaRepository<RestauranteAlteracao, Integer> {

    // Fila do admin: da mais antiga para a mais nova.
    @EntityGraph(attributePaths = {"restaurante", "restaurante.categoria", "restaurante.responsavel"})
    List<RestauranteAlteracao> findByStatusOrderByDataEnvioAsc(StatusAnalise status);

    boolean existsByRestauranteIdAndStatus(Integer restauranteId, StatusAnalise status);

    // A alteração mais recente de um restaurante 
    Optional<RestauranteAlteracao> findFirstByRestauranteIdOrderByDataEnvioDesc(Integer restauranteId);
}
