const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Listar todos os usuários (apenas admin)
router.get('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.tipo !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const [usuarios] = await pool.execute(
            'SELECT usuario_id as id, nome, login, tipo FROM tbUsuarios ORDER BY nome'
        );

        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
});

// Criar usuário (apenas admin)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.tipo !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const { nome, login, senha, tipo } = req.body;

        if (!nome || !login || !senha) {
            return res.status(400).json({ error: 'Nome, login e senha são obrigatórios' });
        }

        // Verificar se login já existe
        const [existentes] = await pool.execute(
            'SELECT usuario_id FROM tbUsuarios WHERE login = ?',
            [login]
        );

        if (existentes.length > 0) {
            return res.status(400).json({ error: 'Login já existe' });
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        const [result] = await pool.execute(
            'INSERT INTO tbUsuarios (nome, login, senha, tipo, atualizado_por) VALUES (?, ?, ?, ?, ?)',
            [nome, login, senhaHash, tipo || 'comum', req.user.id]
        );

        res.status(201).json({ id: result.insertId, nome, login, tipo: tipo || 'comum' });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// Atualizar usuário (apenas admin)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.tipo !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const { id } = req.params;
        const { nome, login, senha, tipo } = req.body;

        // Verificar se usuário existe
        const [usuarios] = await pool.execute(
            'SELECT usuario_id FROM tbUsuarios WHERE usuario_id = ?',
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Verificar se login já existe em outro usuário
        if (login) {
            const [existentes] = await pool.execute(
                'SELECT usuario_id FROM tbUsuarios WHERE login = ? AND usuario_id != ?',
                [login, id]
            );

            if (existentes.length > 0) {
                return res.status(400).json({ error: 'Login já existe' });
            }
        }

        let query = 'UPDATE tbUsuarios SET atualizado_por = ?';
        const params = [req.user.id];

        if (nome) {
            query += ', nome = ?';
            params.push(nome);
        }
        if (login) {
            query += ', login = ?';
            params.push(login);
        }
        if (senha) {
            const senhaHash = await bcrypt.hash(senha, 10);
            query += ', senha = ?';
            params.push(senhaHash);
        }
        if (tipo) {
            query += ', tipo = ?';
            params.push(tipo);
        }

        query += ' WHERE usuario_id = ?';
        params.push(id);

        await pool.execute(query, params);

        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// Excluir usuário (apenas admin)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.tipo !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const { id } = req.params;

        // Não permitir excluir o próprio usuário ou admin principal
        const [usuario] = await pool.execute(
            'SELECT login FROM tbUsuarios WHERE usuario_id = ?',
            [id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        if (usuario[0].login === 'admin@admin.com') {
            return res.status(400).json({ error: 'Não é possível excluir o admin principal' });
        }

        // Verificar se é o último admin
        const [admins] = await pool.execute("SELECT COUNT(*) as total FROM tbUsuarios WHERE tipo = 'admin'");
        const [targetUser] = await pool.execute("SELECT tipo FROM tbUsuarios WHERE usuario_id = ?", [id]);

        if (targetUser[0].tipo === 'admin' && admins[0].total <= 1) {
            return res.status(400).json({ error: 'Não é possível excluir o último administrador do sistema.' });
        }

        await pool.execute('DELETE FROM tbUsuarios WHERE usuario_id = ?', [id]);

        res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
});

module.exports = router;

