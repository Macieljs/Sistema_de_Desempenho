const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Listar todas as pessoas
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [pessoas] = await pool.execute(
            `SELECT p.pessoa_id as id, p.nome, p.cpf, p.nascimento, p.telefone, 
                    pt.nome as pessoa_tipo
             FROM tbPessoas p
             INNER JOIN tbPessoaTipo pt ON p.pessoa_tipo_id = pt.pessoa_tipo_id
             ORDER BY p.nome`
        );

        res.json(pessoas);
    } catch (error) {
        console.error('Erro ao listar pessoas:', error);
        res.status(500).json({ error: 'Erro ao listar pessoas' });
    }
});

// Obter pessoa por ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [pessoas] = await pool.execute(
            `SELECT p.pessoa_id as id, p.nome, p.cpf, p.nascimento, p.telefone, 
                    pt.pessoa_tipo_id, pt.nome as pessoa_tipo
             FROM tbPessoas p
             INNER JOIN tbPessoaTipo pt ON p.pessoa_tipo_id = pt.pessoa_tipo_id
             WHERE p.pessoa_id = ?`,
            [id]
        );

        if (pessoas.length === 0) {
            return res.status(404).json({ error: 'Pessoa não encontrada' });
        }

        res.json(pessoas[0]);
    } catch (error) {
        console.error('Erro ao obter pessoa:', error);
        res.status(500).json({ error: 'Erro ao obter pessoa' });
    }
});

// Criar pessoa (apenas admin)
router.post('/', authenticateToken, async (req, res) => {
    try {
        if (req.user.tipo !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const { nome, cpf, nascimento, telefone, pessoa_tipo_id } = req.body;

        if (!nome || !cpf || !nascimento || !telefone) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        // Verificar se CPF já existe
        const [existentes] = await pool.execute(
            'SELECT pessoa_id FROM tbPessoas WHERE cpf = ?',
            [cpf]
        );

        if (existentes.length > 0) {
            return res.status(400).json({ error: 'CPF já cadastrado' });
        }

        const tipoId = pessoa_tipo_id || 1; // Default: Funcionário

        const [result] = await pool.execute(
            'INSERT INTO tbPessoas (nome, cpf, nascimento, telefone, pessoa_tipo_id, atualizado_por) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, cpf, nascimento, telefone, tipoId, req.user.id]
        );

        res.status(201).json({ id: result.insertId, nome, cpf, nascimento, telefone });
    } catch (error) {
        console.error('Erro ao criar pessoa:', error);
        res.status(500).json({ error: 'Erro ao criar pessoa: ' + error.message });
    }
});

// Atualizar pessoa (apenas admin)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.tipo !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const { id } = req.params;
        const { nome, cpf, nascimento, telefone, pessoa_tipo_id } = req.body;

        // Verificar se pessoa existe
        const [pessoas] = await pool.execute(
            'SELECT pessoa_id FROM tbPessoas WHERE pessoa_id = ?',
            [id]
        );

        if (pessoas.length === 0) {
            return res.status(404).json({ error: 'Pessoa não encontrada' });
        }

        // Verificar se CPF já existe em outra pessoa
        if (cpf) {
            const [existentes] = await pool.execute(
                'SELECT pessoa_id FROM tbPessoas WHERE cpf = ? AND pessoa_id != ?',
                [cpf, id]
            );

            if (existentes.length > 0) {
                return res.status(400).json({ error: 'CPF já cadastrado' });
            }
        }

        await pool.execute(
            'UPDATE tbPessoas SET nome = ?, cpf = ?, nascimento = ?, telefone = ?, pessoa_tipo_id = ?, atualizado_por = ? WHERE pessoa_id = ?',
            [nome, cpf, nascimento, telefone, pessoa_tipo_id || 1, req.user.id, id]
        );

        res.json({ message: 'Pessoa atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar pessoa:', error);
        res.status(500).json({ error: 'Erro ao atualizar pessoa' });
    }
});

// Excluir pessoa (apenas admin)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.tipo !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const { id } = req.params;

        await pool.execute('DELETE FROM tbPessoas WHERE pessoa_id = ?', [id]);

        res.json({ message: 'Pessoa excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir pessoa:', error);
        res.status(500).json({ error: 'Erro ao excluir pessoa' });
    }
});

// Listar tipos de pessoa
router.get('/tipos/listar', authenticateToken, async (req, res) => {
    try {
        const [tipos] = await pool.execute(
            'SELECT pessoa_tipo_id as id, nome FROM tbPessoaTipo ORDER BY nome'
        );

        res.json(tipos);
    } catch (error) {
        console.error('Erro ao listar tipos:', error);
        res.status(500).json({ error: 'Erro ao listar tipos' });
    }
});

module.exports = router;

