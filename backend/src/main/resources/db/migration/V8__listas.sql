-- Listas de restaurantes criadas pelo usuário
-- Pública: aparece no perfil para todos. Privada: só o dono vê.
CREATE TABLE lista (
    id                INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id        INTEGER      NOT NULL,
    nome              VARCHAR(60)  NOT NULL,
    descricao         VARCHAR(200),
    cor               VARCHAR(7),
    icone             VARCHAR(40),
    publica           BOOLEAN      NOT NULL DEFAULT FALSE,
    data_criacao      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lista_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT ck_lista_cor
        CHECK (cor IS NULL OR cor ~ '^#[0-9a-fA-F]{6}$')
);

-- Restaurantes de cada lista
CREATE TABLE lista_restaurante (
    id              INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lista_id        INTEGER      NOT NULL,
    restaurante_id  INTEGER      NOT NULL,
    data_adicao     TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lista_restaurante_lista
        FOREIGN KEY (lista_id) REFERENCES lista(id) ON DELETE CASCADE,
    CONSTRAINT fk_lista_restaurante_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurante(id) ON DELETE CASCADE,
    CONSTRAINT uk_lista_restaurante UNIQUE (lista_id, restaurante_id)
);

CREATE INDEX idx_lista_usuario ON lista (usuario_id);
