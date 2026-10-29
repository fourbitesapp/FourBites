package com.fourbites.backend.entity;

import java.time.OffsetDateTime;

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

// Um restaurante dentro de uma lista
@Entity
@Table(name = "lista_restaurante")
@Getter
@Setter
@NoArgsConstructor
public class ListaRestaurante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lista_id", nullable = false)
    private Lista lista;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurante_id", nullable = false)
    private Restaurante restaurante;

    @Column(name = "data_adicao", nullable = false, updatable = false)
    private OffsetDateTime dataAdicao;

    public ListaRestaurante(Lista lista, Restaurante restaurante) {
        this.lista = lista;
        this.restaurante = restaurante;
    }

    @PrePersist
    void antesDeInserir() {
        if (dataAdicao == null) {
            dataAdicao = OffsetDateTime.now();
        }
    }
}

