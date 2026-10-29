package com.fourbites.backend.repository;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fourbites.backend.entity.Curtida;
import com.fourbites.backend.entity.CurtidaId;

public interface CurtidaRepository extends JpaRepository<Curtida, CurtidaId> {

    boolean existsByUsuarioIdAndAvaliacaoId(Integer usuarioId, Integer avaliacaoId);

    // Quantas curtidas cada avaliação da lista tem
    // Avaliação sem curtida não aparece (conta como 0)
    @Query("""
            select c.avaliacaoId, count(c) from Curtida c
            where c.avaliacaoId in :avaliacoes
            group by c.avaliacaoId
            """)
    List<Object[]> contarPorAvaliacao(@Param("avaliacoes") Collection<Integer> avaliacoes);

    // Quais avaliações da lista o usuário já curtiu 
    @Query("select c.avaliacaoId from Curtida c where c.usuarioId = :usuarioId and c.avaliacaoId in :avaliacoes")
    List<Integer> curtidasDoUsuario(@Param("usuarioId") Integer usuarioId,
                                    @Param("avaliacoes") Collection<Integer> avaliacoes);

    // Quem curtiu uma avaliação, da curtida mais recente para a mais antiga.
    @Query("select c.usuarioId from Curtida c where c.avaliacaoId = :avaliacaoId order by c.dataCurtida desc")
    List<Integer> idsDeQuemCurtiu(@Param("avaliacaoId") Integer avaliacaoId);

    // Notificações
    @Query("""
            select c from Curtida c, Avaliacao a
            where a.id = c.avaliacaoId and a.usuario.id = :autorId and c.dataCurtida > :desde
            order by c.dataCurtida desc
            """)
    List<Curtida> recebidasDesde(@Param("autorId") Integer autorId, @Param("desde") OffsetDateTime desde);
}
