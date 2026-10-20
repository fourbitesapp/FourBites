-- Capa do perfil: o usuário escolhe uma cor e uma frase prontas
ALTER TABLE usuario
    ADD COLUMN capa_cor   VARCHAR(20) NOT NULL DEFAULT 'vermelha',
    ADD COLUMN capa_frase VARCHAR(20) NOT NULL DEFAULT 'come-bem';

ALTER TABLE usuario ADD CONSTRAINT ck_usuario_capa_cor
    CHECK (capa_cor IN ('vermelha', 'amarela', 'verde', 'azul', 'rosa', 'chocolate'));

ALTER TABLE usuario ADD CONSTRAINT ck_usuario_capa_frase
    CHECK (capa_frase IN ('come-bem', 'sempre-fome', 'lugar-novo', 'sobremesa', 'critico', 'mais-um'));

-- Mais categorias de culinária
INSERT INTO categoria (nome, descricao) VALUES
    ('Árabe',                'Esfihas, quibes e pratos da culinária árabe.'),
    ('Mexicana',             'Tacos, burritos, nachos e pratos da culinária mexicana.'),
    ('Chinesa',              'Yakisoba, rolinhos e pratos da culinária chinesa.'),
    ('Vegana e vegetariana', 'Pratos sem carne, com opções veganas.'),
    ('Frutos do mar',        'Peixes, camarões e outros frutos do mar.'),
    ('Churrascaria',         'Carnes na brasa, rodízio e espetos.'),
    ('Cafeteria',            'Cafés, lanches rápidos e bolos.'),
    ('Doceria',              'Doces, sobremesas, sorvetes e confeitaria.'),
    ('Lanchonete',           'Salgados, sanduíches, pastéis e porções.'),
    ('Peruana',              'Ceviche e pratos da culinária peruana.');
