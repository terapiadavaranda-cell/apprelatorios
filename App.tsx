

import React, { useState, useMemo, useRef } from 'react';
import { Transaction, Category } from './types';
import { parseReport } from './services/parser';
import Sidebar from './components/Sidebar';
import TransactionList from './components/TransactionList';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';
import ValidationTool from './components/ValidationTool';
import StatusFilter from './components/StatusFilter';
import Dashboard from './components/Dashboard';

// Declaração das bibliotecas globais carregadas via CDN
declare var pdfjsLib: any;
declare var XLSX: any;

interface PdfjsTextItem { str: string; }

const App: React.FC = () => {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Todas as Categorias');
    const [selectedStatus, setSelectedStatus] = useState<string>('Todos os Status');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estado para a ferramenta de validação
    const [validationInput, setValidationInput] = useState('');
    const [validationField, setValidationField] = useState<keyof Transaction>('Código da transação');
    const [validatedTransactionIds, setValidatedTransactionIds] = useState<Set<string>>(new Set());
    const [validationMessage, setValidationMessage] = useState<string | null>(null);

    const transactionStatuses = useMemo(() => {
        const statuses = new Set(allTransactions.map(t => t['Status da transação']).filter(Boolean));
        return ['Todos os Status', ...Array.from(statuses).sort()];
    }, [allTransactions]);

    const filteredTransactions = useMemo(() => {
        return allTransactions
            .filter(transaction => {
                if (selectedCategory === 'Todas as Categorias') return true;
                return transaction.category === selectedCategory;
            })
            .filter(transaction => {
                if (selectedStatus === 'Todos os Status') return true;
                return transaction['Status da transação'] === selectedStatus;
            })
            .filter(transaction => {
                if (searchTerm.trim() === '') return true;
                const lowercasedFilter = searchTerm.toLowerCase();
                return Object.values(transaction).some(value =>
                    String(value).toLowerCase().includes(lowercasedFilter)
                );
            });
    }, [allTransactions, selectedCategory, selectedStatus, searchTerm]);

    const handleFilterChange = () => {
        setCurrentPage(1);
        setExpandedTransactionId(null);
    };
    
    React.useEffect(() => {
        handleFilterChange();
    }, [selectedCategory, searchTerm, selectedStatus]);

    const handleItemsPerPageChange = (newSize: number) => {
        setItemsPerPage(newSize);
        setCurrentPage(1);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
    
    const handleToggleDetails = (transactionId: string) => {
        setExpandedTransactionId(prevId => (prevId === transactionId ? null : transactionId));
    };

    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) return;
    
        const sanitizedCategoryName = selectedCategory
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w-]/g, '');
    
        const fileName = `relatorio_${sanitizedCategoryName}.csv`;
    
        const headers = Object.keys(filteredTransactions[0]);
        const csvRows = [headers.join(',')];
    
        filteredTransactions.forEach(transaction => {
            const values = headers.map(header => {
                const value = transaction[header as keyof Transaction] || '';
                const escaped = ('' + value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        });
    
        const csvString = csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const resetViewState = () => {
        setSelectedCategory('Todas as Categorias');
        setSelectedStatus('Todos os Status');
        setSearchTerm('');
        setCurrentPage(1);
        setExpandedTransactionId(null);
    };

    const mergeData = (newTransactions: Transaction[]) => {
        // Combina transações antigas e novas, permitindo que novas com o mesmo ID substituam as antigas.
        const transactionMap = new Map(allTransactions.map(t => [t.id, t]));
        newTransactions.forEach(t => transactionMap.set(t.id, t));
        const finalTransactions = Array.from(transactionMap.values());
    
        // Recalcula as categorias a partir da lista completa e atualizada de transações. Esta é a fonte da verdade.
        const categoryCounts = finalTransactions.reduce((acc: { [key: string]: number }, t: Transaction) => {
            acc[t.category] = (acc[t.category] || 0) + 1;
            return acc;
        }, {});
    
        const finalCategories = Object.entries(categoryCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    
        // Atualiza ambos os estados
        setAllTransactions(finalTransactions);
        setCategories([
            { name: 'Todas as Categorias', count: finalTransactions.length },
            ...finalCategories
        ]);
    };

    const processReportText = (text: string) => {
        if (!text) throw new Error("O conteúdo do arquivo está vazio ou não pôde ser lido.");
        
        const { transactions } = parseReport(text);

        if (transactions.length === 0) {
            throw new Error("O formato do arquivo é inválido ou não contém transações reconhecíveis.");
        }
        
        mergeData(transactions);
    };

    const processJsonData = (data: any[]) => {
        if (data.length === 0) throw new Error("A planilha do Excel está vazia ou em um formato não suportado.");

        const categoryKey = 'Nome deste preço';
        const idKey = 'Código da transação';

        if (!data[0] || !data[0][categoryKey] || !data[0][idKey]) {
            throw new Error(`A planilha do Excel precisa ter as colunas "${categoryKey}" e "${idKey}".`);
        }

        const transactions: Transaction[] = data.map((row, index) => ({
            ...Object.fromEntries(Object.entries(row).map(([k, v]) => [k, String(v)])),
            id: String(row[idKey] || `excel-row-${index}`),
            category: String(row[categoryKey]),
        } as Transaction));

        mergeData(transactions);
    };


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
    
        setError(null);
    
        for (const file of files) {
            try {
                const fileName = file.name.toLowerCase();
    
                if (fileName.endsWith('.pdf')) {
                    const arrayBuffer = await file.arrayBuffer();
                    const typedarray = new Uint8Array(arrayBuffer);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map((s: PdfjsTextItem) => s.str).join(' ');
                    }
                    processReportText(fullText);
                } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                    const arrayBuffer = await file.arrayBuffer();
                    const data = new Uint8Array(arrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
                    processJsonData(jsonData);
                } else { // Assume .txt or other text-based files
                    const text = await file.text();
                    processReportText(text);
                }
            } catch (err) {
                // Fix: Safely handle the 'unknown' type of the error object in the catch block.
                const errorMessage = err instanceof Error ? err.message : String(err);
                setError(`Erro ao processar o arquivo "${file.name}": ${errorMessage}`);
                // Stop processing further files if one fails
                break;
            }
        }
    
        if (event.target) {
            event.target.value = ''; // Reset file input
        }
    };

    const handleClearData = () => {
        setAllTransactions([]);
        setCategories([]);
        setValidatedTransactionIds(new Set());
        setError(null);
        setValidationMessage(null);
        resetViewState();
    };

    const handleValidate = () => {
        const identifiersToValidate = new Set(
            validationInput.split('\n').map(line => line.trim()).filter(Boolean)
        );
    
        if (identifiersToValidate.size === 0) {
            setValidationMessage("Por favor, insira dados para validar.");
            return;
        }
    
        const newValidatedIds = new Set(validatedTransactionIds);
        const foundIdentifiers = new Set<string>();
    
        // Crie um mapa dos identificadores de entrada em minúsculas para os originais para uma correspondência insensível a maiúsculas e minúsculas.
        const lowercasedIdentifierMap = new Map<string, string>();
        identifiersToValidate.forEach(id => lowercasedIdentifierMap.set(id.toLowerCase(), id));
    
        allTransactions.forEach(transaction => {
            const value = transaction[validationField];
            if (value) {
                const lowercasedValue = String(value).toLowerCase();
                // Verifique se o valor da transação (em minúsculas) existe no nosso mapa.
                if (lowercasedIdentifierMap.has(lowercasedValue)) {
                    newValidatedIds.add(transaction.id);
                    // Recupere o identificador original com maiúsculas e minúsculas da entrada e adicione-o aos foundIdentifiers.
                    const originalIdentifier = lowercasedIdentifierMap.get(lowercasedValue)!;
                    foundIdentifiers.add(originalIdentifier);
                }
            }
        });
    
        const notFoundIdentifiers = new Set(
            [...identifiersToValidate].filter(id => !foundIdentifiers.has(id))
        );
    
        setValidatedTransactionIds(newValidatedIds);
    
        let message = `Validação concluída. ${foundIdentifiers.size} encontrado(s) na planilha.`;
        if (notFoundIdentifiers.size > 0) {
            message += ` ${notFoundIdentifiers.size} não encontrado(s): ${Array.from(notFoundIdentifiers).join(', ')}.`;
        }
        
        setValidationMessage(message);
    };
    
    const handleClearValidation = () => {
        setValidatedTransactionIds(new Set());
        setValidationMessage("Validações limpas.");
    };


    return (
        <div className="flex flex-col h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-md p-4 z-20 flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Relatório de Vendas</h1>
                    <p className="text-gray-500">Consulte e filtre as transações por categoria.</p>
                </div>
                 <div className="flex items-center gap-2">
                    {allTransactions.length > 0 && (
                         <button
                            onClick={handleClearData}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-all cursor-pointer"
                            role="button"
                            aria-label="Limpar todos os dados carregados"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                            <span>Limpar Dados</span>
                        </button>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".txt,.pdf,.xlsx,.xls"
                        multiple
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all cursor-pointer"
                        role="button"
                        aria-label="Carregar arquivo de relatório"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Carregar Relatório(s)</span>
                    </label>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 overflow-y-auto">
                <div className="lg:col-span-1 h-fit lg:sticky lg:top-6 space-y-6">
                    <Sidebar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                    />
                    <ValidationTool
                        validationInput={validationInput}
                        setValidationInput={setValidationInput}
                        validationField={validationField}
                        setValidationField={setValidationField}
                        onValidate={handleValidate}
                        onClearValidation={handleClearValidation}
                        message={validationMessage}
                    />
                </div>

                <div className="lg:col-span-3">
                    {error && (
                         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6" role="alert">
                            <p className="font-bold">Erro!</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {allTransactions.length > 0 ? (
                        <div className="space-y-6">
                            <Dashboard transactions={filteredTransactions} />
                            
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="flex flex-col sm:flex-row gap-4 items-center">
                                    <div className="w-full flex-1">
                                        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        <StatusFilter 
                                            statuses={transactionStatuses}
                                            selectedStatus={selectedStatus}
                                            setSelectedStatus={setSelectedStatus}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap justify-between items-center gap-4 text-gray-600">
                                    <p className="font-semibold text-lg">
                                        {filteredTransactions.length > 0 ? (
                                            <>
                                                Exibindo <span className="text-blue-600 font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)}</span> de <span className="font-bold">{filteredTransactions.length}</span> transações
                                            </>
                                        ) : (
                                            <span className="font-semibold text-lg">Nenhuma transação encontrada com os filtros atuais.</span>
                                        )}
                                    </p>
                                    <button
                                        onClick={handleExportCSV}
                                        disabled={filteredTransactions.length === 0}
                                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        aria-label="Exportar dados filtrados para CSV"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm1 5a1 1 0 100-2 1 1 0 000 2z" />
                                        </svg>
                                        <span>Exportar CSV</span>
                                    </button>
                                </div>
                            </div>
                            <TransactionList
                                transactions={currentTransactions}
                                onToggleDetails={handleToggleDetails}
                                expandedTransactionId={expandedTransactionId}
                                validatedTransactionIds={validatedTransactionIds}
                            />
                            <div className="mt-2 flex justify-center">
                            <Pagination
                                    totalItems={filteredTransactions.length}
                                    itemsPerPage={itemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={(page) => setCurrentPage(page)}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                />
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-center justify-center text-center text-gray-500 bg-white p-8 rounded-lg shadow-sm h-full">
                            <div className="max-w-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h2 className="text-2xl font-semibold mb-2">Bem-vindo ao Leitor de Relatórios</h2>
                                <p>Para começar, por favor, carregue um ou mais arquivos de relatório (.txt, .pdf, .xlsx).</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;