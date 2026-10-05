-- O papel passa a aceitar RESTAURANTE (conta do responsável).
ALTER TABLE usuario DROP CONSTRAINT ck_usuario_papel;
ALTER TABLE usuario ADD CONSTRAINT ck_usuario_papel
    CHECK (papel IN ('USUARIO', 'RESTAURANTE', 'ADMIN'));

-- Data de nascimento: obrigatória só para quem é USUARIO.
ALTER TABLE usuario ALTER COLUMN data_nascimento DROP NOT NULL;
ALTER TABLE usuario ADD CONSTRAINT ck_usuario_data_nascimento
    CHECK (papel <> 'USUARIO' OR data_nascimento IS NOT NULL);

-- Username: só letras, números, ponto e sublinhado.
ALTER TABLE usuario ADD CONSTRAINT ck_usuario_username_formato
    CHECK (username ~ '^[A-Za-z0-9._]+$');

ALTER TABLE usuario DROP CONSTRAINT uk_usuario_username;
CREATE UNIQUE INDEX uk_usuario_username ON usuario (LOWER(username));


ALTER TABLE restaurante DROP COLUMN endereco;
ALTER TABLE restaurante DROP COLUMN horario;   

ALTER TABLE restaurante
    ADD COLUMN cep          VARCHAR(9)   NOT NULL,   
    ADD COLUMN logradouro   VARCHAR(150) NOT NULL,
    ADD COLUMN numero       VARCHAR(10)  NOT NULL,
    ADD COLUMN complemento  VARCHAR(100),
    ADD COLUMN bairro       VARCHAR(100) NOT NULL,
    ADD COLUMN cidade       VARCHAR(100) NOT NULL,
    ADD COLUMN uf           VARCHAR(2)   NOT NULL;


ALTER TABLE restaurante
    ADD COLUMN responsavel_id   INTEGER,
    ADD COLUMN cnpj             VARCHAR(14),
    ADD COLUMN status           VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    ADD COLUMN motivo_rejeicao  TEXT,
    ADD COLUMN data_analise     TIMESTAMPTZ;

ALTER TABLE restaurante
    ADD CONSTRAINT fk_restaurante_responsavel
        FOREIGN KEY (responsavel_id) REFERENCES usuario(id),
    ADD CONSTRAINT uk_restaurante_cnpj UNIQUE (cnpj),
    ADD CONSTRAINT ck_restaurante_cnpj_formato
        CHECK (cnpj ~ '^[0-9]{14}$'),               
    ADD CONSTRAINT ck_restaurante_status
        CHECK (status IN ('PENDENTE', 'APROVADO', 'REJEITADO'));

CREATE INDEX idx_restaurante_responsavel ON restaurante (responsavel_id);
CREATE INDEX idx_restaurante_status      ON restaurante (status);


ALTER TABLE restaurante ALTER COLUMN categoria_id DROP NOT NULL;
ALTER TABLE restaurante ADD COLUMN categoria_sugerida VARCHAR(100);
ALTER TABLE restaurante ADD CONSTRAINT ck_restaurante_aprovado_com_categoria
    CHECK (status <> 'APROVADO' OR categoria_id IS NOT NULL);

ALTER TABLE restaurante
    ADD COLUMN data_fundacao  DATE NOT NULL,
    ADD COLUMN cardapio_url   VARCHAR(500),  
    ADD COLUMN cardapio_link  VARCHAR(500);   


-- RESTAURANTE_HORARIO (um registro por período de funcionamento)

CREATE TABLE restaurante_horario (
    id              INTEGER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    restaurante_id  INTEGER  NOT NULL,
    dia_semana      SMALLINT NOT NULL,   
    abertura        TIME     NOT NULL,
    fechamento      TIME     NOT NULL,   

    CONSTRAINT fk_restaurante_horario_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurante(id) ON DELETE CASCADE,

    CONSTRAINT ck_restaurante_horario_dia CHECK (dia_semana BETWEEN 1 AND 7)
);

CREATE INDEX idx_restaurante_horario_restaurante ON restaurante_horario (restaurante_id);

-- RESTAURANTE_ALTERACAO (edição de restaurante aprovado, aguardando o admin)

CREATE TABLE restaurante_alteracao (
    id               INTEGER     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    restaurante_id   INTEGER     NOT NULL,
    dados            JSONB       NOT NULL,  
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    motivo_rejeicao  TEXT,
    data_envio       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_analise     TIMESTAMPTZ,

    CONSTRAINT fk_restaurante_alteracao_restaurante
        FOREIGN KEY (restaurante_id) REFERENCES restaurante(id) ON DELETE CASCADE,

    CONSTRAINT ck_restaurante_alteracao_status
        CHECK (status IN ('PENDENTE', 'APROVADO', 'REJEITADO'))
);

CREATE UNIQUE INDEX uk_restaurante_alteracao_pendente
    ON restaurante_alteracao (restaurante_id)
    WHERE status = 'PENDENTE';

-- 5) ADMIN (o único do sistema)

INSERT INTO usuario (nome, username, email, senha, telefone, papel)
VALUES (
    'Administrador',
    'admin',
    'fourbitesapp@gmail.com',
    '$2a$10$nCVjXlXa0daiWR8XizntR.I6PElgJFoyMivOb4WjID7ShhjpZ/1TG',
    '(13) 99163-9253',
    'ADMIN'
);

-- Trava de segurança
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM usuario
               WHERE papel = 'ADMIN'
                 AND (senha NOT LIKE '$2%' OR email NOT LIKE '%@%' OR telefone LIKE 'TROQUE%')) THEN
        RAISE EXCEPTION 'V3: preencha o e-mail, o telefone e o hash da senha do admin antes de rodar.';
    END IF;
END $$;
