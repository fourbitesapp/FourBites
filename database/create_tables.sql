-- FourBites - Criação das tabelas do banco de dados (PostgreSQL)

--Usuário
CREATE TABLE usuario (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    foto_perfil VARCHAR(255),
    bio TEXT,
    data_nascimento DATE
);

--Categoria
CREATE TABLE categoria (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone VARCHAR(255)
);

--Restaurante
CREATE TABLE restaurante (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    categoria_id INTEGER NOT NULL,
    faixa_preco VARCHAR(20),
    aceita_pets BOOLEAN DEFAULT FALSE,
    acessivel BOOLEAN DEFAULT FALSE,
    horario VARCHAR(255),
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),

    CONSTRAINT fk_restaurante_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categoria(id)
);

--Forma de Pagamento
CREATE TABLE forma_pagamento (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

--Avaliação
CREATE TABLE avaliacao (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    restaurante_id INTEGER NOT NULL,
    nota_geral DECIMAL(2,1) NOT NULL,
    nota_comida DECIMAL(2,1) NOT NULL,
    nota_ambiente DECIMAL(2,1) NOT NULL,
    nota_atendimento DECIMAL(2,1) NOT NULL,
    nota_custo DECIMAL(2,1) NOT NULL,
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fotos VARCHAR(255),

    CONSTRAINT fk_avaliacao_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id),

    CONSTRAINT fk_avaliacao_restaurante
        FOREIGN KEY (restaurante_id)
        REFERENCES restaurante(id)
);

--Favorito
CREATE TABLE favorito (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    restaurante_id INTEGER NOT NULL,
    posicao INTEGER,
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favorito_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id),

    CONSTRAINT fk_favorito_restaurante
        FOREIGN KEY (restaurante_id)
        REFERENCES restaurante(id),

    CONSTRAINT uk_favorito_usuario_restaurante
        UNIQUE (usuario_id, restaurante_id)
);

--Restaurante_Forma_Pagamento
CREATE TABLE restaurante_forma_pagamento (
    restaurante_id INTEGER NOT NULL,
    forma_pagamento_id INTEGER NOT NULL,

    PRIMARY KEY (restaurante_id, forma_pagamento_id),

    CONSTRAINT fk_rfp_restaurante
        FOREIGN KEY (restaurante_id)
        REFERENCES restaurante(id),

    CONSTRAINT fk_rfp_forma_pagamento
        FOREIGN KEY (forma_pagamento_id)
        REFERENCES forma_pagamento(id)
);
