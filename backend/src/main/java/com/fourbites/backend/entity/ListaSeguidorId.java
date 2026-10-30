package com.fourbites.backend.entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

// quem segue, qual lista
@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ListaSeguidorId implements Serializable {

    private Integer usuarioId;
    private Integer listaId;
}
