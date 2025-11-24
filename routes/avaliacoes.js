const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Listar todas as avaliações
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [avaliacoes] = await pool.execute(
            `SELECT a.avaliacao_id as id, a.data, a.observacao, a.funcionario_id,
                    p.nome as funcionario_nome,
                    s.avaliacao_status_id, s.descricao as status
             FROM tbAvaliacao a
             INNER JOIN tbPessoas p ON a.funcionario_id = p.pessoa_id
             INNER JOIN dominio_tbAvaliacaoStatus s ON a.avaliacao_status_id = s.avaliacao_status_id
             ORDER BY a.data DESC, a.atualizado_em DESC`
        );

        res.json(avaliacoes);
    } catch (error) {
        console.error('Erro ao listar avaliações:', error);
        res.status(500).json({ error: 'Erro ao listar avaliações' });
    }
});

// Obter avaliação por ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [avaliacoes] = await pool.execute(
            `SELECT a.avaliacao_id as id, a.data, a.observacao, a.funcionario_id,
                    p.nome as funcionario_nome,
                    s.avaliacao_status_id, s.descricao as status
             FROM tbAvaliacao a
             INNER JOIN tbPessoas p ON a.funcionario_id = p.pessoa_id
             INNER JOIN dominio_tbAvaliacaoStatus s ON a.avaliacao_status_id = s.avaliacao_status_id
             WHERE a.avaliacao_id = ?`,
            [id]
        );

        if (avaliacoes.length === 0) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }

        res.json(avaliacoes[0]);
    } catch (error) {
        console.error('Erro ao obter avaliação:', error);
        res.status(500).json({ error: 'Erro ao obter avaliação' });
    }
});

// Criar avaliação
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { data, observacao, funcionario_id, avaliacao_status_id } = req.body;

        if (!data || !funcionario_id || !avaliacao_status_id) {
            return res.status(400).json({ error: 'Data, funcionário e status são obrigatórios' });
        }

        // Verificar se funcionário existe
        const [funcionarios] = await pool.execute(
            'SELECT pessoa_id FROM tbPessoas WHERE pessoa_id = ?',
            [funcionario_id]
        );

        if (funcionarios.length === 0) {
            return res.status(404).json({ error: 'Funcionário não encontrado' });
        }

        // Verificar se status existe
        const [status] = await pool.execute(
            'SELECT avaliacao_status_id FROM dominio_tbAvaliacaoStatus WHERE avaliacao_status_id = ?',
            [avaliacao_status_id]
        );

        if (status.length === 0) {
            return res.status(404).json({ error: 'Status não encontrado' });
        }

        const [result] = await pool.execute(
            'INSERT INTO tbAvaliacao (data, observacao, funcionario_id, avaliacao_status_id, atualizado_por) VALUES (?, ?, ?, ?, ?)',
            [data, observacao || null, funcionario_id, avaliacao_status_id, req.user.id]
        );

        res.status(201).json({ id: result.insertId, data, funcionario_id, avaliacao_status_id });
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        res.status(500).json({ error: 'Erro ao criar avaliação' });
    }
});

// Atualizar avaliação
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { data, observacao, funcionario_id, avaliacao_status_id } = req.body;

        // Verificar se avaliação existe
        const [avaliacoes] = await pool.execute(
            'SELECT avaliacao_id FROM tbAvaliacao WHERE avaliacao_id = ?',
            [id]
        );

        if (avaliacoes.length === 0) {
            return res.status(404).json({ error: 'Avaliação não encontrada' });
        }

        await pool.execute(
            'UPDATE tbAvaliacao SET data = ?, observacao = ?, funcionario_id = ?, avaliacao_status_id = ?, atualizado_por = ? WHERE avaliacao_id = ?',
            [data, observacao || null, funcionario_id, avaliacao_status_id, req.user.id, id]
        );

        res.json({ message: 'Avaliação atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar avaliação:', error);
        res.status(500).json({ error: 'Erro ao atualizar avaliação' });
    }
});

// Excluir avaliação
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.execute('DELETE FROM tbAvaliacao WHERE avaliacao_id = ?', [id]);

        res.json({ message: 'Avaliação excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
        res.status(500).json({ error: 'Erro ao excluir avaliação' });
    }
});

// Listar status disponíveis
router.get('/status/listar', authenticateToken, async (req, res) => {
    try {
        const [status] = await pool.execute(
            'SELECT avaliacao_status_id as id, descricao as nome FROM dominio_tbAvaliacaoStatus ORDER BY avaliacao_status_id'
        );

        res.json(status);
    } catch (error) {
        console.error('Erro ao listar status:', error);
        res.status(500).json({ error: 'Erro ao listar status' });
    }
});

module.exports = router;

