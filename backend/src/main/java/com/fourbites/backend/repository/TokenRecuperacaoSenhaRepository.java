package com.fourbites.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fourbites.backend.entity.TokenRecuperacaoSenha;

public interface TokenRecuperacaoSenhaRepository extends JpaRepository<TokenRecuperacaoSenha, Integer> {

    Optional<TokenRecuperacaoSenha> findByToken(String token);
}

