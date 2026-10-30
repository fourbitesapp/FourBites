package com.fourbites.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fourbites.backend.entity.ListaSeguidor;
import com.fourbites.backend.entity.ListaSeguidorId;

public interface ListaSeguidorRepository extends JpaRepository<ListaSeguidor, ListaSeguidorId> {

    boolean existsByUsuarioIdAndListaId(Integer usuarioId, Integer listaId);
}
