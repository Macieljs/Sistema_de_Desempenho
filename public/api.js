// Configuração da API
const API_BASE_URL = '/api';

// Função auxiliar para fazer requisições
async function apiRequest(endpoint, options = {}) {
    const token = sessionStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...options
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro na requisição');
        }

        return data;
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}

// API de Autenticação
const authAPI = {
    async login(login, senha) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: { login, senha }
        });

        if (data.token) {
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('usuario_logado', JSON.stringify(data.usuario));
        }

        return data;
    },

    async verify() {
        return await apiRequest('/auth/verify', { method: 'GET' });
    }
};

// API de Usuários
const usuariosAPI = {
    async listar() {
        return await apiRequest('/usuarios', { method: 'GET' });
    },

    async criar(usuario) {
        return await apiRequest('/usuarios', {
            method: 'POST',
            body: usuario
        });
    },

    async atualizar(id, usuario) {
        return await apiRequest(`/usuarios/${id}`, {
            method: 'PUT',
            body: usuario
        });
    },

    async excluir(id) {
        return await apiRequest(`/usuarios/${id}`, {
            method: 'DELETE'
        });
    }
};

// API de Pessoas
const pessoasAPI = {
    async listar() {
        return await apiRequest('/pessoas', { method: 'GET' });
    },

    async obter(id) {
        return await apiRequest(`/pessoas/${id}`, { method: 'GET' });
    },

    async criar(pessoa) {
        return await apiRequest('/pessoas', {
            method: 'POST',
            body: pessoa
        });
    },

    async atualizar(id, pessoa) {
        return await apiRequest(`/pessoas/${id}`, {
            method: 'PUT',
            body: pessoa
        });
    },

    async excluir(id) {
        return await apiRequest(`/pessoas/${id}`, {
            method: 'DELETE'
        });
    },

    async listarTipos() {
        return await apiRequest('/pessoas/tipos/listar', { method: 'GET' });
    }
};

// API de Avaliações
const avaliacoesAPI = {
    async listar() {
        return await apiRequest('/avaliacoes', { method: 'GET' });
    },

    async obter(id) {
        return await apiRequest(`/avaliacoes/${id}`, { method: 'GET' });
    },

    async criar(avaliacao) {
        return await apiRequest('/avaliacoes', {
            method: 'POST',
            body: avaliacao
        });
    },

    async atualizar(id, avaliacao) {
        return await apiRequest(`/avaliacoes/${id}`, {
            method: 'PUT',
            body: avaliacao
        });
    },

    async excluir(id) {
        return await apiRequest(`/avaliacoes/${id}`, {
            method: 'DELETE'
        });
    },

    async listarStatus() {
        return await apiRequest('/avaliacoes/status/listar', { method: 'GET' });
    }
};

// API de Dashboard
const dashboardAPI = {
    async obterDados() {
        return await apiRequest('/dashboard', { method: 'GET' });
    }
};

