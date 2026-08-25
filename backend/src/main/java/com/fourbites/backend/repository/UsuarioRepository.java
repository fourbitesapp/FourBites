package com.fourbites.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.fourbites.backend.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
}
