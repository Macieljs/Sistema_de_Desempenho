# 📦 Guia de Instalação - Sistema de Desempenho

## Passo a Passo Completo

### 1. Pré-requisitos
- Node.js (v16 ou superior) - [Download](https://nodejs.org/)
- MySQL (v8.0 ou superior) - [Download](https://dev.mysql.com/downloads/)
- Git (opcional)

### 2. Instalar Dependências do Backend

```bash
npm install
```

### 3. Configurar Banco de Dados MySQL

#### 3.1. Criar o banco de dados
Abra o MySQL e execute:

```bash
mysql -u root -p
```

Depois execute os scripts SQL:

```sql
source database/schema.sql
source database/init.sql
```

Ou execute diretamente:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/init.sql
```

#### 3.2. Verificar criação
```sql
USE sistema_desempenho;
SHOW TABLES;
SELECT * FROM tbUsuarios;
```

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=sistema_desempenho
DB_PORT=3306
PORT=3000
JWT_SECRET=seu_secret_key_super_seguro_aqui
```

### 5. Iniciar o Servidor Backend

```bash
npm start
```

Ou para desenvolvimento com auto-reload:

```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3000`

### 6. Testar a API

Abra o navegador e acesse:
- `http://localhost:3000/api/health` - Deve retornar `{"status":"OK","message":"Servidor funcionando!"}`

### 7. Configurar Frontend

O frontend já está configurado para usar a API em `http://localhost:3000/api`.

Se precisar mudar a URL da API, edite o arquivo `api.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### 8. Acessar o Sistema

1. Abra `index.html` no navegador
2. Faça login com:
   - **Email:** admin@admin.com
   - **Senha:** 123

## 🔧 Solução de Problemas

### Erro: "Cannot connect to MySQL"
- Verifique se o MySQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `mysql -u root -p`

### Erro: "Table doesn't exist"
- Execute novamente os scripts SQL: `database/schema.sql` e `database/init.sql`

### Erro: "Port 3000 already in use"
- Mude a porta no arquivo `.env`: `PORT=3001`
- Ou pare o processo que está usando a porta 3000

### Erro de CORS no navegador
- Verifique se o backend está rodando
- Confirme que a URL da API está correta no `api.js`

## ✅ Verificação Final

1. ✅ Backend rodando na porta 3000
2. ✅ Banco de dados criado e populado
3. ✅ Frontend abrindo sem erros no console
4. ✅ Login funcionando
5. ✅ Dashboard carregando dados

## 🎉 Pronto!

Seu sistema está funcionando! 🚀

