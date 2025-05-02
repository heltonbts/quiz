// backend/models/LeadModel.js
import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ['Novo', 'Contatado', 'Vendido', 'Sem Retorno', 'Não Vendido'],
        default: 'Novo'
    },
    saleDetails: {
        type: {
            type: String,
            enum: ['Básico', 'Standard', 'Premium', 'Outro'],
            default: null
        },
        value: {
            type: Number,
            default: null
        },
        notes: {
            type: String,
            default: ''
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Lead', LeadSchema);