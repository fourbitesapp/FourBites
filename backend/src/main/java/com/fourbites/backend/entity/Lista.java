package com.fourbites.backend.entity;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Lista de restaurantes criada por um usuário (ex.: "Pra date"). Pode ser pública ou privada.
@Entity
@Table(name = "lista")
@Getter
@Setter
@NoArgsConstructor
public class Lista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 60)
    private String nome;

    @Column(length = 200)
    private String descricao;

    @Column(length = 7)
    private String cor; // #RRGGBB

    @Column(length = 40)
    private String icone; // classe do Bootstrap Icons (ex.: "bi-heart")

    @Column(nullable = false)
    private boolean publica;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private OffsetDateTime dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private OffsetDateTime dataAtualizacao;

    // Mais recentes primeiro. Apagar a lista apaga os itens.
    @OneToMany(mappedBy = "lista", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dataAdicao DESC")
    private List<ListaRestaurante> itens = new ArrayList<>();

    @PrePersist
    void antesDeInserir() {
        dataCriacao = OffsetDateTime.now();
        dataAtualizacao = dataCriacao;
    }

    @PreUpdate
    void antesDeAtualizar() {
        dataAtualizacao = OffsetDateTime.now();
    }
}

