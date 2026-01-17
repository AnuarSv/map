import { useState, useEffect, useMemo } from 'react';
import { Search, Droplets, Waves, Mountain, MapPin, Filter, X, ChevronRight } from 'lucide-react';

interface WaterBody {
    name: string;
    name_ru: string;
    name_en: string;
    type: string;
    basin?: string;
    region?: string;
    river?: string;
    major?: boolean;
    area_km2?: number;
}

interface NomenclatureData {
    basins: { id: string; name_kz: string; name_ru: string; name_en: string }[];
    rivers: WaterBody[];
    lakes: WaterBody[];
    reservoirs: WaterBody[];
}

const typeIcons: Record<string, React.ElementType> = {
    river: Waves,
    lake: Droplets,
    reservoir: Mountain
};

const typeLabels: Record<string, string> = {
    river: 'River',
    lake: 'Lake',
    reservoir: 'Reservoir'
};

export default function WaterDirectoryPage() {
    const [data, setData] = useState<NomenclatureData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'river' | 'lake' | 'reservoir'>('all');
    const [selectedBasin, setSelectedBasin] = useState<string | null>(null);

    useEffect(() => {
        fetch('/data/water-nomenclature.json')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const allWaterBodies = useMemo(() => {
        if (!data) return [];
        return [
            ...data.rivers.map(r => ({ ...r, type: 'river' })),
            ...data.lakes.map(l => ({ ...l, type: 'lake' })),
            ...data.reservoirs.map(r => ({ ...r, type: 'reservoir' }))
        ];
    }, [data]);

    const filteredResults = useMemo(() => {
        let results = allWaterBodies;

        if (activeFilter !== 'all') {
            results = results.filter(w => w.type === activeFilter);
        }

        if (selectedBasin) {
            results = results.filter(w => w.basin === selectedBasin || w.region === selectedBasin);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            results = results.filter(w =>
                w.name.toLowerCase().includes(q) ||
                w.name_ru.toLowerCase().includes(q) ||
                w.name_en.toLowerCase().includes(q)
            );
        }

        return results.sort((a, b) => {
            if (a.major && !b.major) return -1;
            if (!a.major && b.major) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [allWaterBodies, activeFilter, selectedBasin, searchQuery]);

    const stats = useMemo(() => ({
        rivers: data?.rivers.length || 0,
        lakes: data?.lakes.length || 0,
        reservoirs: data?.reservoirs.length || 0,
        total: allWaterBodies.length
    }), [data, allWaterBodies]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Water Directory</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Kazakhstan water resources nomenclature
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded">{stats.rivers} rivers</span>
                    <span className="px-2 py-1 bg-cyan-500/10 text-cyan-500 rounded">{stats.lakes} lakes</span>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded">{stats.reservoirs} reservoirs</span>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search rivers, lakes, reservoirs..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Type Filter */}
                    <div className="flex gap-2">
                        {(['all', 'river', 'lake', 'reservoir'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setActiveFilter(type)}
                                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${activeFilter === type
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {type === 'all' ? 'All' : typeLabels[type]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Basin Filter */}
                {data?.basins && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-sm text-slate-500 dark:text-slate-400 mr-2 flex items-center gap-1">
                            <Filter className="w-4 h-4" /> Basin:
                        </span>
                        <button
                            onClick={() => setSelectedBasin(null)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${!selectedBasin
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            All basins
                        </button>
                        {data.basins.map(basin => (
                            <button
                                key={basin.id}
                                onClick={() => setSelectedBasin(basin.id)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedBasin === basin.id
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                            >
                                {basin.name_en}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((item, idx) => {
                    const Icon = typeIcons[item.type] || Droplets;
                    return (
                        <div
                            key={`${item.type}-${item.name}-${idx}`}
                            className={`group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all cursor-pointer ${item.major ? 'ring-1 ring-primary-500/20' : ''
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'river' ? 'bg-blue-500/10 text-blue-500' :
                                    item.type === 'lake' ? 'bg-cyan-500/10 text-cyan-500' :
                                        'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                            {item.name}
                                        </h3>
                                        {item.major && (
                                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-500 rounded">
                                                MAJOR
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {item.name_ru} / {item.name_en}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                        <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                                            {typeLabels[item.type]}
                                        </span>
                                        {item.basin && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {item.basin}
                                            </span>
                                        )}
                                        {item.area_km2 && (
                                            <span>{item.area_km2.toLocaleString()} km²</span>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredResults.length === 0 && (
                <div className="text-center py-12">
                    <Droplets className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No water bodies found</p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setActiveFilter('all');
                            setSelectedBasin(null);
                        }}
                        className="mt-2 text-primary-500 hover:underline text-sm"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
}
