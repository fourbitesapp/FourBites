package com.fourbites.backend.entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

// Chave da tabela seguidor: quem segue, quem é seguido

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class SeguidorId implements Serializable {

    private Integer seguidorId;
    private Integer seguidoId;
}