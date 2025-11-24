const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Login
router.post('/login', async (req, res) => {
    try {
        const { login, senha } = req.body;

        if (!login || !senha) {
            return res.status(400).json({ error: 'Login e senha são obrigatórios' });
        }

        const [usuarios] = await pool.execute(
            'SELECT usuario_id, nome, login, senha, tipo FROM tbUsuarios WHERE login = ?',
            [login]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Login ou senha incorretos' });
        }

        const usuario = usuarios[0];
        
        // Verificar senha (comparar hash bcrypt)
        let senhaValida = false;
        try {
            senhaValida = await bcrypt.compare(senha, usuario.senha);
        } catch (err) {
            // Se não for hash válido, comparar texto simples (apenas para migração)
            senhaValida = senha === usuario.senha;
        }

        if (!senhaValida) {
            return res.status(401).json({ error: 'Login ou senha incorretos' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { id: usuario.usuario_id, nome: usuario.nome, tipo: usuario.tipo },
            process.env.JWT_SECRET || 'seu_secret_key_aqui',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            usuario: {
                id: usuario.usuario_id,
                nome: usuario.nome,
                login: usuario.login,
                tipo: usuario.tipo
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        try {
            const logDir = path.join(__dirname, '..', 'logs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            const logPath = path.join(logDir, 'auth-errors.log');
            fs.appendFileSync(logPath, `${new Date().toISOString()} ${error.stack}\n`);
        } catch (fsErr) {
            console.error('Falha ao registrar log de erro:', fsErr);
        }
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

// Verificar token
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_key_aqui');
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

module.exports = router;

