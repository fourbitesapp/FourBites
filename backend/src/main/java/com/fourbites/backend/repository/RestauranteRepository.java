package com.fourbites.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fourbites.backend.entity.Restaurante;
import com.fourbites.backend.entity.StatusAnalise;

public interface RestauranteRepository extends JpaRepository<Restaurante, Integer> {

    boolean existsByCnpj(String cnpj);

    @EntityGraph(attributePaths = {"categoria", "fotos"})
    List<Restaurante> findByStatusAndAtivoTrue(StatusAnalise status);

    // Área do responsável
    @EntityGraph(attributePaths = {"categoria", "fotos"})
    List<Restaurante> findByResponsavelIdOrderByDataCadastroDesc(Integer responsavelId);

    // Painel admin
    @EntityGraph(attributePaths = {"categoria", "fotos", "responsavel"})
    List<Restaurante> findByStatusOrderByDataCadastroAsc(StatusAnalise status);

    @EntityGraph(attributePaths = {"categoria", "fotos", "responsavel"})
    List<Restaurante> findAllByOrderByNomeAsc();

    long countByCategoriaId(Integer categoriaId);
}