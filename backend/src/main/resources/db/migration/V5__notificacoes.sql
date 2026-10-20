-- quando o usuário abriu as notificações pela última vez, para contar quantas são novas
ALTER TABLE usuario ADD COLUMN notificacoes_vistas_em TIMESTAMPTZ;
