-- Script de inicialização - Criar usuário admin com senha "123"
-- Execute este script após criar o banco de dados

USE sistema_desempenho;

-- Hash bcrypt válido de "123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- Se o admin não existir, criar
INSERT INTO tbUsuarios (nome, login, senha, tipo, atualizado_por)
SELECT 'Admin', 'admin@admin.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', 1
WHERE NOT EXISTS (SELECT 1 FROM tbUsuarios WHERE login = 'admin@admin.com');

-- Atualizar senha do admin se já existir
UPDATE tbUsuarios 
SET senha = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE login = 'admin@admin.com';

