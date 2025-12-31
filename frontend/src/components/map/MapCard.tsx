import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, Ruler, Droplets, MapPin, Waves } from 'lucide-react';

interface MapCardData {
    id: number;
    name: string;
    type: string;
    length?: number;
    depth?: number;
    area?: number;
    coords: [number, number];
}

interface MapCardProps {
    isOpen: boolean;
    onClose: () => void;
    data: MapCardData | null;
    canEdit?: boolean;
    onEdit?: () => void;
}

export function MapCard({ isOpen, onClose, data, canEdit, onEdit }: MapCardProps) {
    return (
        <AnimatePresence>
            {isOpen && data && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        className="fixed inset-0 bg-black/20 z-[999] md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-[1000] p-4 md:left-auto md:right-4 md:bottom-4 md:w-96"
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <div className="glass-panel rounded-2xl overflow-hidden">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-700/50 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-ocean-600/20">
                                        <Waves className="w-5 h-5 text-ocean-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">{data.name}</h2>
                                        <p className="text-sm text-slate-400 capitalize">{data.type}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 -m-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="p-4 grid grid-cols-2 gap-3">
                                {data.length !== undefined && (
                                    <StatItem icon={Ruler} label="Length" value={`${data.length} km`} />
                                )}
                                {data.depth !== undefined && (
                                    <StatItem icon={Droplets} label="Depth" value={`${data.depth} m`} />
                                )}
                                {data.area !== undefined && (
                                    <StatItem icon={Waves} label="Area" value={`${data.area} km2`} />
                                )}
                                <StatItem
                                    icon={MapPin}
                                    label="Location"
                                    value={`${data.coords[0].toFixed(2)}N, ${data.coords[1].toFixed(2)}E`}
                                />
                            </div>

                            {/* Actions */}
                            {canEdit && (
                                <div className="p-4 pt-0">
                                    <motion.button
                                        onClick={onEdit}
                                        className="w-full py-3 px-4 bg-ocean-600 hover:bg-ocean-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                    >
                                        <Pencil className="w-4 h-4" />
                                        Edit Object
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

interface StatItemProps {
    icon: React.ElementType;
    label: string;
    value: string;
}

function StatItem({ icon: Icon, label, value }: StatItemProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800">
                <Icon className="w-4 h-4 text-ocean-400" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm text-white font-medium truncate">{value}</p>
            </div>
        </div>
    );
}
