const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const path = require('path');
const publicPath = path.join(__dirname, 'public');
console.log('📂 Servindo arquivos estáticos de:', publicPath);
app.use(express.static(publicPath));

app.get('/', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    console.log('📄 Tentando enviar:', indexPath);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('❌ Erro ao enviar index.html:', err);
            res.status(500).send('Erro ao carregar a página inicial.');
        }
    });
});

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/pessoas', require('./routes/pessoas'));
app.use('/api/avaliacoes', require('./routes/avaliacoes'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando!' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});

