// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Obter o diretório atual no ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '.env') });

// Importação dinâmica do modelo Lead
const Lead = mongoose.model('Lead', new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now
    }
}));

// Inicializa o Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conecta ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.post('/api/leads', async (req, res) => {
    try {
        const { name, niche, whatsapp, answers, score, leadType } = req.body;

        // Cria um novo lead
        const lead = await Lead.create({
            name,
            niche,
            whatsapp,
            answers,
            score,
            leadType
        });

        res.status(201).json({
            success: true,
            data: lead
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Rota para obter todos os leads
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leads.length,
            data: leads
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Rota para obter leads por tipo
app.get('/api/leads/type/:type', async (req, res) => {
    try {
        const leads = await Lead.find({ leadType: req.params.type }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: leads.length,
            data: leads
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Rota para obter um lead específico
app.get('/api/leads/:id', async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Rota para excluir um lead
app.delete('/api/leads/:id', async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead não encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Define a porta
const PORT = process.env.PORT || 5000;

// Inicia o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));