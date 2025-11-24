const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Obter dados do dashboard
router.get('/', authenticateToken, async (req, res) => {
    try {
        // KPIs
        const [totalUsuarios] = await pool.execute('SELECT COUNT(*) as total FROM tbUsuarios');
        const [totalPessoas] = await pool.execute('SELECT COUNT(*) as total FROM tbPessoas');
        const [totalAvaliacoes] = await pool.execute('SELECT COUNT(*) as total FROM tbAvaliacao');

        // Gráfico de status
        const [statusData] = await pool.execute(
            `SELECT s.descricao as status, COUNT(a.avaliacao_id) as total
             FROM dominio_tbAvaliacaoStatus s
             LEFT JOIN tbAvaliacao a ON s.avaliacao_status_id = a.avaliacao_status_id
             GROUP BY s.avaliacao_status_id, s.descricao
             ORDER BY s.avaliacao_status_id`
        );

        // Atividades recentes (últimas 5)
        const [recentes] = await pool.execute(
            `SELECT a.avaliacao_id as id, a.data, p.nome as funcionario_nome,
                    s.descricao as status
             FROM tbAvaliacao a
             INNER JOIN tbPessoas p ON a.funcionario_id = p.pessoa_id
             INNER JOIN dominio_tbAvaliacaoStatus s ON a.avaliacao_status_id = s.avaliacao_status_id
             ORDER BY a.atualizado_em DESC
             LIMIT 5`
        );

        res.json({
            kpis: {
                totalUsuarios: totalUsuarios[0].total,
                totalPessoas: totalPessoas[0].total,
                totalAvaliacoes: totalAvaliacoes[0].total
            },
            graficoStatus: statusData,
            atividadesRecentes: recentes
        });
    } catch (error) {
        console.error('Erro ao obter dados do dashboard:', error);
        res.status(500).json({ error: 'Erro ao obter dados do dashboard' });
    }
});

module.exports = router;

