import React, { useEffect, useRef, useMemo } from 'react';
import { Transaction } from '../types';

// Declaração da biblioteca Chart.js carregada via CDN
declare var Chart: any;

interface DashboardProps {
    transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    const summaryData = useMemo(() => {
        const totalSales = transactions.reduce((acc, t) => {
            const valueKey = 'Valor de compra com impostos';
            const value = parseFloat(String(t[valueKey] || '0').replace(',', '.'));
            return acc + (isNaN(value) ? 0 : value);
        }, 0);

        const totalTransactions = transactions.length;
        const averageTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
        
        return { totalSales, totalTransactions, averageTransactionValue };
    }, [transactions]);

    const categoryChartData = useMemo(() => {
        const counts: { [key: string]: number } = {};
        transactions.forEach(t => {
            if (t.category) {
                counts[t.category] = (counts[t.category] || 0) + 1;
            }
        });
        
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Limita às 10 maiores categorias para melhor visualização
    }, [transactions]);

    useEffect(() => {
        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;
        
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        
        if(categoryChartData.length === 0) {
            return;
        }

        const labels = categoryChartData.map(cat => cat.name);
        const data = categoryChartData.map(cat => cat.count);

        const backgroundColors = [
            '#3b82f6', '#10b981', '#ef4444', '#f97316', '#8b5cf6',
            '#ec4899', '#f59e0b', '#14b8a6', '#6366f1', '#d946ef'
        ];

        chartInstanceRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Vendas por Categoria',
                    data: data,
                    backgroundColor: backgroundColors.slice(0, data.length),
                    borderColor: '#fff',
                    borderWidth: 2,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { padding: 15, font: { size: 12 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context: any) {
                                let label = context.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed !== null) {
                                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                    const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(2) : 0;
                                    label += `${context.raw} (${percentage}%)`;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [categoryChartData]);

    return (
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico */}
            <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Distribuição de Vendas por Categoria</h3>
                {categoryChartData.length > 0 ? (
                    <div className="relative h-80">
                        <canvas ref={chartRef}></canvas>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-80 text-gray-500">
                        <p>Nenhum dado para exibir no gráfico.</p>
                    </div>
                )}
            </div>
            
            {/* Cards de Resumo */}
            <div className="space-y-6">
                <div className="bg-white p-5 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full"><svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg></div>
                    <div>
                        <p className="text-sm text-gray-500">Valor Total Filtrado</p>
                        <p className="text-2xl font-bold text-gray-800">R$ {summaryData.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-sm flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full"><svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></div>
                    <div>
                        <p className="text-sm text-gray-500">Transações Filtradas</p>
                        <p className="text-2xl font-bold text-gray-800">{summaryData.totalTransactions}</p>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow-sm flex items-center gap-4">
                     <div className="bg-yellow-100 p-3 rounded-full"><svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11V3m0 8h8m-8 0H3m0 0h8m-4 4v.01" /></svg></div>
                    <div>
                        <p className="text-sm text-gray-500">Valor Médio por Transação</p>
                        <p className="text-2xl font-bold text-gray-800">R$ {summaryData.averageTransactionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
