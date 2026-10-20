package com.fourbites.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fourbites.backend.entity.Papel;
import com.fourbites.backend.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    boolean existsByEmail(String email);

    Optional<Usuario> findByEmail(String email);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCaseAndIdNot(String username, Integer id);

    Optional<Usuario> findByUsernameIgnoreCase(String username);

    // Busca de pessoas: nome ou username contendo o termo (o termo já chega em minúsculas e com os %).
    @Query("""
            SELECT u FROM Usuario u
            WHERE u.papel = :papel
              AND (LOWER(u.nome) LIKE :termo OR LOWER(u.username) LIKE :termo)
            ORDER BY u.nome
            """)
    List<Usuario> buscarPorNomeOuUsername(@Param("papel") Papel papel, @Param("termo") String termo, Pageable limite);
}
