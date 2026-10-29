-- 1) As mesmas quatro nas preferências do usuário (contam na compatibilidade, 2,5 pontos cada).
ALTER TABLE usuario_preferencia ADD COLUMN leva_criancas          BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE usuario_preferencia ADD COLUMN precisa_estacionamento BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE usuario_preferencia ADD COLUMN fuma                   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE usuario_preferencia ADD COLUMN prefere_lgbt_friendly  BOOLEAN NOT NULL DEFAULT FALSE;

-- 2) Cor da categoria escolhida pelo admin . Sem cor, o front usa a paleta padrão.
--    O ícone fica na coluna "icone" que já existia
ALTER TABLE categoria ADD COLUMN cor VARCHAR(7);
ALTER TABLE categoria ADD CONSTRAINT ck_categoria_cor CHECK (cor IS NULL OR cor ~ '^#[0-9a-fA-F]{6}$');

-- Os ícones antigos da V2 eram nomes de arquivo (ex.: "brasileira.png") que nunca foram usados.
UPDATE categoria SET icone = NULL WHERE icone LIKE '%.png';
