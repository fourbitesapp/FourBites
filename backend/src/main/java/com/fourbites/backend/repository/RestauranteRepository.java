package com.fourbites.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fourbites.backend.entity.Restaurante;

public interface RestauranteRepository extends JpaRepository<Restaurante, Integer> {
}
