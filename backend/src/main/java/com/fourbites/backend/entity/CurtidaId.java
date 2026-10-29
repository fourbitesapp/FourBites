package com.fourbites.backend.entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

// Chave da tabela curtida
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CurtidaId implements Serializable {

    private Integer usuarioId;
    private Integer avaliacaoId;
}
