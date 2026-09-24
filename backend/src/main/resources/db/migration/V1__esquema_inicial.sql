-- FourBites - V1: esquema inicial do banco de dados (PostgreSQL)

--USUARIO
CREATE TABLE usuario (
    id               INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome             VARCHAR(100) NOT NULL,
    username         VARCHAR(50)  NOT NULL,
    email            VARCHAR(150) NOT NULL,
    senha            VARCHAR(255) NOT NULL,   
    telefone         VARCHAR(20)  NOT NULL,              
    data_nascimento  DATE         NOT NULL,              
    foto_perfil      VARCHAR(500),                       
    bio              TEXT,
    papel            VARCHAR(20)  NOT NULL DEFAULT 'USUARIO',
    data_cadastro    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_usuario_username UNIQUE (username),
    CONSTRAINT uk_usuario_email    UNIQUE (email),
    CONSTRAINT ck_usuario_papel    CHECK (papel IN ('USUARIO', 'ADMIN'))
);

--CATEGORIA

CREATE TABLE categoria (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    descricao  TEXT,
    icone      VARCHAR(255),

    CONSTRAINT uk_categoria_nome UNIQUE (nome)
);

--FORMA_PAGAMENTO

CREATE TABLE forma_pagamento (
    id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome  VARCHAR(50) NOT NULL,

    CONSTRAINT uk_forma_pagamento_nome UNIQUE (nome)
);

--RESTAURANTE

CREATE TABLE restaurante (
    id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome           VARCHAR(150) NOT NULL,
    descricao      TEXT         NOT NULL,
    categoria_id   INTEGER      NOT NULL,
    faixa_preco    VARCHAR(3)   NOT NULL,
    aceita_pets    BOOLEAN      NOT NULL DEFAULT FALSE,
    acessivel      BOOLEAN      NOT NULL DEFAULT FALSE,
    horario        VARCHAR(255) NOT NULL,
    telefone       VARCHAR(20)  NOT NULL,
    endereco       VARCHAR(255) NOT NULL,
    latitude       DECIMAL(9,6) NOT NULL,
    longitude      DECIMAL(9,6) NOT NULL,
    ativo          BOOLEAN      NOT NULL DEFAULT TRUE, 
    data_cadastro  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_restaurante_categoria
        FOREIGN KEY (categoria_id) REFERENCES categoria(id),

    CONSTRAINT ck_restaurante_faixa_preco CHECK (faixa_preco IN ('$', '$$', '$$$')),
    CONSTRAINT ck_restaurante_latitude    CHECK (latitude  BETWEEN -90  AND 90),
    CONSTRAINT ck_restaurante_longitude   CHECK (longitude BETWEEN -180 AND 180)
);

CREATE INDEX idx_restaurante_categoria ON restaurante (categoria_id);

--RESTAURANTE_FORMA_PAGAMENTO

CREATE TABLE restaurante_forma_pagamento (
    restaurante_id      INTEGER NOT NULL,
    forma_pagamento_id  INTEGER NOT NULL,

    PRIMARY KEY (restaurante_id, forma_pagamento_id),

    CONSTRAINT fk_rfp_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurante(id) ON DELETE CASCADE,

    CONSTRAINT fk_rfp_forma_pagamento
        FOREIGN KEY (forma_pagamento_id) REFERENCES forma_pagamento(id)
);

--RESTAURANTE_FOTO (guardadas no Cloudinary)

CREATE TABLE restaurante_foto (
    id              INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    restaurante_id  INTEGER      NOT NULL,
    url             VARCHAR(500) NOT NULL,
    ordem           SMALLINT     NOT NULL DEFAULT 1,

    CONSTRAINT fk_restaurante_foto_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurante(id) ON DELETE CASCADE
);

--AVALIAÇÃO

