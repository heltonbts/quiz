// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllLeads, getLeadsByType, exportLeadsToCSV, updateLeadStatus, deleteLead } from '../services/api';

const Dashboard = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        hot: 0,
        warm: 0,
        cold: 0,
        conversionRate: 0,
    });
    const [selectedLead, setSelectedLead] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [statusData, setStatusData] = useState({
        status: 'Novo',
        saleDetails: {
            type: null,
            value: null,
            notes: ''
        }
    });

    // Função para carregar os leads
    const loadLeads = async () => {
        setLoading(true);
        try {
            let leadsData;

            if (filter === 'all') {
                leadsData = await getAllLeads();
            } else {
                leadsData = await getLeadsByType(filter);
            }

            setLeads(leadsData);

            // Calcular estatísticas
            const allLeads = await getAllLeads();
            const hotLeads = allLeads.filter(lead => lead.leadType === "Quente 🔥");
            const warmLeads = allLeads.filter(lead => lead.leadType === "Morno ⚖️");
            const coldLeads = allLeads.filter(lead => lead.leadType === "Frio ❄️");

            // Calcular taxa de conversão (leads quentes / total)
            const conversionRate = allLeads.length > 0
                ? ((hotLeads.length / allLeads.length) * 100).toFixed(1)
                : 0;

            setStats({
                total: allLeads.length,
                hot: hotLeads.length,
                warm: warmLeads.length,
                cold: coldLeads.length,
                conversionRate,
            });

            setError(null);
        } catch (err) {
            setError('Erro ao carregar leads. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Carregar leads ao montar o componente
    useEffect(() => {
        loadLeads();
    }, [filter]);

    // Função para formatar data
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    // Abre o modal de detalhes do lead
    const openLeadDetails = (lead) => {
        setSelectedLead(lead);
        setShowModal(true);
    };

    // Fecha o modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedLead(null);
    };

    // Entrar em contato via WhatsApp
    const contactViaWhatsApp = (whatsappNumber) => {
        const cleanNumber = whatsappNumber.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanNumber}`, '_blank');
    };

    // Abrir modal de status
    const openStatusModal = (lead) => {
        setSelectedLead(lead);
        // Verificar se o lead tem as propriedades necessárias e fornecer valores padrão se não tiver
        setStatusData({
            status: lead.status || 'Novo',
            saleDetails: lead.saleDetails || {
                type: null,
                value: null,
                notes: ''
            }
        });
        setShowStatusModal(true);
    };

    // Fechar modal de status
    const closeStatusModal = () => {
        setShowStatusModal(false);
        setSelectedLead(null);
    };

    // Confirmar exclusão de lead
    const confirmDeleteLead = (id) => {
        setDeleteConfirm(id);
    };

    // Cancelar exclusão
    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    // Excluir lead
    const handleDeleteLead = async (id) => {
        try {
            await deleteLead(id);
            setLeads(leads.filter(lead => lead._id !== id));
            setDeleteConfirm(null);
            // Recarregar estatísticas
            loadLeads();
        } catch (error) {
            console.error('Erro ao excluir lead:', error);
            alert('Erro ao excluir lead. Tente novamente.');
        }
    };

    // Atualizar status do lead
    const handleUpdateStatus = async () => {
        if (!selectedLead) return;

        try {
            const updatedLead = await updateLeadStatus(selectedLead._id, statusData);

            // Atualizar o lead na lista
            setLeads(leads.map(lead =>
                lead._id === updatedLead._id ? updatedLead : lead
            ));

            closeStatusModal();

            // Recarregar estatísticas
            loadLeads();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status. Tente novamente.');
        }
    };

    // Renderizar modal de detalhes do lead
    const renderLeadDetailsModal = () => {
        if (!selectedLead || !showModal) return null;

        // Determinar mensagem personalizada com base no tipo de lead
        let messageTemplate = "";
        if (selectedLead.leadType === "Quente 🔥") {
            messageTemplate = `Olá ${selectedLead.name}, vi que você está interessado em uma página completa para o segmento de ${selectedLead.niche}. Temos uma solução que pode gerar resultados rápidos para você. Podemos conversar sobre isso?`;
        } else if (selectedLead.leadType === "Morno ⚖️") {
            messageTemplate = `Olá ${selectedLead.name}, obrigado pelo interesse em soluções para o segmento de ${selectedLead.niche}. Preparei algumas informações que podem te ajudar a tomar a melhor decisão. Posso te enviar?`;
        } else {
            messageTemplate = `Olá ${selectedLead.name}, percebi que você está começando a explorar soluções para o segmento de ${selectedLead.niche}. Temos um guia introdutório que acho que vai te ajudar. Quer receber?`;
        }

        // Informações de status
        const currentStatus = selectedLead.status || 'Novo';
        let statusInfo = "";

        if (currentStatus === 'Vendido' && selectedLead.saleDetails) {
            const saleDetails = selectedLead.saleDetails;
            statusInfo = `Venda: ${saleDetails.type || 'N/A'} | Valor: R$${saleDetails.value || '0'} | Notas: ${saleDetails.notes || 'Nenhuma'}`;
        }

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Detalhes do Lead</h2>
                        <button
                            onClick={closeModal}
                            className="text-gray-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <div className="bg-gray-900 rounded-lg px-4 py-3 w-full">
                                <h3 className="text-gray-400 text-sm">Nome</h3>
                                <p className="text-white font-medium">{selectedLead.name}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="bg-gray-900 rounded-lg px-4 py-3">
                                <h3 className="text-gray-400 text-sm">Nicho</h3>
                                <p className="text-white font-medium">{selectedLead.niche}</p>
                            </div>
                            <div className="bg-gray-900 rounded-lg px-4 py-3">
                                <h3 className="text-gray-400 text-sm">WhatsApp</h3>
                                <p className="text-white font-medium">{selectedLead.whatsapp}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="bg-gray-900 rounded-lg px-4 py-3">
                                <h3 className="text-gray-400 text-sm">Pontuação</h3>
                                <p className="text-white font-medium">{selectedLead.score} pontos</p>
                            </div>
                            <div className="bg-gray-900 rounded-lg px-4 py-3">
                                <h3 className="text-gray-400 text-sm">Classificação</h3>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm ${selectedLead.leadType === 'Quente 🔥'
                                        ? 'bg-red-900 text-red-100'
                                        : selectedLead.leadType === 'Morno ⚖️'
                                            ? 'bg-yellow-800 text-yellow-100'
                                            : 'bg-blue-900 text-blue-100'
                                        }`}
                                >
                                    {selectedLead.leadType}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg px-4 py-3 mb-2">
                            <h3 className="text-gray-400 text-sm">Status</h3>
                            <div className="flex flex-col">
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm my-1 w-fit ${currentStatus === 'Vendido'
                                        ? 'bg-green-900 text-green-100'
                                        : currentStatus === 'Contatado'
                                            ? 'bg-blue-900 text-blue-100'
                                            : currentStatus === 'Sem Retorno'
                                                ? 'bg-yellow-900 text-yellow-100'
                                                : currentStatus === 'Não Vendido'
                                                    ? 'bg-red-900 text-red-100'
                                                    : 'bg-gray-700 text-gray-300'
                                        }`}
                                >
                                    {currentStatus}
                                </span>

                                {statusInfo && (
                                    <p className="text-gray-300 text-sm mt-2">{statusInfo}</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg px-4 py-3 mb-2">
                            <h3 className="text-gray-400 text-sm">Data de Cadastro</h3>
                            <p className="text-white font-medium">{formatDate(selectedLead.createdAt)}</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-white mb-2">Respostas</h3>
                        <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                            {selectedLead.answers && Object.entries(selectedLead.answers).map(([questionId, answer]) => (
                                <div key={questionId} className="border-b border-gray-700 pb-2 last:border-0 last:pb-0">
                                    <h4 className="text-gray-400 text-sm">Pergunta {parseInt(questionId) + 1}</h4>
                                    <p className="text-white">Resposta: {answer.value}</p>
                                    <p className="text-gray-400 text-xs">Pontuação: {answer.score}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-white mb-2">Mensagem Sugerida</h3>
                        <div className="bg-gray-900 rounded-lg p-4">
                            <p className="text-white">{messageTemplate}</p>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                            onClick={() => contactViaWhatsApp(selectedLead.whatsapp)}
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                            </svg>
                            Entrar em Contato
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-4 py-3 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg font-medium"
                            onClick={() => {
                                closeModal();
                                openStatusModal(selectedLead);
                            }}
                        >
                            Atualizar Status
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium"
                            onClick={closeModal}
                        >
                            Fechar
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    };

    // Renderizar modal de atualização de status
    const renderStatusModal = () => {
        if (!selectedLead || !showStatusModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Atualizar Status do Lead</h2>
                        <button
                            onClick={closeStatusModal}
                            className="text-gray-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="text-white font-medium mb-1">Lead: {selectedLead.name}</p>
                        <p className="text-gray-400 text-sm mb-4">Tipo: {selectedLead.leadType}</p>

                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Status do Lead</label>
                            <select
                                value={statusData.status}
                                onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Novo">Novo</option>
                                <option value="Contatado">Contatado</option>
                                <option value="Sem Retorno">Sem Retorno</option>
                                <option value="Não Vendido">Não Vendido</option>
                                <option value="Vendido">Vendido</option>
                            </select>
                        </div>

                        {statusData.status === 'Vendido' && (
                            <div className="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-900">
                                <h3 className="text-white font-medium mb-3">Detalhes da Venda</h3>

                                <div className="mb-3">
                                    <label className="block text-gray-300 mb-2">Tipo de Venda</label>
                                    <select
                                        value={statusData.saleDetails?.type || ''}
                                        onChange={(e) => setStatusData({
                                            ...statusData,
                                            saleDetails: {
                                                ...statusData.saleDetails,
                                                type: e.target.value
                                            }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Selecione o tipo</option>
                                        <option value="Básico">Básico</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="block text-gray-300 mb-2">Valor (R$)</label>
                                    <input
                                        type="number"
                                        value={statusData.saleDetails?.value || ''}
                                        onChange={(e) => setStatusData({
                                            ...statusData,
                                            saleDetails: {
                                                ...statusData.saleDetails,
                                                value: parseFloat(e.target.value) || null
                                            }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2">Observações</label>
                                    <textarea
                                        value={statusData.saleDetails?.notes || ''}
                                        onChange={(e) => setStatusData({
                                            ...statusData,
                                            saleDetails: {
                                                ...statusData.saleDetails,
                                                notes: e.target.value
                                            }
                                        })}
                                        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                                        placeholder="Detalhes adicionais da venda..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={closeStatusModal}
                            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleUpdateStatus}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                        >
                            Salvar
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    };

    // Renderizar estatísticas
    const renderStats = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                >
                    <h3 className="text-lg font-medium text-gray-300">Total de Leads</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-r from-red-900 to-red-700 rounded-xl p-6 border border-red-700"
                >
                    <h3 className="text-lg font-medium text-red-100">Leads Quentes 🔥</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.hot}</p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-r from-yellow-800 to-yellow-600 rounded-xl p-6 border border-yellow-700"
                >
                    <h3 className="text-lg font-medium text-yellow-100">Leads Mornos ⚖️</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.warm}</p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-6 border border-blue-700"
                >
                    <h3 className="text-lg font-medium text-blue-100">Leads Frios ❄️</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.cold}</p>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-xl p-6 border border-purple-700"
                >
                    <h3 className="text-lg font-medium text-purple-100">Taxa de Conversão</h3>
                    <p className="text-3xl font-bold text-white mt-2">{stats.conversionRate}%</p>
                </motion.div>
            </div>
        );
    };

    // Renderizar filtros
    const renderFilters = () => {
        return (
            <div className="flex space-x-2 mb-6">
                <button
                    className={`px-4 py-2 rounded-lg ${filter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    onClick={() => setFilter('all')}
                >
                    Todos
                </button>
                <button
                    className={`px-4 py-2 rounded-lg ${filter === 'Quente 🔥'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    onClick={() => setFilter('Quente 🔥')}
                >
                    Quentes 🔥
                </button>
                <button
                    className={`px-4 py-2 rounded-lg ${filter === 'Morno ⚖️'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    onClick={() => setFilter('Morno ⚖️')}
                >
                    Mornos ⚖️
                </button>
                <button
                    className={`px-4 py-2 rounded-lg ${filter === 'Frio ❄️'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                    onClick={() => setFilter('Frio ❄️')}
                >
                    Frios ❄️
                </button>
            </div>
        );
    };

    // Renderizar gráfico de resumo
    const renderSummaryChart = () => {
        return (
            <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">Distribuição de Leads</h3>

                <div className="flex items-center h-8 mb-4 w-full rounded-full overflow-hidden bg-gray-900">
                    {stats.hot > 0 && (
                        <div
                            className="h-full bg-gradient-to-r from-red-700 to-red-500 flex items-center justify-center px-2 text-xs font-medium text-white"
                            style={{ width: `${(stats.hot / stats.total) * 100}%` }}
                        >
                            {stats.hot > 0 ? `${((stats.hot / stats.total) * 100).toFixed(1)}%` : ''}
                        </div>
                    )}

                    {stats.warm > 0 && (
                        <div
                            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-500 flex items-center justify-center px-2 text-xs font-medium text-white"
                            style={{ width: `${(stats.warm / stats.total) * 100}%` }}
                        >
                            {stats.warm > 0 ? `${((stats.warm / stats.total) * 100).toFixed(1)}%` : ''}
                        </div>
                    )}

                    {stats.cold > 0 && (
                        <div
                            className="h-full bg-gradient-to-r from-blue-700 to-blue-500 flex items-center justify-center px-2 text-xs font-medium text-white"
                            style={{ width: `${(stats.cold / stats.total) * 100}%` }}
                        >
                            {stats.cold > 0 ? `${((stats.cold / stats.total) * 100).toFixed(1)}%` : ''}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center space-x-6">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
                        <span className="text-gray-300 text-sm">Quentes</span>
                    </div>

                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-600 mr-2"></div>
                        <span className="text-gray-300 text-sm">Mornos</span>
                    </div>

                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                        <span className="text-gray-300 text-sm">Frios</span>
                    </div>
                </div>
            </div>
        );
    };

    // Renderizar tabela de leads
    const renderLeadsTable = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-900 bg-opacity-25 border border-red-800 text-red-100 px-4 py-3 rounded-lg">
                    {error}
                </div>
            );
        }

        if (leads.length === 0) {
            return (
                <div className="bg-gray-800 bg-opacity-50 border border-gray-700 text-gray-300 px-6 py-8 rounded-lg text-center">
                    Nenhum lead encontrado com os filtros atuais.
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 rounded-xl overflow-hidden">
                    <thead>
                        <tr className="bg-gray-900">
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Nome</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Nicho</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">WhatsApp</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Pontuação</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Tipo</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Status</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-300">Data</th>
                            <th className="py-3 px-4 text-center text-sm font-medium text-gray-300">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {leads.map((lead) => (
                            <motion.tr
                                key={lead._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                                className="hover:bg-gray-700 cursor-pointer"
                                onClick={() => openLeadDetails(lead)}
                            >
                                <td className="py-3 px-4 text-white">{lead.name}</td>
                                <td className="py-3 px-4 text-gray-300">{lead.niche}</td>
                                <td className="py-3 px-4 text-gray-300">{lead.whatsapp}</td>
                                <td className="py-3 px-4 text-gray-300">{lead.score}</td>
                                <td className="py-3 px-4">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm ${lead.leadType === 'Quente 🔥'
                                            ? 'bg-red-900 text-red-100'
                                            : lead.leadType === 'Morno ⚖️'
                                                ? 'bg-yellow-800 text-yellow-100'
                                                : 'bg-blue-900 text-blue-100'
                                            }`}
                                    >
                                        {lead.leadType}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm ${(lead.status === 'Vendido')
                                            ? 'bg-green-900 text-green-100'
                                            : (lead.status === 'Contatado')
                                                ? 'bg-blue-900 text-blue-100'
                                                : (lead.status === 'Sem Retorno')
                                                    ? 'bg-yellow-900 text-yellow-100'
                                                    : (lead.status === 'Não Vendido')
                                                        ? 'bg-red-900 text-red-100'
                                                        : 'bg-gray-700 text-gray-300'
                                            }`}
                                    >
                                        {lead.status || 'Novo'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-gray-300">{formatDate(lead.createdAt)}</td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                contactViaWhatsApp(lead.whatsapp);
                                            }}
                                            className="p-2 bg-green-800 hover:bg-green-700 rounded-lg text-green-100 transition-colors"
                                            title="Contatar via WhatsApp"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openStatusModal(lead);
                                            }}
                                            className="p-2 bg-indigo-800 hover:bg-indigo-700 rounded-lg text-indigo-100 transition-colors"
                                            title="Atualizar Status"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                confirmDeleteLead(lead._id);
                                            }}
                                            className="p-2 bg-red-800 hover:bg-red-700 rounded-lg text-red-100 transition-colors"
                                            title="Excluir Lead"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Confirmação de exclusão */}
                                    {deleteConfirm === lead._id && (
                                        <div
                                            className="absolute bg-gray-900 bg-opacity-95 rounded-lg p-3 shadow-lg mt-2 -ml-16 z-10 border border-red-800"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <p className="text-white text-sm mb-2">Confirmar exclusão?</p>
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white text-xs rounded"
                                                    onClick={() => handleDeleteLead(lead._id)}
                                                >
                                                    Sim
                                                </button>
                                                <button
                                                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded"
                                                    onClick={cancelDelete}
                                                >
                                                    Não
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard de Leads</h1>
                        <p className="text-gray-300 mt-1">Gerencie e analise seus leads qualificados</p>
                    </div>
                    <div className="flex space-x-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg transition-colors"
                            onClick={loadLeads}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Atualizar
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg transition-colors"
                            onClick={() => exportLeadsToCSV()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Exportar CSV
                        </motion.button>
                    </div>
                </div>

                {renderStats()}
                {renderSummaryChart()}
                {renderFilters()}
                {renderLeadsTable()}
                {renderLeadDetailsModal()}
                {renderStatusModal()}
            </div>
        </div>
    );
};

export default Dashboard;