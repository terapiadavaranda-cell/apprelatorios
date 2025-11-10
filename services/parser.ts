import { Transaction } from '../types';

export const parseReport = (reportText: string): { transactions: Transaction[] } => {
    const transactions: Transaction[] = [];

    const categorySections = reportText.split('### ').slice(1);

    for (const section of categorySections) {
        const lines = section.split('\n');
        const headerMatch = lines[0].match(/(.*?) \((\d+) transaç(?:ão|ões)\)/);
        if (!headerMatch) continue;

        const categoryName = headerMatch[1].trim();
        
        const transactionBlocks = section.split('- **Transação ').slice(1);

        for (const block of transactionBlocks) {
            const transactionLines = block.split('\n').slice(1);
            const transactionObject: { [key: string]: string } = {};

            for (const line of transactionLines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('- ')) {
                    const parts = trimmedLine.substring(2).split(':');
                    if (parts.length >= 2) {
                        const key = parts[0].trim();
                        const value = parts.slice(1).join(':').trim();
                        transactionObject[key] = value;
                    }
                }
            }

            if (transactionObject['Código da transação']) {
                transactions.push({
                    ...transactionObject,
                    category: categoryName,
                    id: transactionObject['Código da transação'],
                } as Transaction);
            }
        }
    }

    return { transactions };
};