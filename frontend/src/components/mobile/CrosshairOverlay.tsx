import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

interface CrosshairOverlayProps {
    visible: boolean;
    onPlacePoint: () => void;
}

export function CrosshairOverlay({ visible, onPlacePoint }: CrosshairOverlayProps) {
    return (
        <AnimatePresence>
            {visible && (
                <>
                    {/* Center crosshair */}
                    <motion.div
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[900] pointer-events-none"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        {/* Crosshair SVG */}
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            {/* Outer ring */}
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="white"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                                opacity="0.5"
                            />
                            {/* Inner circle */}
                            <circle
                                cx="24"
                                cy="24"
                                r="4"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                            />
                            {/* Crosshair lines */}
                            <line x1="24" y1="4" x2="24" y2="16" stroke="white" strokeWidth="2" />
                            <line x1="24" y1="32" x2="24" y2="44" stroke="white" strokeWidth="2" />
                            <line x1="4" y1="24" x2="16" y2="24" stroke="white" strokeWidth="2" />
                            <line x1="32" y1="24" x2="44" y2="24" stroke="white" strokeWidth="2" />
                            {/* Center dot */}
                            <circle cx="24" cy="24" r="2" fill="#3b82f6" />
                        </svg>
                    </motion.div>

                    {/* Instruction hint */}
                    <motion.div
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[900] glass-panel rounded-full px-4 py-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <p className="text-sm text-slate-300">Pan map to position crosshair</p>
                    </motion.div>

                    {/* Place point FAB */}
                    <motion.button
                        onClick={onPlacePoint}
                        className="fixed bottom-32 right-4 z-[1000] w-14 h-14 rounded-full bg-ocean-600 text-white shadow-lg flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                    >
                        <Plus className="w-6 h-6" />
                    </motion.button>
                </>
            )}
        </AnimatePresence>
    );
}
