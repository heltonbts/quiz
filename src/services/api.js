// src/services/api.js

// Define a URL base da API, buscando da variável de ambiente VITE_API_URL
// ou usando a URL do Render como fallback.
// Certifique-se de ter um arquivo .env.production na raiz do seu projeto frontend com:
// VITE_API_URL=https://quiz-f00o.onrender.com
const API_URL = import.meta.env.VITE_API_URL || 'https://quiz-f00o.onrender.com';

/**
 * Função genérica para tratar respostas da API e erros comuns.
 * @param {Response} response - O objeto de resposta do fetch.
 * @param {string} defaultErrorMessage - Mensagem de erro padrão caso a API não retorne uma.
 * @returns {Promise<object>} - Os dados JSON da resposta.
 * @throws {Error} - Lança um erro se a resposta não for OK.
 */
const handleResponse = async (response, defaultErrorMessage = 'Erro desconhecido na API') => {
    const data = await response.json(); // Tenta parsear JSON mesmo em erros, pois pode conter a mensagem
    if (!response.ok) {
        // Usa a mensagem de erro da API se existir, senão usa a padrão
        throw new Error(data.error || defaultErrorMessage);
    }
    return data; // Retorna o objeto JSON completo em caso de sucesso
};


// Função para salvar um lead no banco de dados (POST)
export const saveLead = async (leadData) => {
    try {
        const response = await fetch(`${API_URL}/api/leads`, { // Caminho já estava correto
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
        });
        // Trata a resposta e retorna os dados do lead criado (vem em data.data)
        const responseData = await handleResponse(response, 'Erro ao salvar o lead');
        return responseData.data;
    } catch (error) {
        console.error('Erro em saveLead:', error);
        throw error; // Re-lança o erro para ser tratado por quem chamou a função
    }
};

// Função para obter todos os leads (GET)
export const getAllLeads = async () => {
    try {
        // CORRIGIDO: Adicionado /api ao caminho
        const response = await fetch(`${API_URL}/api/leads`);
        // Trata a resposta e retorna a lista de leads (vem em data.data)
        const responseData = await handleResponse(response, 'Erro ao obter leads');
        return responseData.data || []; // Retorna a lista ou um array vazio se não houver dados
    } catch (error) {
        console.error('Erro em getAllLeads:', error);
        throw error;
    }
};

// Função para obter leads por tipo (GET)
export const getLeadsByType = async (type) => {
    try {
        // Codifica o tipo para garantir que caracteres especiais (como 🔥) funcionem na URL
        const encodedType = encodeURIComponent(type);
        // CORRIGIDO: Adicionado /api ao caminho
        const response = await fetch(`${API_URL}/api/leads/type/${encodedType}`);
        // Trata a resposta e retorna a lista de leads filtrada (vem em data.data)
        const responseData = await handleResponse(response, 'Erro ao obter leads por tipo');
        return responseData.data || [];
    } catch (error) {
        console.error(`Erro em getLeadsByType (${type}):`, error);
        throw error;
    }
};

