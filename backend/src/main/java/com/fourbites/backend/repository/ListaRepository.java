package com.fourbites.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fourbites.backend.entity.Lista;

public interface ListaRepository extends JpaRepository<Lista, Integer> {

    // Listas de um usuário, da editada mais recentemente para a mais antiga.
    List<Lista> findByUsuarioIdOrderByDataAtualizacaoDesc(Integer usuarioId);

    List<Lista> findByUsuarioIdAndPublicaTrueOrderByDataAtualizacaoDesc(Integer usuarioId);
}
