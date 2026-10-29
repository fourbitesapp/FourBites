-- Curtidas nas avaliações: cada usuário curte cada avaliação no máximo uma vez 

CREATE TABLE curtida (
    usuario_id    INTEGER     NOT NULL,
    avaliacao_id  INTEGER     NOT NULL,
    data_curtida  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (usuario_id, avaliacao_id),

    CONSTRAINT fk_curtida_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,

    CONSTRAINT fk_curtida_avaliacao
        FOREIGN KEY (avaliacao_id) REFERENCES avaliacao(id) ON DELETE CASCADE
);

CREATE INDEX idx_curtida_avaliacao ON curtida (avaliacao_id);