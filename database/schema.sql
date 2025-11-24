-- Schema do Sistema de Desempenho

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabela de Usuários
DROP TABLE IF EXISTS `tbUsuarios`;
CREATE TABLE `tbUsuarios` (
  `usuario_id` int(10) NOT NULL AUTO_INCREMENT,
  `usuario_nome` varchar(100) NOT NULL,
  `usuario_login` varchar(50) NOT NULL UNIQUE,
  `usuario_senha` varchar(255) NOT NULL,
  `usuario_tipo` enum('admin','comum') DEFAULT 'comum',
  `criado_em` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Tipos de Pessoa (Domínio)
DROP TABLE IF EXISTS `dominio_tbPessoaTipo`;
CREATE TABLE `dominio_tbPessoaTipo` (
  `pessoa_tipo_id` int(10) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(50) NOT NULL,
  PRIMARY KEY (`pessoa_tipo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `dominio_tbPessoaTipo` (`pessoa_tipo_id`, `descricao`) VALUES (1, 'Funcionário'), (2, 'Gestor');

-- 3. Tabela de Pessoas
DROP TABLE IF EXISTS `tbPessoas`;
CREATE TABLE `tbPessoas` (
  `pessoa_id` int(11) NOT NULL AUTO_INCREMENT,
  `pessoa_nome` varchar(100) NOT NULL,
  `pessoa_cpf` varchar(14) UNIQUE,
  `pessoa_nascimento` date DEFAULT NULL,
  `pessoa_telefone` varchar(20) DEFAULT NULL,
  `pessoa_tipo_id` int(10) DEFAULT 1,
  `criado_em` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pessoa_id`),
  FOREIGN KEY (`pessoa_tipo_id`) REFERENCES `dominio_tbPessoaTipo` (`pessoa_tipo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabela de Status de Avaliação (Domínio)
DROP TABLE IF EXISTS `dominio_tbAvaliacaoStatus`;
CREATE TABLE `dominio_tbAvaliacaoStatus` (
  `avaliacao_status_id` int(10) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(50) NOT NULL,
  PRIMARY KEY (`avaliacao_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `dominio_tbAvaliacaoStatus` (`avaliacao_status_id`, `descricao`) VALUES (1, 'Pendente'), (2, 'Em Andamento'), (3, 'Concluída');

-- 5. Tabela de Avaliações
DROP TABLE IF EXISTS `tbAvaliacao`;
CREATE TABLE `tbAvaliacao` (
  `avaliacao_id` int(10) NOT NULL AUTO_INCREMENT,
  `data` date NOT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  `funcionario_id` int(11) NOT NULL,
  `avaliacao_status_id` int(10) NOT NULL,
  `atualizado_por` int(10) DEFAULT NULL,
  `atualizado_em` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`avaliacao_id`),
  FOREIGN KEY (`funcionario_id`) REFERENCES `tbPessoas` (`pessoa_id`) ON DELETE CASCADE,
  FOREIGN KEY (`avaliacao_status_id`) REFERENCES `dominio_tbAvaliacaoStatus` (`avaliacao_status_id`),
  FOREIGN KEY (`atualizado_por`) REFERENCES `tbUsuarios` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
