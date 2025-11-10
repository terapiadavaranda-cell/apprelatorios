import React from 'react';
import { Transaction } from '../types';

interface ValidationToolProps {
    validationInput: string;
    setValidationInput: (value: string) => void;
    validationField: keyof Transaction;
    setValidationField: (field: keyof Transaction) => void;
    onValidate: () => void;
    onClearValidation: () => void;
    message: string | null;
}

const ValidationTool: React.FC<ValidationToolProps> = ({
    validationInput,
    setValidationInput,
    validationField,
    setValidationField,
    onValidate,
    onClearValidation,
    message
}) => {
    const validationOptions: { value: keyof Transaction; label: string }[] = [
        { value: 'Código da transação', label: 'Código da Transação' },
        { value: 'Email do(a) Comprador(a)', label: 'Email do Comprador' },
        { value: 'Documento', label: 'Documento' },
    ];

    return (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ferramenta de Validação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="validation-input" className="block text-sm font-medium text-gray-600 mb-1">
                        Cole os dados para validar (um por linha):
                    </label>
                    <textarea
                        id="validation-input"
                        rows={4}
                        value={validationInput}
                        onChange={(e) => setValidationInput(e.target.value)}
                        placeholder="HP2909912650&#10;francisjuvieira@gmail.com&#10;23024671838"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="validation-field" className="block text-sm font-medium text-gray-600 mb-1">
                        Validar por:
                    </label>
                    <select
                        id="validation-field"
                        value={validationField}
                        onChange={(e) => setValidationField(e.target.value as keyof Transaction)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                    >
                        {validationOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <div className="mt-2 flex gap-2">
                         <button
                            onClick={onValidate}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        >
                            <span>Validar Dados</span>
                        </button>
                        <button
                            onClick={onClearValidation}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all text-sm"
                        >
                            <span>Limpar</span>
                        </button>
                    </div>
                </div>
            </div>
            {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
        </div>
    );
};

export default ValidationTool;
