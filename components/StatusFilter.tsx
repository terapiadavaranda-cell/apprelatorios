import React from 'react';

interface StatusFilterProps {
    statuses: string[];
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ statuses, selectedStatus, setSelectedStatus }) => {
    return (
        <div>
            <label htmlFor="status-filter" className="sr-only">
                Filtrar por Status
            </label>
            <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                aria-label="Filtrar transações por status"
            >
                {statuses.map(status => (
                    <option key={status} value={status}>
                        {status}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default StatusFilter;
