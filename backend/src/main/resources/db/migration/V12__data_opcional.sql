-- A data de abertura (mês/ano) do restaurante passa a ser opcional.
ALTER TABLE restaurante ALTER COLUMN data_fundacao DROP NOT NULL;
