// src/components/Quiz.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveLead } from '../services/api';

const Quiz = () => {
    // Estados para controlar o quiz
    const [currentStep, setCurrentStep] = useState(0);
    const [userName, setUserName] = useState('');
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [leadType, setLeadType] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [niche, setNiche] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    // Perguntas do quiz conforme o fluxograma
    const questions = [
        {
            id: 0,
            text: "Antes de começarmos, como posso te chamar?",
            type: "text",
            fieldName: "name",
            placeholder: "Seu nome",
            options: [],
        },
        {
            id: 1,
            text: "Você gostaria de ter uma página que converte visitantes em clientes todos os dias?",
            type: "choice",
            options: [
                { text: "Sim, é o que eu quero!", value: "sim", score: 2 },
                { text: "Tenho dúvidas ainda", value: "duvidas", score: 0 },
            ],
        },
        {
            id: 2,
            text: "Qual dessas opções representa melhor seu momento atual?",
            type: "choice",
            options: [
                { text: "Já tenho produto ou serviço e quero escalar", value: "escalando", score: 3 },
                { text: "Estou começando agora, mas já sei o que quero vender", value: "iniciando", score: 2 },
                { text: "Tenho só a ideia por enquanto", value: "ideacao", score: 1 },
            ],
        },
        {
            id: 3,
            text: "Qual seu nicho ou segmento?",
            type: "text",
            fieldName: "niche",
            placeholder: "Ex: Marketing, Educação, Saúde...",
            options: [],
        },
        {
            id: 4,
            text: "Hoje, qual valor você conseguiria investir na criação da sua página?",
            type: "choice",
            options: [
                { text: "R$300 ou mais", value: "300plus", score: 3 },
                { text: "R$100 a R$300", value: "100a300", score: 2 },
                { text: "Menos de R$100", value: "menos100", score: 1 },
            ],
        },
        {
            id: 5,
            text: "O que você está buscando exatamente?",
            type: "choice",
            options: [
                { text: "Página completa com copy e design", value: "completa", score: 3 },
                { text: "Página simples e direta", value: "simples", score: 2 },
                { text: "Ainda não sei direito", value: "indeciso", score: 1 },
            ],
        },
        {
            id: 6,
            text: "Qual o seu nível de urgência?",
            type: "choice",
            options: [
                { text: "Quero começar essa semana", value: "urgente", score: 3 },
                { text: "Nas próximas semanas", value: "medio", score: 2 },
                { text: "Estou só pesquisando por enquanto", value: "futuro", score: 1 },
            ],
        },
        {
            id: 7,
            text: "Baseado no que você respondeu, posso te enviar uma sugestão personalizada pra te ajudar ainda hoje. Me fala seu WhatsApp aqui pra eu te mandar direto:",
            type: "text",
            fieldName: "whatsapp",
            placeholder: "Seu WhatsApp (com DDD)",
            options: [],
        },
    ];

    // Classifica o lead com base na pontuação
    const classifyLead = (totalScore) => {
        if (totalScore >= 14) return "Quente 🔥";
        if (totalScore >= 9) return "Morno ⚖️";
        return "Frio ❄️";
    };

    // Calcula a pontuação e classifica o lead quando todas as perguntas forem respondidas
    useEffect(() => {
        if (currentStep === questions.length) {
            let totalScore = Object.values(answers).reduce((total, answer) => {
                return total + (answer.score || 0);
            }, 0);

            const leadTypeResult = classifyLead(totalScore);
            setScore(totalScore);
            setLeadType(leadTypeResult);
            setIsComplete(true);

            // Enviar dados para o backend
            const leadData = {
                name: userName,
                niche: niche,
                answers: answers,
                score: totalScore,
                leadType: leadTypeResult,
                whatsapp: whatsapp
            };

            saveLead(leadData)
                .then(response => {
                    console.log('Lead salvo com sucesso:', response);
                })
                .catch(error => {
                    console.error('Erro ao salvar lead:', error);
                });
        }
    }, [currentStep, answers]);

    // Função para lidar com a resposta de texto
    const handleTextAnswer = (e) => {
        const { name, value } = e.target;

        if (name === "name") {
            setUserName(value);
        } else if (name === "niche") {
            setNiche(value);
        } else if (name === "whatsapp") {
            setWhatsapp(value);
        }
    };

    // Função para lidar com a resposta de escolha
    const handleChoiceAnswer = (option) => {
        setAnswers({
            ...answers,
            [currentStep]: {
                value: option.value,
                score: option.score
            }
        });

        setCurrentStep(currentStep + 1);
    };

    // Função para avançar após resposta de texto
    const handleNextStep = () => {
        // Validação básica: verificar se o campo de texto está preenchido
        const currentQuestion = questions[currentStep];

        if (currentQuestion.type === "text") {
            let isValid = false;

            if (currentQuestion.fieldName === "name" && userName) {
                isValid = true;
            } else if (currentQuestion.fieldName === "niche" && niche) {
                isValid = true;
            } else if (currentQuestion.fieldName === "whatsapp" && whatsapp) {
                isValid = true;
            }

            if (isValid) {
                setCurrentStep(currentStep + 1);
            } else {
                alert("Por favor, preencha o campo antes de continuar.");
            }
        }
    };

    // Renderização personalizada para cada tipo de pergunta
    const renderQuestion = () => {
        const currentQuestion = questions[currentStep];

        if (!currentQuestion) return null;

        // Personalização da pergunta com o nome do usuário (a partir da pergunta 1)
        let questionText = currentQuestion.text;
        if (currentStep > 0 && userName) {
            questionText = `Legal, ${userName}! ${questionText}`;
        }

        return (
            <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
            >
                <h2 className="text-xl font-semibold text-white mb-6">{questionText}</h2>

                {currentQuestion.type === "text" ? (
                    <div className="mb-6">
                        <input
                            type="text"
                            name={currentQuestion.fieldName}
                            placeholder={currentQuestion.placeholder}
                            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={
                                currentQuestion.fieldName === "name"
                                    ? userName
                                    : currentQuestion.fieldName === "niche"
                                        ? niche
                                        : whatsapp
                            }
                            onChange={handleTextAnswer}
                        />
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                            onClick={handleNextStep}
                        >
                            Continuar
                        </motion.button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-gray-800 text-white px-6 py-4 rounded-lg text-left hover:bg-gray-700 border border-gray-700 transition-colors"
                                onClick={() => handleChoiceAnswer(option)}
                            >
                                {option.text}
                            </motion.button>
                        ))}
                    </div>
                )}

                <div className="mt-6 flex justify-between text-gray-400 text-sm">
                    <span>{`Questão ${currentStep + 1} de ${questions.length}`}</span>
                    <div className="flex space-x-1">
                        {questions.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-blue-500" : "bg-gray-600"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    };
    // Adicione essas funções ao componente Quiz, antes do renderResult
    const handleHotLeadAction = () => {
        // Formatar número removendo caracteres especiais
        const formattedNumber = whatsapp.replace(/\D/g, '');

        // Mensagem personalizada (codificada para URL)
        const message = encodeURIComponent(`Olá ${userName}! Vi que você tem interesse em uma página de conversão para ${niche}. Posso te apresentar nossa solução completa?`);

        // Redirecionar para WhatsApp
        window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
    };

    const handleWarmLeadAction = () => {
        // Redirecionar para página de vendas
        window.location.href = 'https://seusite.com/pagina-de-vendas';
    };

    const handleColdLeadAction = () => {
        // Redirecionar para oferta de ticket menor
        window.location.href = 'https://seusite.com/oferta-especial';
    };

    // Renderização do resultado final
    const renderResult = () => {
        let redirectMessage = "";
        let actionButton = "";
        let handleAction = null;

        if (leadType === "Quente 🔥") {
            redirectMessage = "Você será redirecionado para o WhatsApp com uma proposta personalizada!";
            actionButton = "Falar com um consultor";
            handleAction = handleHotLeadAction;
        } else if (leadType === "Morno ⚖️") {
            redirectMessage = "Confira nossa página de vendas com mais detalhes!";
            actionButton = "Ver página de vendas";
            handleAction = handleWarmLeadAction;
        } else {
            redirectMessage = "Veja esta opção especial que preparamos para você:";
            actionButton = "Ver oferta especial";
            handleAction = handleColdLeadAction;
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <h2 className="text-2xl font-bold text-white mb-4">Obrigado por completar o quiz!</h2>
                <p className="mb-6 text-gray-300">
                    {redirectMessage}
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
                    onClick={handleAction}
                >
                    {actionButton}
                </motion.button>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700 mt-6">
                {/* Os botões macOS estão no navbar agora */}

                <AnimatePresence mode="wait">
                    {isComplete ? renderResult() : renderQuestion()}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Quiz;