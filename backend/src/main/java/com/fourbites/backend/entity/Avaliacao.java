package com.fourbites.backend.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Avaliação de um restaurante feita por um usuário.
@Entity
@Table(name = "avaliacao")
@Getter
@Setter
@NoArgsConstructor
public class Avaliacao {

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
    @Column(name = "nota_comida", nullable = false)
    private Integer notaComida;

    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(name = "nota_ambiente", nullable = false)
    private Integer notaAmbiente;

    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(name = "nota_atendimento", nullable = false)
    private Integer notaAtendimento;

    @JdbcTypeCode(SqlTypes.SMALLINT)
    @Column(name = "nota_custo", nullable = false)
    private Integer notaCusto;

    @Column(name = "nota_geral", nullable = false, precision = 3, scale = 2)
    private BigDecimal notaGeral;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "data_avaliacao", nullable = false, updatable = false)
    private OffsetDateTime dataAvaliacao;

    @Column(name = "data_atualizacao") 
    private OffsetDateTime dataAtualizacao;

    @OneToMany(mappedBy = "avaliacao", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<AvaliacaoFoto> fotos = new ArrayList<>();

    @PrePersist
    void antesDeInserir() {
        if (dataAvaliacao == null) {
            dataAvaliacao = OffsetDateTime.now();
        }
    }
}

