// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'https://quiz-f00o.onrender.com';

// Função para salvar um lead no banco de dados
export const saveLead = async (leadData) => {
    try {
        const response = await fetch(`${API_URL}/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao salvar o lead');
        }

        return data;
    } catch (error) {
        console.error('Erro ao salvar lead:', error);
        throw error;
    }
};

// Função para obter todos os leads
export const getAllLeads = async () => {
    try {
        const response = await fetch(`${API_URL}/leads`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao obter leads');
        }

        return data.data;
    } catch (error) {
        console.error('Erro ao obter leads:', error);
        throw error;
    }
};

// Função para obter leads por tipo
export const getLeadsByType = async (type) => {
    try {
        const response = await fetch(`${API_URL}/leads/type/${type}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao obter leads por tipo');
        }

        return data.data;
    } catch (error) {
        console.error(`Erro ao obter leads do tipo ${type}:`, error);
        throw error;
    }
};

// Função para atualizar o status de um lead
export const updateLeadStatus = async (id, statusData) => {
    try {
        const response = await fetch(`${API_URL}/leads/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(statusData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao atualizar o lead');
        }

        return data.data;
    } catch (error) {
        console.error('Erro ao atualizar lead:', error);
        throw error;
    }
};

// Função para excluir um lead
export const deleteLead = async (id) => {
    try {
        const response = await fetch(`${API_URL}/leads/${id}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao excluir o lead');
        }

        return data;
    } catch (error) {
        console.error('Erro ao excluir lead:', error);
        throw error;
    }
};

// Função para exportar leads para CSV
export const exportLeadsToCSV = async () => {
    try {
        const leads = await getAllLeads();

        // Cabeçalhos do CSV
        let csvContent = "Nome,Nicho,WhatsApp,Pontuação,Tipo,Data de Cadastro\n";

        // Adicionar dados
        leads.forEach(lead => {
            const date = new Date(lead.createdAt).toLocaleDateString('pt-BR');
            csvContent += `${lead.name},${lead.niche},${lead.whatsapp},${lead.score},${lead.leadType},${date}\n`;
        });

        // Criar um blob com o conteúdo CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        // Criar um link para download e clicar nele
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Erro ao exportar leads:', error);
        throw error;
    }
};

// Função para obter estatísticas de leads
export const getLeadStats = async () => {
    try {
        const allLeads = await getAllLeads();

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
                const leadDate = new Date(lead.createdAt).toISOString().split('T')[0];
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
        throw error;
    }
};