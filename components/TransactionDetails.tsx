import React from 'react';
import { Transaction } from '../types';

interface TransactionDetailsProps {
    transaction: Transaction;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction }) => {
    const detailsToDisplay = Object.entries(transaction).filter(
        ([key]) => key !== 'id' && key !== 'category'
    );

    return (
        <div 
            className="bg-white border-l border-r border-b border-gray-200 p-6 rounded-b-lg -mt-1 shadow-md"
            role="region"
            aria-labelledby={`transaction-details-${transaction.id}`}
        >
            <h3 id={`transaction-details-${transaction.id}`} className="sr-only">Detalhes para transação {transaction.id}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                {detailsToDisplay.map(([key, value]) => (
                    <div key={key} className="py-2 border-b border-gray-100">
                        <p className="font-semibold text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="text-gray-800 font-medium break-words">{value || 'N/A'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionDetails;
