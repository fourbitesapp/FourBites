package com.fourbites.backend.entity;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuario_preferencia")
@Getter
@Setter
@NoArgsConstructor
public class UsuarioPreferencia {

    @Id
    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Column(name = "faixa_preco", length = 3) //"$", "$$", "$$$"
    private String faixaPreco;

    @Column(name = "precisa_acessibilidade", nullable = false)
    private boolean precisaAcessibilidade;

    @Column(name = "leva_pets", nullable = false)
    private boolean levaPets;

    @Column(name = "data_atualizacao", nullable = false)
    private OffsetDateTime dataAtualizacao;

    @ElementCollection
    @CollectionTable(name = "usuario_categoria_preferida",
                     joinColumns = @JoinColumn(name = "usuario_id"))
    @Column(name = "categoria_id")
    private Set<Integer> categoriaIds = new HashSet<>();

    @PrePersist
    @PreUpdate
    void atualizarData() {
        dataAtualizacao = OffsetDateTime.now();
    }
}
