// Versão da Aplicação (para migração de dados)
const APP_VERSION = "2.0";

// =================================
// SELETORES DE ELEMENTOS
// =================================

// Telas
const telas = document.querySelectorAll('.tela');
const telaLogin = document.getElementById('tela-login');
const telaDashboard = document.getElementById('tela-dashboard');
const telaUsuarios = document.getElementById('tela-usuarios');
const telaPessoas = document.getElementById('tela-pessoas');
const telaAvaliacoes = document.getElementById('tela-avaliacoes');

// Navbar
const navbar = document.getElementById('navbar');
const navWelcome = document.getElementById('nav-welcome');
const navLogout = document.getElementById('nav-logout');

// Formulários
const formLogin = document.getElementById('form-login');
const formUsuario = document.getElementById('form-usuario');
const formPessoa = document.getElementById('form-pessoa');
const containerFormPessoa = document.getElementById('container-form-pessoa'); // Container do form
const formAvaliacao = document.getElementById('form-avaliacao');

// Tabelas
const tabelaUsuarios = document.getElementById('tabela-usuarios');
const tabelaPessoas = document.getElementById('tabela-pessoas');
const thAcoesPessoas = document.getElementById('th-acoes-pessoas'); // Cabeçalho da coluna de ações
const tabelaAvaliacoes = document.getElementById('tabela-avaliacoes');
const tabelaAtividadesRecentes = document.getElementById('tabela-atividades-recentes');

// Dashboard KPIs
const kpiTotalUsuarios = document.getElementById('kpi-total-usuarios');
const kpiTotalPessoas = document.getElementById('kpi-total-pessoas');
const kpiTotalAvaliacoes = document.getElementById('kpi-total-avaliacoes');
const cardUsuarios = document.getElementById('card-usuarios');

// Dropdown
const dropdownPessoas = document.getElementById('avaliacao-funcionario-select');

// (NOVO) Variável de estado do gráfico
let meuGraficoStatus = null;

// =================================
// FUNÇÕES GERAIS
// =================================

/**
 * Gera um ID único (UUID v4)
 * @returns {string} ID único
 */
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Mostra uma tela específica e esconde as outras
 * @param {string} idDaTela - O ID da tela a ser mostrada (ex: 'tela-login')
 */
function mostrarTela(idDaTela) {
    telas.forEach(tela => {
        if (tela.id === idDaTela) {
            tela.style.display = 'block';
        } else {
            tela.style.display = 'none';
        }
    });

    // Lógica adicional ao mostrar telas específicas
    if (idDaTela === 'tela-dashboard') {
        atualizarDashboard();
    }
    if (idDaTela === 'tela-usuarios') {
        listarUsuarios();
    }
    if (idDaTela === 'tela-pessoas') {
        configurarTelaPessoasPorRole(); // Configura a tela de pessoas (NOVO)
        listarPessoas();
    }
    if (idDaTela === 'tela-avaliacoes') {
        listarAvaliacoes();
        popularDropdownPessoas(); // Popula o dropdown
    }
}

/**
 * Mostra uma notificação toast
 * @param {string} mensagem - A mensagem a ser exibida
 * @param {boolean} [isError=false] - Se é uma mensagem de erro
 */
function mostrarToast(mensagem, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.style.backgroundColor = isError ? '#dc2626' : '#333'; // Vermelho para erro
    toast.className = "show";
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 3000);
}

/**
 * Busca dados do localStorage
 * @param {string} chave - A chave no localStorage (ex: 'usuarios')
 * @returns {Array} - O array de dados
 */
