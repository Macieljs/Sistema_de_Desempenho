# Sistema de Desempenho

Sistema web para gerenciamento de avaliações de desempenho de funcionários.

## 🚀 Tecnologias

- **Frontend**: HTML5, Tailwind CSS, JavaScript (Vanilla), SweetAlert2, Chart.js
- **Backend**: Node.js, Express
- **Banco de Dados**: MySQL

## 📋 Pré-requisitos

- Node.js (v14+)
- MySQL Server

## 🔧 Instalação Local

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/sistema-desempenho.git
   cd sistema-desempenho
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o banco de dados:
   - Crie um banco de dados MySQL (ex: `sistema_desempenho`).
   - Importe o schema:
     ```bash
     mysql -u root -p sistema_desempenho < database/schema.sql
     ```

4. Configure as variáveis de ambiente:
   - Copie o arquivo de exemplo:
     ```bash
     cp .env.example .env
     ```
   - Edite o `.env` com suas credenciais do banco.

5. Inicie o servidor:
   ```bash
   npm start
   ```

6. Acesse: `http://localhost:3000`

## ☁️ Deploy

Este projeto está pronto para deploy em plataformas como Railway, Render ou Heroku.

1. Certifique-se de configurar as variáveis de ambiente no painel da hospedagem (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`).
2. O servidor iniciará automaticamente na porta definida pela variável `PORT`.

## 👤 Usuário Padrão (Admin)

Para criar o primeiro usuário administrador, execute:
```bash
node scripts/seed_admin.js
```
Isso criará o usuário `admin` com senha `admin123`.
