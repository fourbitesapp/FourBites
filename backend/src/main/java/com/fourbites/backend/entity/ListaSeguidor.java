package com.fourbites.backend.entity;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Um usuário segue a lista de outra pessoa. Mesmo formato das tabelas seguidor e curtida.
@Entity
@Table(name = "lista_seguidor")
@IdClass(ListaSeguidorId.class)
@Getter
@Setter
@NoArgsConstructor
public class ListaSeguidor {

    @Id
    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Id
    @Column(name = "lista_id")
    private Integer listaId;

    @Column(name = "data_inicio", nullable = false, updatable = false)
    private OffsetDateTime dataInicio;

    public ListaSeguidor(Integer usuarioId, Integer listaId) {
        this.usuarioId = usuarioId;
        this.listaId = listaId;
        this.dataInicio = OffsetDateTime.now();
    }

    @PrePersist
    void antesDeInserir() {
        if (dataInicio == null) {
            dataInicio = OffsetDateTime.now();
        }
    }
}
