-- A conta de admin passa a ser também o perfil oficial do FourBites
UPDATE usuario SET oficial = TRUE WHERE papel = 'ADMIN';

-- Nova categoria: Bar. Se o admin já tiver criado "Bar" pelo painel, não duplica.
INSERT INTO categoria (nome, descricao, icone)
VALUES ('Bar', 'Petiscos, porções, chopes, cervejas e drinks.', 'bar')
ON CONFLICT (nome) DO NOTHING;