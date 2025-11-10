import React from 'react';
import { Transaction } from '../types';
import TransactionCard from './TransactionCard';
import TransactionDetails from './TransactionDetails';

interface TransactionListProps {
    transactions: Transaction[];
    onToggleDetails: (id: string) => void;
    expandedTransactionId: string | null;
    validatedTransactionIds: Set<string>;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onToggleDetails, expandedTransactionId, validatedTransactionIds }) => {
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-white p-8 rounded-lg shadow-sm">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <h3 className="text-xl font-semibold">Nenhuma Transação Encontrada</h3>
                <p className="mt-2">Tente ajustar seus filtros de busca ou selecionar outra categoria.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {transactions.map((transaction) => (
                <div key={transaction.id}>
                    <TransactionCard
                        transaction={transaction}
                        onToggleDetails={onToggleDetails}
                        isExpanded={expandedTransactionId === transaction.id}
                        isValidated={validatedTransactionIds.has(transaction.id)}
                    />
                    {expandedTransactionId === transaction.id && (
                        <TransactionDetails transaction={transaction} />
                    )}
                </div>
            ))}
        </div>
    );
};

export default TransactionList;