function getDados(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

/**
 * Salva dados no localStorage
 * @param {string} chave - A chave no localStorage
 * @param {Array} dados - O array de dados a ser salvo
 */
function setDados(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
}

/**
 * (NOVO) Formata uma string de CPF (apenas dígitos ou formatada) para 000.000.000-00
 * @param {string} cpf - String contendo CPF
 * @returns {string} - CPF formatado
 */
function formatarCPF(cpf) {
    let v = cpf.replace(/\D/g, ''); // Remove tudo que não é dígito
    v = v.replace(/(\d{3})(\d)/, '$1.$2'); // Adiciona ponto após o 3º dígito
    v = v.replace(/(\d{3})(\d)/, '$1.$2'); // Adiciona ponto após o 6º dígito
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Adiciona hífen antes dos 2 últimos dígitos
    return v;
}

// =================================
// LÓGICA DE AUTENTICAÇÃO
// =================================

/**
 * Retorna o tipo (role) do usuário logado
 * @returns {string|null} - 'admin', 'comum' ou null
 */
function getTipoUsuarioLogado() {
    const usuarioLogado = sessionStorage.getItem('usuario_logado');
    return usuarioLogado ? JSON.parse(usuarioLogado).tipo : null;
}

/**
 * Processa o formulário de login
 */
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    const errorP = document.getElementById('login-error');

    const usuarios = getDados('usuarios');
    const usuarioEncontrado = usuarios.find(u => u.login === email && u.senha === senha);

    if (usuarioEncontrado) {
        // Salva o usuário logado no sessionStorage (sessão do navegador)
        sessionStorage.setItem('usuario_logado', JSON.stringify(usuarioEncontrado));
        errorP.textContent = '';
        formLogin.reset();
        setupAppParaUsuarioLogado(usuarioEncontrado);
    } else {
        errorP.textContent = 'E-mail ou senha inválidos.';
    }
}

/**
 * Processa o logout
 */
function handleLogout() {
    sessionStorage.removeItem('usuario_logado');
    navbar.style.display = 'none';
    mostrarTela('tela-login');
}

/**
 * Configura o app para um usuário logado
 */
function setupAppParaUsuarioLogado(usuario) {
    navWelcome.textContent = `Olá, ${usuario.nome.split(' ')[0]}`;
    navbar.style.display = 'block';
    configurarDashboardPorRole(usuario.tipo);
    mostrarTela('tela-dashboard');
}

/**
 * Verifica se há um usuário logado ao carregar a página
 */
function verificarLoginInicial() {
    const usuarioLogado = sessionStorage.getItem('usuario_logado');
    if (usuarioLogado) {
        setupAppParaUsuarioLogado(JSON.parse(usuarioLogado));
    } else {
        mostrarTela('tela-login');
    }
}

// =================================
// LÓGICA DO DASHBOARD
// =================================

/**
 * Configura o dashboard com base no tipo (role) do usuário
 */
function configurarDashboardPorRole(tipoUsuario) {
    if (tipoUsuario === 'admin') {
        cardUsuarios.style.display = 'block';
    } else {
        cardUsuarios.style.display = 'none';
    }
}

/**
 * Atualiza os KPIs e a tabela de atividades recentes no dashboard
 */