// Função para atualizar o status de um lead
export const updateLeadStatus = async (id, statusData) => {
    try {
        // Log para debug
        console.log('Atualizando status do lead:', id, statusData);

        // CORRIGIDO: Usar a rota específica para atualização de status
        const response = await fetch(`${API_URL}/api/leads/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(statusData),
        });

        // Log para debug
        console.log('Status da resposta:', response.status);

        // Tratar a resposta com nossa função handleResponse
        const responseData = await handleResponse(response, 'Erro ao atualizar o status do lead');

        // Log para debug
        console.log('Lead atualizado com sucesso:', responseData.data);

        return responseData.data;
    } catch (error) {
        console.error(`Erro em updateLeadStatus (ID: ${id}):`, error);
        // Adicionar mais detalhes ao erro para facilitar a depuração
        if (error.message) {
            console.error('Mensagem de erro:', error.message);
        }
        throw error;
    }
};

// Função para excluir um lead (DELETE)
export const deleteLead = async (id) => {
    try {
        // CORRIGIDO: Adicionado /api ao caminho
        const response = await fetch(`${API_URL}/api/leads/${id}`, {
            method: 'DELETE',
        });
        // Trata a resposta (DELETE bem-sucedido geralmente retorna 200 OK ou 204 No Content)
        // O corpo da resposta pode estar vazio ou conter { success: true, data: {} }
        const responseData = await handleResponse(response, 'Erro ao excluir o lead');
        return responseData; // Retorna a resposta completa (pode ser útil verificar success)
    } catch (error) {
        console.error(`Erro em deleteLead (ID: ${id}):`, error);
        throw error;
    }
};

// Função para exportar leads para CSV (não faz chamada direta à API, usa getAllLeads)
export const exportLeadsToCSV = async () => {
    try {
        const leads = await getAllLeads(); // Usa a função corrigida

        if (!leads || leads.length === 0) {
            alert('Não há leads para exportar.'); // Ou use uma notificação melhor
            return;
        }

        // Cabeçalhos do CSV
        let csvContent = "Nome,Nicho,WhatsApp,Pontuação,Tipo,Data de Cadastro\n";

        // Adicionar dados (com tratamento para vírgulas nos dados, se necessário)
        leads.forEach(lead => {
            const name = `"${(lead.name || '').replace(/"/g, '""')}"`; // Coloca entre aspas e escapa aspas internas
            const niche = `"${(lead.niche || '').replace(/"/g, '""')}"`;
            const whatsapp = `"${(lead.whatsapp || '').replace(/"/g, '""')}"`;
            const score = lead.score !== undefined ? lead.score : '';
            const leadType = `"${(lead.leadType || '').replace(/"/g, '""')}"`;
            const date = lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : '';
            csvContent += `${name},${niche},${whatsapp},${score},${leadType},${date}\n`;
        });

        // Criar um blob com o conteúdo CSV (UTF-8 com BOM para melhor compatibilidade com Excel)
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Criar um link para download e clicar nele
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Libera a memória do objeto URL
    } catch (error) {
        console.error('Erro ao exportar leads:', error);
        alert('Ocorreu um erro ao tentar exportar os leads.'); // Informa o usuário
        // Não re-lança o erro aqui, pois é uma ação do usuário
    }
};

// Função para obter estatísticas de leads (não faz chamada direta à API, usa getAllLeads)
export const getLeadStats = async () => {
    try {
        const allLeads = await getAllLeads(); // Usa a função corrigida

        // Contagem por tipo
        const hotLeads = allLeads.filter(lead => lead.leadType === "Quente 🔥");
        const warmLeads = allLeads.filter(lead => lead.leadType === "Morno ⚖️");
        const coldLeads = allLeads.filter(lead => lead.leadType === "Frio ❄️");

        // Taxa de conversão (leads quentes / total)
        const conversionRate = allLeads.length > 0
            ? ((hotLeads.length / allLeads.length) * 100).toFixed(1)
            : 0;

        // Dados para gráfico de tendência (últimos 7 dias)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        // Contar leads por dia
        const leadsByDay = last7Days.map(day => {
            const count = allLeads.filter(lead => {
                // Verifica se createdAt existe antes de tentar converter
                const leadDate = lead.createdAt ? new Date(lead.createdAt).toISOString().split('T')[0] : null;
                return leadDate === day;
            }).length;

            return {
                date: day,
                count
            };
        });

        return {
            total: allLeads.length,
            hot: hotLeads.length,
            warm: warmLeads.length,
            cold: coldLeads.length,
            conversionRate,
            trend: leadsByDay
        };
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        // Retorna um objeto padrão em caso de erro para não quebrar a UI
        return {
            total: 0, hot: 0, warm: 0, cold: 0, conversionRate: 0, trend: []
        };
    }
};