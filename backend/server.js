// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // Certifique-se que 'cors' está no seu package.json e instalado
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Obter o diretório atual no ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega variáveis de ambiente (Ok para uso local, Render usa as variáveis do dashboard)
dotenv.config({ path: path.join(__dirname, '.env') });

// Definição do modelo Lead (como você forneceu)
const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório']
    },
    niche: {
        type: String,
        required: [true, 'Nicho é obrigatório']
    },
    whatsapp: {
        type: String,
        required: [true, 'WhatsApp é obrigatório']
    },
    answers: {
        type: Object,
        required: [true, 'Respostas são obrigatórias']
    },
    score: {
        type: Number,
        required: [true, 'Pontuação é obrigatória']
    },
    leadType: {
        type: String,
        enum: ['Quente 🔥', 'Morno ⚖️', 'Frio ❄️'],
        required: [true, 'Tipo de lead é obrigatório']
    },
    // Adicione outros campos que você possa querer atualizar via PUT/PATCH
    // Exemplo: status: { type: String, default: 'Novo' }
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

// Verifica se o modelo já foi compilado antes de compilar novamente
const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);


// Inicializa o Express
const app = express();

// --- Middleware ---

// Configuração do CORS (Permitindo especificamente seu frontend)
const allowedOrigins = ['https://productgenesis.shop']; // Adicione 'http://localhost:SEU_PORT_FRONTEND' se precisar testar localmente

const corsOptions = {
    origin: function (origin, callback) {
        // Permite requests sem 'origin' (ex: Postman, mobile apps) E requests da lista permitida
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200 // Para compatibilidade
};

app.use(cors(corsOptions)); // Aplica as opções de CORS

// Middleware para parsear JSON
app.use(express.json());

// --- Conexão com o MongoDB ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// --- Rotas da API ---

// Rota para criar um novo lead (POST)
app.post('/api/leads', async (req, res) => {
    try {
        // Considerar validação mais robusta dos dados de entrada aqui
        const lead = await Lead.create(req.body);
        res.status(201).json({ success: true, data: lead });
    } catch (error) {
        console.error("Erro ao criar lead:", error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Rota para obter todos os leads (GET)
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (error) {
        console.error("Erro ao obter leads:", error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao buscar leads' }); // Use 500 para erros de servidor
    }
});

// Rota para obter leads por tipo (GET)
app.get('/api/leads/type/:type', async (req, res) => {
    try {
        const leadTypeDecoded = decodeURIComponent(req.params.type);
        const leads = await Lead.find({ leadType: leadTypeDecoded }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (error) {
        console.error("Erro ao obter leads por tipo:", error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao buscar leads por tipo' });
    }
});

// Rota para obter um lead específico (GET)
app.get('/api/leads/:id', async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ success: false, error: 'Lead não encontrado' });
        }
        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        console.error("Erro ao obter lead por ID:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'ID do Lead inválido' });
        }
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao buscar lead' });
    }
});

// Rota para atualizar um lead (PUT) - *** NOVA ROTA ADICIONADA ***
app.put('/api/leads/:id', async (req, res) => {
    try {
        // Encontra o lead pelo ID e atualiza com os dados do corpo da requisição
        // { new: true } garante que o objeto retornado seja a versão atualizada
        // { runValidators: true } garante que as validações do Schema sejam aplicadas na atualização
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Se não encontrou o lead para atualizar
        if (!lead) {
            return res.status(404).json({ success: false, error: 'Lead não encontrado para atualização' });
        }

        // Retorna o lead atualizado
        res.status(200).json({ success: true, data: lead });

    } catch (error) {
        console.error("Erro ao atualizar lead:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'ID do Lead inválido' });
        }
        // Se for erro de validação do Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao atualizar lead' });
    }
});


// Rota para excluir um lead (DELETE)
app.delete('/api/leads/:id', async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) {
            return res.status(404).json({ success: false, error: 'Lead não encontrado para exclusão' });
        }
        res.status(200).json({ success: true, data: {} }); // Retorna sucesso com dados vazios
    } catch (error) {
        console.error("Erro ao deletar lead:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'ID do Lead inválido' });
        }
        res.status(500).json({ success: false, error: 'Erro interno do servidor ao deletar lead' });
    }
});

// --- Inicialização do Servidor ---
// Define a porta usando a variável de ambiente do Render ou 5000 como padrão
const PORT = process.env.PORT || 5000;

// Inicia o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
