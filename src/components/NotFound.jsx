// src/components/NotFound.jsx
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-gray-700 max-w-md w-full text-center"
            >
                <div className="flex items-center justify-center mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500 mx-1"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mx-1"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 mx-1"></div>
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-indigo-400 mb-6">Página Não Encontrada</h2>
                <p className="text-gray-300 mb-8">
                    Oops! A página que você está procurando não existe ou foi movida.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    onClick={() => window.location.href = '/'}
                >
                    Voltar para o Quiz
                </motion.button>
            </motion.div>
        </div>
    );
};

export default NotFound;