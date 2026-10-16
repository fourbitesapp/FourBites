package com.fourbites.backend.entity;

import java.time.OffsetDateTime;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Um dos 4 restaurantes favoritos de um usuário
@Entity
@Table(name = "favorito")
@Getter
@Setter
@NoArgsConstructor
public class Favorito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurante_id", nullable = false)
    private Restaurante restaurante;

    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(nullable = false)
    private Integer posicao;

    @Column(name = "data_adicao", nullable = false, updatable = false)
    private OffsetDateTime dataAdicao;

    public Favorito(Usuario usuario, Restaurante restaurante, Integer posicao) {
        this.usuario = usuario;
        this.restaurante = restaurante;
        this.posicao = posicao;
    }

    @PrePersist
    void antesDeInserir() {
        if (dataAdicao == null) {
            dataAdicao = OffsetDateTime.now();
        }
    }
}

