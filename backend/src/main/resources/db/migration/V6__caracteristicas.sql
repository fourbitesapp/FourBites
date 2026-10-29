-- Novas características do restaurante (sim/não), ao lado de aceita_pets e acessivel.

ALTER TABLE restaurante ADD COLUMN estacionamento BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE restaurante ADD COLUMN area_criancas  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE restaurante ADD COLUMN area_fumantes  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE restaurante ADD COLUMN lgbt_friendly  BOOLEAN NOT NULL DEFAULT FALSE;
