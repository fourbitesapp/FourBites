package com.fourbites.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fourbites.backend.entity.Lista;

public interface ListaRepository extends JpaRepository<Lista, Integer> {

    // Listas de um usuário, da editada mais recentemente para a mais antiga.
    List<Lista> findByUsuarioIdOrderByDataAtualizacaoDesc(Integer usuarioId);

    List<Lista> findByUsuarioIdAndPublicaTrueOrderByDataAtualizacaoDesc(Integer usuarioId);

    // Home: listas públicas do perfil oficial (o Farelo), "sugestões do autor".
    List<Lista> findByUsuarioOficialTrueAndPublicaTrueOrderByDataAtualizacaoDesc();

    // Listas que um usuário segue (só as que continuam públicas), da seguida mais recentemente para a mais antiga.
    @Query("""
            select l from Lista l, ListaSeguidor s
            where s.listaId = l.id and s.usuarioId = :usuarioId and l.publica = true
            order by s.dataInicio desc
            """)
    List<Lista> seguidasPor(@Param("usuarioId") Integer usuarioId);
}
