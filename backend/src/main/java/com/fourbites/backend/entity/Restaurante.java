package com.fourbites.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "restaurante")
@Getter
@Setter
@NoArgsConstructor
public class Restaurante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false, length = 20)
    private String telefone;

    @Column(name = "faixa_preco", nullable = false, length = 3) //"$", "$$" ou "$$$"
    private String faixaPreco;

    @Column(name = "aceita_pets", nullable = false)
    private boolean aceitaPets;

    @Column(nullable = false)
    private boolean acessivel;

    @Column(name = "data_fundacao", nullable = false) 
    private LocalDate dataFundacao;

    @Column(name = "cardapio_url", length = 500) //arquivo enviado (Cloudinary)
    private String cardapioUrl;

    @Column(name = "cardapio_link", length = 500) //link externo
    private String cardapioLink;

    //Categoria

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @Column(name = "categoria_sugerida", length = 100)
    private String categoriaSugerida;

    //Endereço

    @Column(nullable = false, length = 9)
    private String cep;

    @Column(nullable = false, length = 150)
    private String logradouro;

    @Column(nullable = false, length = 10)
    private String numero;

    @Column(length = 100)
    private String complemento;

    @Column(nullable = false, length = 100)
    private String bairro;

    @Column(nullable = false, length = 100)
    private String cidade;

    @Column(nullable = false, length = 2)
    private String uf;

    // Calculadas pelo back-end a partir do endereço (Nominatim).
    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal longitude;

    //Cadastro e análise do admin

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id")
    private Usuario responsavel;

    @Column(unique = true, length = 14) 
    private String cnpj;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusAnalise status = StatusAnalise.PENDENTE;

    @Column(name = "motivo_rejeicao", columnDefinition = "TEXT")
    private String motivoRejeicao;

    @Column(name = "data_analise")
    private OffsetDateTime dataAnalise;

    @Column(nullable = false) //o admin pode desativar um restaurante aprovado
    private boolean ativo = true;

    @Column(name = "data_cadastro", nullable = false, updatable = false)
    private OffsetDateTime dataCadastro;

    //Listas ligadas ao restaurante

    @ManyToMany
    @JoinTable(name = "restaurante_forma_pagamento",
               joinColumns = @JoinColumn(name = "restaurante_id"),
               inverseJoinColumns = @JoinColumn(name = "forma_pagamento_id"))
    private Set<FormaPagamento> formasPagamento = new HashSet<>();

    @OneToMany(mappedBy = "restaurante", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem")
    private List<RestauranteFoto> fotos = new ArrayList<>();

    @OneToMany(mappedBy = "restaurante", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("diaSemana, abertura")
    private List<RestauranteHorario> horarios = new ArrayList<>();

    @PrePersist
    void antesDeInserir() {
        if (dataCadastro == null) {
            dataCadastro = OffsetDateTime.now();
        }
    }
}
