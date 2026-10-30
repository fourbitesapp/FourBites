-- O V10__perfil_listas.sql foi enviado vazio e já está registrado como aplicado,
-- então ele não pode mais ser alterado. Por isso, o conteúdo que deveria estar
-- no V10 vem aqui, junto com o que já era do V11.
 
-- 1) Perfil oficial: coluna que marca a conta com selo especial
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS oficial BOOLEAN NOT NULL DEFAULT FALSE;
 
-- 2) Listas que o usuário segue
CREATE TABLE IF NOT EXISTS lista_seguidor (
    usuario_id  INTEGER     NOT NULL,
    lista_id    INTEGER     NOT NULL,
    data_inicio TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, lista_id),
    CONSTRAINT fk_lista_seguidor_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_lista_seguidor_lista   FOREIGN KEY (lista_id)   REFERENCES lista(id)   ON DELETE CASCADE
);
 
-- 3) A conta de admin passa a ser também o perfil oficial do FourBites (Farelo)
UPDATE usuario SET oficial = TRUE WHERE papel = 'ADMIN';
 
-- 4) Nova categoria: Bar. Se já existir "Bar", não duplica.
INSERT INTO categoria (nome, descricao, icone)
VALUES ('Bar', 'Petiscos, porções, chopes, cervejas e drinks.', 'bar')
ON CONFLICT (nome) DO NOTHING;