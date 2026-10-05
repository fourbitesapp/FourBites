package com.fourbites.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fourbites.backend.entity.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
}

