import React from 'react';
import { Category } from '../types';

interface SidebarProps {
    categories: Category[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategory, setSelectedCategory }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">Categorias</h3>
            </div>
            <div className="p-2">
                {categories.length > 0 ? (
                    <ul>
                        {categories.map((category) => (
                            <li key={category.name} className="my-1">
                                <button
                                    onClick={() => setSelectedCategory(category.name)}
                                    className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-all duration-200 ease-in-out
                                        ${selectedCategory === category.name 
                                            ? 'bg-blue-600 text-white shadow-md' 
                                            : 'hover:bg-blue-100 hover:text-blue-700'
                                        }`}
                                >
                                    <span className="font-semibold">{category.name}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-sm font-bold
                                        ${selectedCategory === category.name 
                                            ? 'bg-white text-blue-600' 
                                            : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {category.count}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="p-4 text-center text-sm text-gray-500">Carregue um relatório para ver as categorias.</p>
                )}
            </div>
        </div>
    );
};

export default Sidebar;