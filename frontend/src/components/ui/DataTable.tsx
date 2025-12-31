import {
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Filter,
    Search,
    Edit,
    Trash2
} from 'lucide-react';
import { useState } from 'react';

export interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    loading?: boolean;
}

export function DataTable<T extends { id: number | string }>({
    columns,
    data,
    onEdit,
    onDelete,
    loading
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter & Pagination logic would be here
    // For now rendering simplified view

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-sm group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all text-sm">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-700">
                            {columns.map((col) => (
                                <th key={String(col.key)} className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-primary-400 transition-colors">
                                        {col.header}
                                        {col.sortable && <ArrowUpDown className="w-3 h-3" />}
                                    </div>
                                </th>
                            ))}
                            {(onEdit || onDelete) && (
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-500">
                                    Loading data...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-slate-500">
                                    No data found
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="data-table-row group">
                                    {columns.map((col) => (
                                        <td key={`${item.id}-${String(col.key)}`} className="px-6 py-4 text-sm text-slate-300">
                                            {col.render ? col.render(item) : String(item[col.key as keyof T])}
                                        </td>
                                    ))}

                                    {(onEdit || onDelete) && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(item)}
                                                        className="p-2 text-slate-400 hover:text-primary-400 hover:bg-slate-700 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(item)}
                                                        className="p-2 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-700 flex items-center justify-between text-sm text-slate-500">
                <div>Showing 1 to {Math.min(itemsPerPage, data.length)} of {data.length} entries</div>
                <div className="flex gap-2">
                    <button
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1 bg-primary-600 text-white rounded-lg">1</button>
                    <button className="px-3 py-1 hover:bg-slate-700 rounded-lg transition-colors">2</button>
                    <button className="px-3 py-1 hover:bg-slate-700 rounded-lg transition-colors">3</button>
                    <button
                        className="p-2 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
