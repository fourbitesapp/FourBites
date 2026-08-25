-- Dados iniciais para teste!!

--Categoria
INSERT INTO categoria (nome, descricao, icone) VALUES
('Brasileira', 'Restaurantes especializados em culinária brasileira.', 'brasileira.png'),
('Italiana', 'Massas, pizzas e pratos da culinária italiana.', 'italiana.png'),
('Japonesa', 'Sushis, sashimis e pratos da culinária japonesa.', 'japonesa.png'),
('Hambúrguer', 'Hambúrgueres, lanches e acompanhamentos.', 'hamburguer.png'),
('Pizzaria', 'Pizzas e outros pratos típicos de pizzarias.', 'pizza.png');

--Forma de Pagamento
INSERT INTO forma_pagamento (nome) VALUES
('Dinheiro'),
('Pix'),
('Cartão de débito'),
('Cartão de crédito'),
('Vale-refeição');

--Usuarios
INSERT INTO usuario
(nome, username, email, senha, foto_perfil, bio, data_nascimento)
VALUES
(
    'Ana Souza',
    'anasouza',
    'ana@fourbites.com',
    'senha_teste_123',
    'ana.jpg',
    'Apaixonada por gastronomia e por conhecer restaurantes novos.',
    '2003-05-15'
),
(
    'João Santos',
    'joaosantos',
    'joao@fourbites.com',
    'senha_teste_456',
    'joao.jpg',
    'Sempre procurando lugares bons para comer em Santos.',
    '2001-09-22'
),
(
    'Maria Oliveira',
    'mariaoliveira',
    'maria@fourbites.com',
    'senha_teste_789',
    'maria.jpg',
    'Gosto de conhecer restaurantes e compartilhar minhas experiências.',
    '2004-02-10'
);

--Restaurantes
INSERT INTO restaurante
(nome, descricao, categoria_id, faixa_preco, aceita_pets, acessivel,
 horario, telefone, endereco, latitude, longitude)
VALUES
(
    'Sabor da Vila',
    'Restaurante especializado em pratos da culinária brasileira.',
    1,
    '$$',
    TRUE,
    TRUE,
    '11:00 - 23:00',
    '(13) 3333-1111',
    'Rua das Flores, 100 - Santos/SP',
    -23.9608,
    -46.3336
),
(
    'Bella Massa',
    'Restaurante italiano com massas artesanais e pizzas.',
    2,
    '$$$',
    TRUE,
    TRUE,
    '18:00 - 23:30',
    '(13) 3333-2222',
    'Avenida Central, 250 - Santos/SP',
    -23.9615,
    -46.3320
),
(
    'Sushi House',
    'Restaurante de culinária japonesa com opções tradicionais e contemporâneas.',
    3,
    '$$$',
    FALSE,
    TRUE,
    '12:00 - 22:30',
    '(13) 3333-3333',
    'Rua do Comércio, 350 - Santos/SP',
    -23.9589,
    -46.3350
),
(
    'Burger Point',
    'Hambúrgueres artesanais e acompanhamentos.',
    4,
    '$$',
    TRUE,
    TRUE,
    '18:00 - 00:00',
    '(13) 3333-4444',
    'Avenida da Praia, 500 - Santos/SP',
    -23.9670,
    -46.3280
),
(
    'Pizzaria Central',
    'Pizzaria com opções tradicionais e especiais.',
    5,
    '$$',
    TRUE,
    FALSE,
    '18:00 - 00:00',
    '(13) 3333-5555',
    'Rua Central, 600 - Santos/SP',
    -23.9625,
    -46.3310
);

--Forma de Pagamento para Restaurantes
INSERT INTO restaurante_forma_pagamento
(restaurante_id, forma_pagamento_id)
VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 2),
(2, 3),
(2, 4),
(3, 2),
(3, 4),
(4, 2),
(4, 3),
(4, 4),
(5, 1),
(5, 2),
(5, 4);

--Avaliações
INSERT INTO avaliacao
(usuario_id, restaurante_id, nota_geral, nota_comida,
 nota_ambiente, nota_atendimento, nota_custo, comentario, fotos)
VALUES
(
    1,
    1,
    4.5,
    5.0,
    4.0,
    4.5,
    4.0,
    'Comida muito boa e atendimento excelente.',
    'avaliacao1.jpg'
),
(
    2,
    2,
    4.0,
    4.5,
    4.0,
    3.5,
    3.5,
    'A massa estava ótima e o ambiente é muito agradável.',
    'avaliacao2.jpg'
),
(
    3,
    3,
    5.0,
    5.0,
    5.0,
    4.5,
    4.0,
    'Excelente restaurante japonês. Com certeza voltaria.',
    'avaliacao3.jpg'
),
(
    1,
    4,
    4.5,
    4.5,
    4.0,
    5.0,
    4.5,
    'Hambúrguer muito saboroso e atendimento rápido.',
    NULL
);

-- Favoritos

INSERT INTO favorito
(usuario_id, restaurante_id, posicao)
VALUES
(1, 1, 1),
(1, 4, 2),
(2, 2, 1),
(2, 3, 2),
(3, 3, 1),
(3, 5, 2);