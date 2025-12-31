import { useState } from 'react';
import type { WaterObject } from '../../types/waterObject';
import { X, Save, Info, ExternalLink, CheckCircle } from 'lucide-react';

interface RightPanelProps {
    selectedObject: WaterObject | null;
    onClose: () => void;
    onSave?: (data: Partial<WaterObject>) => void;
}

export function RightPanel({ selectedObject, onClose, onSave }: RightPanelProps) {
    const [formData, setFormData] = useState<Partial<WaterObject>>({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = async () => {
        if (!selectedObject) return;
        setSaving(true);

        // Simulate save
        await new Promise(r => setTimeout(r, 500));

        if (onSave) {
            onSave({ ...formData, id: selectedObject.id });
        }

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!selectedObject) {
        return (
            <div className="h-full flex flex-col p-6 text-slate-500 dark:text-slate-400">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Map Legend</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-1 bg-blue-500 rounded-full" />
                        <span>Rivers / Canals</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500/30 border border-blue-500 rounded" />
                        <span>Lakes / Reservoirs</span>
                    </div>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex gap-2 mb-2 text-primary-500 font-medium">
                            <Info className="w-4 h-4" />
                            <span>How to Edit</span>
                        </div>
                        <p className="mb-2">1. Use the <strong>Pointer</strong> tool to select an object.</p>
                        <p>2. Use the <strong>Pencil</strong> tool to edit its geometry.</p>
                        <p>3. Toggle layers to filter the map view.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Properties</h2>
                    <p className="text-xs text-slate-500 capitalize">{selectedObject.object_type} • ID: {selectedObject.id}</p>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Main Info */}
                <section className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">General Information</h3>

                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400">Kazakh Name</label>
                        <input
                            type="text"
                            defaultValue={selectedObject.name_kz}
                            onChange={(e) => handleChange('name_kz', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400">Russian Name</label>
                            <input
                                type="text"
                                defaultValue={selectedObject.name_ru}
                                onChange={(e) => handleChange('name_ru', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400">English Name</label>
                            <input
                                type="text"
                                defaultValue={selectedObject.name_en}
                                onChange={(e) => handleChange('name_en', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Physical Data */}
                <section className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Physical Attributes</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400">Area (km²)</label>
                            <input
                                type="number"
                                defaultValue={selectedObject.area_km2}
                                onChange={(e) => handleChange('area_km2', parseFloat(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400">Volume (km³)</label>
                            <input
                                type="number"
                                defaultValue={selectedObject.water_volume_km3}
                                onChange={(e) => handleChange('water_volume_km3', parseFloat(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400">Max Depth (m)</label>
                            <input
                                type="number"
                                defaultValue={selectedObject.max_depth_m}
                                onChange={(e) => handleChange('max_depth_m', parseFloat(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500 dark:text-slate-400">Salinity</label>
                            <select
                                onChange={(e) => handleChange('salinity', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500 outline-none"
                            >
                                <option>Fresh</option>
                                <option>Brackish</option>
                                <option>Saline</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* External Data */}
                <section className="space-y-4">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Data Sources</h3>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 dark:text-slate-300">OpenStreetMap</span>
                            <a
                                href={`https://www.openstreetmap.org/way/${selectedObject.canonical_id?.replace('osm-', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-500 text-xs flex items-center gap-1 hover:underline"
                            >
                                View <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 dark:text-slate-300">NASA WorldView</span>
                            <a href="https://worldview.earthdata.nasa.gov/" target="_blank" rel="noopener noreferrer" className="text-primary-500 text-xs flex items-center gap-1 hover:underline">
                                View <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-10">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${saved
                            ? 'bg-emerald-500 text-white'
                            : 'bg-primary-600 hover:bg-primary-500 text-white'
                        } disabled:opacity-50`}
                >
                    {saved ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
