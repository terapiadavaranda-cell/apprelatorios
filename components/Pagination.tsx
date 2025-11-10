import React, { useState, useEffect } from 'react';

interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (pageNumber: number) => void;
    onItemsPerPageChange: (newSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalItems, itemsPerPage, currentPage, onPageChange, onItemsPerPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageOptions = [12, 24, 48, 96];
    const [inputValue, setInputValue] = useState<string>(String(currentPage));

    useEffect(() => {
        setInputValue(String(currentPage));
    }, [currentPage]);

    if (totalPages <= 1) {
        return null; // Don't render pagination if there's only one page or less
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    
    const handlePageJump = () => {
        const pageNumber = parseInt(inputValue, 10);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            onPageChange(pageNumber);
        } else {
            setInputValue(String(currentPage));
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handlePageJump();
            e.preventDefault();
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <nav aria-label="Pagination" className="flex items-center gap-2">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página anterior"
                >
                    Anterior
                </button>
                
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>Página</span>
                    <input
                        type="number"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handlePageJump}
                        min="1"
                        max={totalPages}
                        aria-label="Página atual, insira um número para pular para a página"
                        className="w-16 p-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                    />
                    <span>de {totalPages}</span>
                </div>
                
                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Próxima página"
                >
                    Próximo
                </button>
            </nav>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <label htmlFor="items-per-page" className="font-medium">Itens por página:</label>
                <select
                    id="items-per-page"
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="bg-white px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
                >
                    {pageOptions.map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Pagination;