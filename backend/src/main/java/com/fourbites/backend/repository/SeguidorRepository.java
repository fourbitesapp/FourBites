package com.fourbites.backend.repository;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fourbites.backend.entity.Seguidor;
import com.fourbites.backend.entity.SeguidorId;

public interface SeguidorRepository extends JpaRepository<Seguidor, SeguidorId> {

    boolean existsBySeguidorIdAndSeguidoId(Integer seguidorId, Integer seguidoId);

    long countBySeguidoId(Integer seguidoId);

    long countBySeguidorId(Integer seguidorId);

    @Query("select s.seguidoId from Seguidor s where s.seguidorId = :usuarioId")
    List<Integer> idsSeguidos(@Param("usuarioId") Integer usuarioId);

    @Query("select s.seguidorId from Seguidor s where s.seguidoId = :usuarioId")
    List<Integer> idsSeguidores(@Param("usuarioId") Integer usuarioId);

    // Notificações: quem começou a seguir o usuário desde uma data.
    List<Seguidor> findBySeguidoIdAndDataInicioAfterOrderByDataInicioDesc(Integer seguidoId, OffsetDateTime desde);
}