function atualizarDashboard() {
    const usuarios = getDados('usuarios');
    const pessoas = getDados('pessoas');
    const avaliacoes = getDados('avaliacoes');

    // Atualiza KPIs
    kpiTotalUsuarios.textContent = usuarios.length;
    kpiTotalPessoas.textContent = pessoas.length;
    kpiTotalAvaliacoes.textContent = avaliacoes.length;

    // Atualiza Atividades Recentes (5 últimas avaliações)
    tabelaAtividadesRecentes.innerHTML = ''; // Limpa a tabela
    const avaliacoesRecentes = avaliacoes.slice(-5).reverse(); // Pega as 5 últimas

    if (avaliacoesRecentes.length === 0) {
        tabelaAtividadesRecentes.innerHTML = `
        <tr>
            <td colspan="3" class="px-6 py-4 text-center text-gray-500">Nenhuma atividade recente.</td>
        </tr>
    `;
        // (CORREÇÃO) Não deve ter 'return' aqui para o gráfico poder carregar
    } else {
        avaliacoesRecentes.forEach(avaliacao => {
            // Encontra a pessoa correspondente pelo ID
            const pessoa = pessoas.find(p => p.id === avaliacao.funcionarioId);
            const nomePessoa = pessoa ? pessoa.nome : 'Pessoa não encontrada';
            const statusClasse = getStatusClasse(avaliacao.status);

            tabelaAtividadesRecentes.innerHTML += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${nomePessoa}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${new Date(avaliacao.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasse}">
                        ${avaliacao.status}
                    </span>
                </td>
            </tr>
        `;
        });
    }

    // --- (NOVO) Lógica para o Gráfico de Status ---

    let pendentes = 0;
    let emAndamento = 0;
    let concluidas = 0;

    avaliacoes.forEach(avaliacao => {
        switch (avaliacao.status) {
            case 'Pendente':
                pendentes++;
                break;
            case 'Em Andamento':
                emAndamento++;
                break;
            case 'Concluída':
                concluidas++;
                break;
        }
    });

    // Destrói o gráfico anterior se ele existir (para evitar bugs ao recarregar)
    if (meuGraficoStatus) {
        meuGraficoStatus.destroy();
    }

    // Renderiza o novo gráfico
    const ctx = document.getElementById('grafico-status').getContext('2d');
    meuGraficoStatus = new Chart(ctx, {
        type: 'doughnut', // 'pie' para pizza, 'doughnut' para "rosquinha" (mais moderno)
        data: {
            labels: ['Pendente', 'Em Andamento', 'Concluída'],
            datasets: [{
                label: 'Status das Avaliações',
                data: [pendentes, emAndamento, concluidas],
                backgroundColor: [
                    'rgb(239, 68, 68)',  // Cor para Pendente (vermelho)
                    'rgb(234, 179, 8)',  // Cor para Em Andamento (amarelo)
                    'rgb(34, 197, 94)' // Cor para Concluída (verde)
                ],
                borderColor: 'rgb(255, 255, 255)', // Borda branca
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom', // Coloca a legenda embaixo
                }
            }
        }
    });
    // --- Fim da Lógica do Gráfico ---
}

/**
 * Retorna classes de estilo do Tailwind com base no status
 */
function getStatusClasse(status) {
    switch (status) {
        case 'Concluída': return 'bg-green-100 text-green-800';
        case 'Em Andamento': return 'bg-yellow-100 text-yellow-800';
        case 'Pendente': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}


// =================================
// CRUD: USUÁRIOS
// =================================

/**
 * Processa o formulário de usuário (Criar e Editar)
 */
function handleFormUsuario(event) {
    event.preventDefault();
    // Segurança: Somente admin pode gerenciar usuários
    if (getTipoUsuarioLogado() !== 'admin') {
        mostrarToast('Você não tem permissão para esta ação.', true);
        return;
    }

    const id = document.getElementById('usuario-id').value;
    const nome = document.getElementById('usuario-nome').value;
    const login = document.getElementById('usuario-login').value;
    const senha = document.getElementById('usuario-senha').value; // Senha (opcional na edição)

    let usuarios = getDados('usuarios');

    if (id) {
        // Editar
        const index = usuarios.findIndex(u => u.id === id);
        if (index > -1) {
            usuarios[index].nome = nome;
            usuarios[index].login = login;
            // Só atualiza a senha se uma nova foi digitada
            if (senha) {
                usuarios[index].senha = senha;
            }
            // tipo (role) não é alterado aqui
        }
    } else {
        // Criar
        const novoUsuario = {
            id: uuidv4(),
            nome,
            login,
            senha,
            tipo: 'comum' // Novos usuários são sempre 'comum'
        };
        usuarios.push(novoUsuario);
    }

    setDados('usuarios', usuarios);
    mostrarToast('Usuário salvo com sucesso!');
    resetarFormulario(formUsuario, ['usuario-id', 'usuario-senha']);
    listarUsuarios();
}

/**
 * Lista todos os usuários na tabela
 */
function listarUsuarios() {
    const usuarios = getDados('usuarios');
    tabelaUsuarios.innerHTML = ''; // Limpa a tabela
    if (usuarios.length === 0) {
        tabelaUsuarios.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-gray-500">Nenhum usuário cadastrado.</td></tr>';
        return;
    }
    usuarios.forEach(usuario => {
        tabelaUsuarios.innerHTML += `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${usuario.nome}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${usuario.login}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${usuario.tipo}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onclick="editarUsuario('${usuario.id}')" class="text-blue-600 hover:text-blue-900">Editar</button>
                <button onclick="excluirUsuario('${usuario.id}')" class="text-red-600 hover:text-red-900">Excluir</button>
            </td>
        </tr>
    `;
    });
}

/**
 * Preenche o formulário para edição de usuário
 * @param {string} id - ID do usuário
 */
function editarUsuario(id) {
    // Segurança: Somente admin pode editar
    if (getTipoUsuarioLogado() !== 'admin') {
        mostrarToast('Você não tem permissão para esta ação.', true);
        return;
    }
    const usuarios = getDados('usuarios');
    const usuario = usuarios.find(u => u.id === id);
    if (usuario) {
        document.getElementById('usuario-id').value = usuario.id;
        document.getElementById('usuario-nome').value = usuario.nome;
        document.getElementById('usuario-login').value = usuario.login;
        // Não preenchemos a senha por segurança, apenas informamos
        document.getElementById('usuario-senha').placeholder = "Deixe em branco para não alterar";
        // Rola para o topo para ver o formulário
        window.scrollTo(0, telaUsuarios.offsetTop);
    }
}

/**
 * Exclui um usuário
 * @param {string} id - ID do usuário
 */
function excluirUsuario(id) {
    // Segurança: Somente admin pode excluir
    if (getTipoUsuarioLogado() !== 'admin') {
        mostrarToast('Você não tem permissão para esta ação.', true);
        return;
    }

    // Não permite excluir o admin principal
    const usuario = getDados('usuarios').find(u => u.id === id);
    if (usuario && usuario.login === 'admin@admin.com') {
        mostrarToast('Não é possível excluir o administrador principal.', true);
        return;
    }

    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        let usuarios = getDados('usuarios');
        usuarios = usuarios.filter(u => u.id !== id);
        setDados('usuarios', usuarios);
        mostrarToast('Usuário excluído com sucesso!');
        listarUsuarios();
    }
}

// =================================
// CRUD: PESSOAS
// =================================

/**
 * (NOVO) Configura a tela de Pessoas com base na role
 */
function configurarTelaPessoasPorRole() {
    const tipoUsuario = getTipoUsuarioLogado();
    if (tipoUsuario === 'admin') {
        containerFormPessoa.style.display = 'block';
        thAcoesPessoas.style.display = 'table-cell'; // Mostra cabeçalho "Ações"
    } else {
        containerFormPessoa.style.display = 'none'; // Esconde formulário
        thAcoesPessoas.style.display = 'none'; // Esconde cabeçalho "Ações"
    }
}

/**
 * Processa o formulário de pessoa (Criar e Editar)
 */
function handleFormPessoa(event) {
    event.preventDefault();
    // Segurança: Somente admin pode gerenciar pessoas
    if (getTipoUsuarioLogado() !== 'admin') {
        mostrarToast('Você não tem permissão para esta ação.', true);
        return;
    }

    const id = document.getElementById('pessoa-id').value;
    const nome = document.getElementById('pessoa-nome').value;
    const cpf = document.getElementById('pessoa-cpf').value;
    const nascimento = document.getElementById('pessoa-nascimento').value;
    const telefone = document.getElementById('pessoa-telefone').value;

    // (NOVO) Validação do CPF
    if (cpf.length < 14) {
        mostrarToast('Por favor, digite um CPF válido (11 dígitos).', true);
        return; // Para a submissão
    }

    let pessoas = getDados('pessoas');

    if (id) {
        // Editar
        const index = pessoas.findIndex(p => p.id === id);
        if (index > -1) {
            pessoas[index] = { ...pessoas[index], nome, cpf, nascimento, telefone };
        }
    } else {
        // Criar
        const novaPessoa = {
            id: uuidv4(),
            nome,
            cpf,
            nascimento,
            telefone
        };
        pessoas.push(novaPessoa);
    }

    setDados('pessoas', pessoas);
    mostrarToast('Pessoa salva com sucesso!');
    resetarFormulario(formPessoa, ['pessoa-id']);
    listarPessoas();
}

/**
 * Lista todas as pessoas na tabela
 */
function listarPessoas() {
    const tipoUsuario = getTipoUsuarioLogado(); // Pega a role
    const pessoas = getDados('pessoas');
    tabelaPessoas.innerHTML = ''; // Limpa a tabela

    if (pessoas.length === 0) {
        tabelaPessoas.innerHTML = '<tr><td colspan="5" class="text-center p-4 text-gray-500">Nenhuma pessoa cadastrada.</td></tr>';
        return;
    }

    pessoas.forEach(pessoa => {
        // (MODIFICADO) Define botões de ação com base na role
        const botoesAcao = tipoUsuario === 'admin' ? `
            <button onclick="editarPessoa('${pessoa.id}')" class="text-blue-600 hover:text-blue-900">Editar</button>
            <button onclick="excluirPessoa('${pessoa.id}')" class="text-red-600 hover:text-red-900">Excluir</button>
        ` : ''; // Vazio se não for admin

        const displayColunaAcoes = tipoUsuario === 'admin' ? 'table-cell' : 'none';

        tabelaPessoas.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${pessoa.nome}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pessoa.cpf}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(pessoa.nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${pessoa.telefone}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2" style="display: ${displayColunaAcoes};">
                    ${botoesAcao}
                </td>
            </tr>
        `;
    });
}

/**
 * Preenche o formulário para edição de pessoa
 * @param {string} id - ID da pessoa
 */
function editarPessoa(id) {
    // Segurança: Somente admin pode editar
    if (getTipoUsuarioLogado() !== 'admin') {
        mostrarToast('Você não tem permissão para esta ação.', true);
        return;
    }
    const pessoas = getDados('pessoas');
    const pessoa = pessoas.find(p => p.id === id);
    if (pessoa) {
        document.getElementById('pessoa-id').value = pessoa.id;
        document.getElementById('pessoa-nome').value = pessoa.nome;
        // (MODIFICADO) Formata o CPF ao carregar para edição
        document.getElementById('pessoa-cpf').value = formatarCPF(pessoa.cpf);
        document.getElementById('pessoa-nascimento').value = pessoa.nascimento;
        document.getElementById('pessoa-telefone').value = pessoa.telefone;
        window.scrollTo(0, telaPessoas.offsetTop);
    }
}

/**
 * Exclui uma pessoa (e suas avaliações)
 * @param {string} id - ID da pessoa
 */
function excluirPessoa(id) {
    // Segurança: Somente admin pode excluir
    if (getTipoUsuarioLogado() !== 'admin') {
        mostrarToast('Você não tem permissão para esta ação.', true);
        return;
    }

    if (confirm('Tem certeza que deseja excluir esta pessoa? Todas as suas avaliações também serão excluídas.')) {
        let pessoas = getDados('pessoas');
        let avaliacoes = getDados('avaliacoes');

        pessoas = pessoas.filter(p => p.id !== id);
        avaliacoes = avaliacoes.filter(a => a.funcionarioId !== id); // Exclui avaliações órfãs

        setDados('pessoas', pessoas);
        setDados('avaliacoes', avaliacoes);
        mostrarToast('Pessoa e suas avaliações foram excluídas!');
        listarPessoas();
        listarAvaliacoes(); // Atualiza a lista de avaliações
    }
}

// =================================
// CRUD: AVALIAÇÕES
// =================================

/**
 * Popula o dropdown <select> de pessoas/funcionários
 */
function popularDropdownPessoas(idSelecionado = null) {
    const pessoas = getDados('pessoas');
    dropdownPessoas.innerHTML = '<option value="">Selecione um funcionário</option>'; // Limpa e adiciona opção padrão

    if (pessoas.length === 0) {
        dropdownPessoas.innerHTML += '<option value="" disabled>Nenhuma pessoa cadastrada</option>';
    }

    pessoas.forEach(pessoa => {
        const selecionado = (pessoa.id === idSelecionado) ? 'selected' : '';
        dropdownPessoas.innerHTML += `
        <option value="${pessoa.id}" ${selecionado}>${pessoa.nome}</option>
    `;
    });
}

/**
 * Processa o formulário de avaliação (Criar e Editar)
 */
function handleFormAvaliacao(event) {
    event.preventDefault();
    // (PERMITIDO PARA TODOS OS USUÁRIOS LOGADOS)

    const id = document.getElementById('avaliacao-id').value;
    const data = document.getElementById('avaliacao-data').value;
    const funcionarioId = document.getElementById('avaliacao-funcionario-select').value;
    const status = document.getElementById('avaliacao-status').value;
    const observacao = document.getElementById('avaliacao-observacao').value;

    if (!funcionarioId) {
        mostrarToast('Por favor, selecione um funcionário.', true);
        return;
    }

    let avaliacoes = getDados('avaliacoes');

    if (id) {
        // Editar
        const index = avaliacoes.findIndex(a => a.id === id);
        if (index > -1) {
            avaliacoes[index] = { ...avaliacoes[index], data, funcionarioId, status, observacao };
        }
    } else {
        // Criar
        const novaAvaliacao = {
            id: uuidv4(),
            data,
            funcionarioId,
            status,
            observacao
        };
        avaliacoes.push(novaAvaliacao);
    }

    setDados('avaliacoes', avaliacoes);
    mostrarToast('Avaliação salva com sucesso!');
    resetarFormulario(formAvaliacao, ['avaliacao-id']);
    listarAvaliacoes();
}

/**
 * Lista todas as avaliações na tabela
 */
function listarAvaliacoes() {
    const avaliacoes = getDados('avaliacoes');
    const pessoas = getDados('pessoas'); // Precisamos dos nomes
    tabelaAvaliacoes.innerHTML = ''; // Limpa a tabela

    if (avaliacoes.length === 0) {
        tabelaAvaliacoes.innerHTML = '<tr><td colspan="4" class="text-center p-4 text-gray-500">Nenhuma avaliação cadastrada.</td></tr>';
        return;
    }

    avaliacoes.forEach(avaliacao => {
        // Encontra a pessoa correspondente
        const pessoa = pessoas.find(p => p.id === avaliacao.funcionarioId);
        const nomePessoa = pessoa ? pessoa.nome : 'Pessoa não encontrada';
        const statusClasse = getStatusClasse(avaliacao.status);

        // **AQUI ESTAVA O ERRO!** O código abaixo é o correto.
        tabelaAvaliacoes.innerHTML += `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${nomePessoa}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(avaliacao.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasse}">
                    ${avaliacao.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onclick="editarAvaliacao('${avaliacao.id}')" class="text-blue-600 hover:text-blue-900">Editar</button>
                <button onclick="excluirAvaliacao('${avaliacao.id}')" class="text-red-600 hover:text-red-900">Excluir</button>
            </td>
        </tr>
        `;
    });
}

/**
 * Preenche o formulário para edição de avaliação
 * @param {string} id - ID da avaliação
 */
function editarAvaliacao(id) {
    // (PERMITIDO PARA TODOS OS USUÁRIOS LOGADOS)
    const avaliacoes = getDados('avaliacoes');
    const avaliacao = avaliacoes.find(a => a.id === id);
    if (avaliacao) {
        // Popula o dropdown PRIMEIRO, e já seleciona o ID correto
        popularDropdownPessoas(avaliacao.funcionarioId);

        document.getElementById('avaliacao-id').value = avaliacao.id;
        document.getElementById('avaliacao-data').value = avaliacao.data;
        // O dropdown já foi selecionado acima
        document.getElementById('avaliacao-status').value = avaliacao.status;
        document.getElementById('avaliacao-observacao').value = avaliacao.observacao;
        window.scrollTo(0, telaAvaliacoes.offsetTop);
    }
}

/**
 * Exclui uma avaliação
 * @param {string} id - ID da avaliação
 */
function excluirAvaliacao(id) {
    // (PERMITIDO PARA TODOS OS USUÁRIOS LOGADOS)
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
        let avaliacoes = getDados('avaliacoes');
        avaliacoes = avaliacoes.filter(a => a.id !== id);
        setDados('avaliacoes', avaliacoes);
        mostrarToast('Avaliação excluída com sucesso!');
        listarAvaliacoes();
    }
}


// =================================
// INICIALIZAÇÃO E EVENT LISTENERS
// =================================

/**
 * Limpa um formulário, incluindo campos ocultos
 * @param {HTMLFormElement} form - O formulário a ser resetado
 * @param {Array<string>} hiddenFields - Array de IDs de campos ocultos a serem limpos
 */
function resetarFormulario(form, hiddenFields = []) {
    form.reset();
    hiddenFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
    // Limpa o placeholder da senha de usuário
    if (form.id === 'form-usuario') {
        document.getElementById('usuario-senha').placeholder = "Deixe em branco para não alterar";
    }
}

/**
 * Inicializa o localStorage com dados de exemplo (se vazio)
 */
function inicializarDados() {
    // Só inicializa se as chaves não existirem
    if (getDados('usuarios').length === 0) {
        console.log("Inicializando dados de exemplo...");

        const pessoasIniciais = [
            { id: uuidv4(), nome: 'Alice Silva', cpf: '111.111.111-11', nascimento: '1990-05-15', telefone: '11 98888-7777' },
            { id: uuidv4(), nome: 'Bruno Costa', cpf: '222.222.222-22', nascimento: '1985-10-20', telefone: '21 97777-6666' }
        ];
        setDados('pessoas', pessoasIniciais);

        const usuariosIniciais = [
            { id: uuidv4(), nome: 'Admin', login: 'admin@admin.com', senha: '123', tipo: 'admin' },
            { id: uuidv4(), nome: 'Tester', login: 'test@test.com', senha: '123', tipo: 'comum' }
        ];
        setDados('usuarios', usuariosIniciais);

        // IMPORTANTE: Usa os IDs REAIS que acabaram de ser criados
        const avaliacoesIniciais = [
            { id: uuidv4(), data: '2025-10-28', funcionarioId: pessoasIniciais[0].id, status: 'Concluída', observacao: 'Ótimo desempenho no projeto X.' },
            { id: uuidv4(), data: '2025-11-10', funcionarioId: pessoasIniciais[1].id, status: 'Pendente', observacao: 'Aguardando auto-avaliação.' }
        ];
        setDados('avaliacoes', avaliacoesIniciais);

        mostrarToast('Dados de exemplo carregados!');
    }
}

// --- Event Listener Principal (quando o DOM carregar) ---
// O 'defer' no <script> do HTML já faz o papel do DOMContentLoaded
// mas vamos manter para garantir
document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica de Versão para corrigir dados ---
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
        console.warn(`Versão antiga (${storedVersion}) detectada. Limpando dados...`);
        localStorage.removeItem('usuarios');
        localStorage.removeItem('pessoas');
        localStorage.removeItem('avaliacoes');
        inicializarDados();
        localStorage.setItem('app_version', APP_VERSION);
        console.log(`Migração para versão ${APP_VERSION} concluída.`);
    }
    // --- Fim da Lógica de Versão ---


    // Verifica se o usuário já está logado (sessionStorage)
    verificarLoginInicial();

    // Adiciona listeners aos formulários
    formLogin.addEventListener('submit', handleLogin);
    formUsuario.addEventListener('submit', handleFormUsuario);
    formPessoa.addEventListener('submit', handleFormPessoa);
    formAvaliacao.addEventListener('submit', handleFormAvaliacao);

    // (NOVO) Adiciona listener de formatação para CPF
    const inputCPF = document.getElementById('pessoa-cpf');
    inputCPF.addEventListener('input', (e) => {
        e.target.value = formatarCPF(e.target.value); // Usa a nova função
    });

    // Adiciona listeners aos botões de navegação
    navLogout.addEventListener('click', handleLogout);
    navWelcome.addEventListener('click', () => mostrarTela('tela-dashboard'));

    // Listeners para os botões "Cancelar" dos formulários
    document.getElementById('btn-cancelar-usuario').addEventListener('click', () => resetarFormulario(formUsuario, ['usuario-id']));
    document.getElementById('btn-cancelar-pessoa').addEventListener('click', () => resetarFormulario(formPessoa, ['pessoa-id']));
    document.getElementById('btn-cancelar-avaliacao').addEventListener('click', () => resetarFormulario(formAvaliacao, ['avaliacao-id']));

    // Adiciona listeners aos botões de troca de tela (ex: Voltar, Gerenciar)
    document.querySelectorAll('.tela-switch').forEach(button => {
        button.addEventListener('click', () => {
            const idDaTela = button.getAttribute('data-tela');
            mostrarTela(idDaTela);
        });
    });

}); // Fim do DOMContentLoaded