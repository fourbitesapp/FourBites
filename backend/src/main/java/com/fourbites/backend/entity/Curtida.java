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
@Table(name = "curtida")
@IdClass(CurtidaId.class)
@Getter
@Setter
@NoArgsConstructor
public class Curtida {

    @Id
    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Id
    @Column(name = "avaliacao_id")
    private Integer avaliacaoId;

    @Column(name = "data_curtida", nullable = false, updatable = false)
    private OffsetDateTime dataCurtida;

    public Curtida(Integer usuarioId, Integer avaliacaoId) {
        this.usuarioId = usuarioId;
        this.avaliacaoId = avaliacaoId;
        this.dataCurtida = OffsetDateTime.now();
    }

    @PrePersist
    void antesDeInserir() {
        if (dataCurtida == null) {
            dataCurtida = OffsetDateTime.now();
        }
    }
}

