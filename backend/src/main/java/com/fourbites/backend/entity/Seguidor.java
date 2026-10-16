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

@Entity
@Table(name = "seguidor")
@IdClass(SeguidorId.class)
@Getter
@Setter
@NoArgsConstructor
public class Seguidor {

    @Id
    @Column(name = "seguidor_id")
    private Integer seguidorId;

    @Id
    @Column(name = "seguido_id")
    private Integer seguidoId;

    @Column(name = "data_inicio", nullable = false, updatable = false)
    private OffsetDateTime dataInicio;

    public Seguidor(Integer seguidorId, Integer seguidoId) {
        this.seguidorId = seguidorId;
        this.seguidoId = seguidoId;
        this.dataInicio = OffsetDateTime.now();
    }

    @PrePersist
    void antesDeInserir() {
        if (dataInicio == null) {
            dataInicio = OffsetDateTime.now();
        }
    }
}