CREATE TABLE avaliacao (
    id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id        INTEGER      NOT NULL,
    restaurante_id    INTEGER      NOT NULL,
    nota_comida       SMALLINT     NOT NULL,
    nota_ambiente     SMALLINT     NOT NULL,
    nota_atendimento  SMALLINT     NOT NULL,
    nota_custo        SMALLINT     NOT NULL,
    nota_geral        NUMERIC(3,2) NOT NULL,
    comentario        TEXT,
    data_avaliacao    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao  TIMESTAMPTZ,

    CONSTRAINT fk_avaliacao_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id),

    CONSTRAINT fk_avaliacao_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurante(id),

    CONSTRAINT uk_avaliacao_usuario_restaurante UNIQUE (usuario_id, restaurante_id),

    CONSTRAINT ck_avaliacao_nota_comida      CHECK (nota_comida      BETWEEN 1 AND 5),
    CONSTRAINT ck_avaliacao_nota_ambiente    CHECK (nota_ambiente    BETWEEN 1 AND 5),
    CONSTRAINT ck_avaliacao_nota_atendimento CHECK (nota_atendimento BETWEEN 1 AND 5),
    CONSTRAINT ck_avaliacao_nota_custo       CHECK (nota_custo       BETWEEN 1 AND 5),
    CONSTRAINT ck_avaliacao_nota_geral_media CHECK (
        nota_geral = (nota_comida + nota_ambiente + nota_atendimento + nota_custo) / 4.0
    )
);

CREATE INDEX idx_avaliacao_restaurante ON avaliacao (restaurante_id); -- Ídices para as consultas de avaliações frequentes.
CREATE INDEX idx_avaliacao_data        ON avaliacao (data_avaliacao);

--AVALIAÇÃO_FOTO (guardadas no Cloudinary)

CREATE TABLE avaliacao_foto (
    id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    avaliacao_id  INTEGER      NOT NULL,
    url           VARCHAR(500) NOT NULL,

    CONSTRAINT fk_avaliacao_foto_avaliacao
        FOREIGN KEY (avaliacao_id) REFERENCES avaliacao(id) ON DELETE CASCADE
);

--FAVORITO

CREATE TABLE favorito (
    id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id      INTEGER     NOT NULL,
    restaurante_id  INTEGER     NOT NULL,
    posicao         SMALLINT    NOT NULL,
    data_adicao     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favorito_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,

    CONSTRAINT fk_favorito_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurante(id) ON DELETE CASCADE,

    CONSTRAINT uk_favorito_usuario_restaurante UNIQUE (usuario_id, restaurante_id),
    CONSTRAINT uk_favorito_usuario_posicao     UNIQUE (usuario_id, posicao),
    CONSTRAINT ck_favorito_posicao             CHECK (posicao BETWEEN 1 AND 4)
);

--SEGUIDOR

CREATE TABLE seguidor (
    seguidor_id  INTEGER     NOT NULL, -- usuário que segue
    seguido_id   INTEGER     NOT NULL, -- usuário que é seguido
    data_inicio  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (seguidor_id, seguido_id),            
        FOREIGN KEY (seguidor_id) REFERENCES usuario(id) ON DELETE CASCADE,

    CONSTRAINT fk_seguidor_seguido
        FOREIGN KEY (seguido_id) REFERENCES usuario(id) ON DELETE CASCADE,

    CONSTRAINT ck_seguidor_nao_segue_a_si_mesmo CHECK (seguidor_id <> seguido_id)
);

CREATE INDEX idx_seguidor_seguido ON seguidor (seguido_id);

--USUARIO_PREFERENCIA

CREATE TABLE usuario_preferencia (
    usuario_id              INTEGER     PRIMARY KEY,
    faixa_preco             VARCHAR(3),
    precisa_acessibilidade  BOOLEAN     NOT NULL DEFAULT FALSE,
    leva_pets               BOOLEAN     NOT NULL DEFAULT FALSE,
    data_atualizacao        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_usuario_preferencia_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,

    CONSTRAINT ck_usuario_preferencia_faixa_preco
        CHECK (faixa_preco IS NULL OR faixa_preco IN ('$', '$$', '$$$'))
);

--USUARIO_CATEGORIA_PREFERIDA

CREATE TABLE usuario_categoria_preferida (
    usuario_id    INTEGER NOT NULL,
    categoria_id  INTEGER NOT NULL,

    PRIMARY KEY (usuario_id, categoria_id),

    CONSTRAINT fk_ucp_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,

    CONSTRAINT fk_ucp_categoria
        FOREIGN KEY (categoria_id) REFERENCES categoria(id) ON DELETE CASCADE
);

--TOKEN_RECUPERACAO_SENHA

CREATE TABLE token_recuperacao_senha (
    id            INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id    INTEGER      NOT NULL,
    token         VARCHAR(100) NOT NULL,
    expira_em     TIMESTAMPTZ  NOT NULL,
    usado         BOOLEAN      NOT NULL DEFAULT FALSE,
    data_criacao  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_token_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,

    CONSTRAINT uk_token_recuperacao_token UNIQUE (token)
);