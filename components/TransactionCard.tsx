
import React from 'react';
import { Transaction } from '../types';

interface TransactionCardProps {
    transaction: Transaction;
    onToggleDetails: (id: string) => void;
    isExpanded: boolean;
    isValidated: boolean;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const baseClasses = 'px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap';
    let specificClasses = '';

    switch (status.toLowerCase()) {
        case 'completo':
        case 'aprovado':
            specificClasses = 'bg-green-100 text-green-800';
            break;
        case 'pendente':
            specificClasses = 'bg-yellow-100 text-yellow-800';
            break;
        case 'reclamado':
            specificClasses = 'bg-orange-100 text-orange-800';
            break;
        case 'cancelado':
            specificClasses = 'bg-red-100 text-red-800';
            break;
        default:
            specificClasses = 'bg-gray-100 text-gray-800';
    }

    return <span className={`${baseClasses} ${specificClasses}`}>{status}</span>;
};

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onToggleDetails, isExpanded, isValidated }) => {
    const originalBuyerName = transaction['Comprador(a)'] || transaction['Email do(a) Comprador(a)'] || 'Comprador não identificado';
    const displayBuyerName = isValidated ? `${originalBuyerName} (Validado)` : originalBuyerName;
    const transactionDate = transaction['Data da transação']?.split(' ')[0] || 'N/A';
    const value = transaction['Valor de compra com impostos'] || '0';
    const currency = transaction['Moeda de compra'] || 'BRL';
    const status = transaction['Status da transação'] || 'N/A';

    const getStatusBorderColor = () => {
        switch (status.toLowerCase()) {
            case 'completo':
            case 'aprovado':
                return 'border-green-500';
            case 'pendente':
            case 'reclamado':
                return 'border-yellow-500';
            case 'cancelado':
                return 'border-red-500';
            default:
                return 'border-gray-300';
        }
    };

    return (
        <button
            onClick={() => onToggleDetails(transaction.id)}
            aria-expanded={isExpanded}
            className={`w-full bg-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 p-4 text-left flex items-center space-x-4 border-l-4 ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'} ${getStatusBorderColor()}`}
        >
            {isValidated && (
                <div className="flex-shrink-0" title="Validado">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>
            )}
             <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-gray-800 truncate" title={displayBuyerName}>{displayBuyerName}</p>
                <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">ID:</span> {transaction.id} &bull; <span className="font-medium">Data:</span> {transactionDate}
                </p>
            </div>
            
            <div className="flex flex-col items-end space-y-1 ml-auto pl-4">
                 <p className="text-lg font-bold text-green-600 whitespace-nowrap">
                    {currency} {parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <StatusBadge status={status} />
            </div>

            <div className="pl-2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </button>
    );
};

export default TransactionCard;
