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

// Token enviado por e-mail para redefinir a senha. Expira e só vale uma vez.
@Entity
@Table(name = "token_recuperacao_senha")
@Getter
@Setter
@NoArgsConstructor
public class TokenRecuperacaoSenha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    @Column(nullable = false)
    private boolean usado;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private OffsetDateTime dataCriacao;

    @PrePersist
    void antesDeInserir() {
        if (dataCriacao == null) {
            dataCriacao = OffsetDateTime.now();
        }
    }
}
