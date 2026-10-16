package com.fourbites.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fourbites.backend.entity.Favorito;

public interface FavoritoRepository extends JpaRepository<Favorito, Integer> {

    @EntityGraph(attributePaths = {"restaurante", "restaurante.categoria"})
    List<Favorito> findByUsuarioIdOrderByPosicao(Integer usuarioId);

    Optional<Favorito> findByUsuarioIdAndPosicao(Integer usuarioId, Integer posicao);

    Optional<Favorito> findByUsuarioIdAndRestauranteId(Integer usuarioId, Integer restauranteId);
    
}
