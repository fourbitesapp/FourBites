package com.fourbites.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fourbites.backend.entity.FormaPagamento;

public interface FormaPagamentoRepository extends JpaRepository<FormaPagamento, Integer> {
}
