import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateLeadStatus } from '../services/api';

/**
 * Componente de dropdown para atualização de status de leads
 */
const StatusDropdown = ({ lead, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const dropdownRef = useRef(null);

    // Status disponíveis
    const statusOptions = [
        { value: "Novo", className: "bg-gray-700 text-gray-300" },
        { value: "Contatado", className: "bg-blue-900 text-blue-100" },
        { value: "Sem Retorno", className: "bg-yellow-900 text-yellow-100" },
        { value: "Não Vendido", className: "bg-red-900 text-red-100" },
        { value: "Vendido", className: "bg-green-900 text-green-100" }
    ];

    // Status atual do lead
    const currentStatus = lead.status || 'Novo';

    // Encontra a classe CSS para o status atual
    const getCurrentStatusClass = () => {
        const option = statusOptions.find(opt => opt.value === currentStatus);
        return option ? option.className : statusOptions[0].className;
    };

    // Fecha o dropdown ao clicar fora dele
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Atualiza o status do lead
    const handleStatusChange = async (newStatus) => {
        // Não faz nada se o status não mudou
        if (newStatus === currentStatus) {
            setIsOpen(false);
            return;
        }

        try {
            setUpdating(true);

            // Prepara os dados de status
            const statusData = {
                status: newStatus,
                saleDetails: lead.saleDetails || {
                    type: null,
                    value: null,
                    notes: ''
                }
            };

            // Se o status for "Vendido", pode abrir um modal ou formulário adicional aqui
            // para coletar detalhes da venda em vez de enviar diretamente

            // Atualiza o status no servidor
            const updatedLead = await updateLeadStatus(lead._id, statusData);

            // Notifica o componente pai sobre a mudança
            if (onStatusChange) {
                onStatusChange(updatedLead);
            }

            console.log(`Status atualizado: ${currentStatus} -> ${newStatus}`);

        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert('Erro ao atualizar status. Tente novamente.');
        } finally {
            setUpdating(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            {/* Status atual (clicável) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={updating}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getCurrentStatusClass()} ${updating ? 'opacity-75 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
                <span>{currentStatus}</span>
                <svg
                    className={`ml-1 h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>

                {updating && (
                    <svg className="animate-spin ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-gray-800 border border-gray-700"
                    >
                        <div className="py-1 rounded-md bg-gray-800 shadow-xs">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(option.value)}
                                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${option.value === currentStatus
                                            ? 'bg-gray-700 ' + option.className
                                            : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                    disabled={updating}
                                >
                                    {option.value}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StatusDropdown;