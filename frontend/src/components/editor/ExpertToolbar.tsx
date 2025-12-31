import { motion } from 'framer-motion';
import {
    MousePointer2,
    Pencil,
    Waves,
    Droplets,
    Mountain,
    Navigation,
    Snowflake,
    Droplet,
    Undo2,
    Redo2,
    Save
} from 'lucide-react';
import type { ObjectType } from '../../types/waterObject';

export type EditorTool = 'pointer' | 'pencil';
export type LayerType = ObjectType;

interface ExpertToolbarProps {
    activeTool: EditorTool;
    onToolChange: (tool: EditorTool) => void;
    visibleLayers: LayerType[];
    onLayerToggle: (layer: LayerType) => void;
    onSave?: () => void;
    canSave?: boolean;
    canUndo?: boolean;
    canRedo?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
}

export function ExpertToolbar({
    activeTool,
    onToolChange,
    visibleLayers,
    onLayerToggle,
    onSave,
    canSave,
    canUndo,
    canRedo,
    onUndo,
    onRedo
}: ExpertToolbarProps) {

    const tools = [
        { id: 'pointer', icon: MousePointer2, label: 'Select' },
        { id: 'pencil', icon: Pencil, label: 'Edit Geometry' },
    ] as const;

    const layers: { id: LayerType; icon: React.ElementType; label: string }[] = [
        { id: 'river', icon: Waves, label: 'Rivers' },
        { id: 'lake', icon: Droplets, label: 'Lakes' },
        { id: 'reservoir', icon: Mountain, label: 'Reservoirs' },
        { id: 'canal', icon: Navigation, label: 'Canals' },
        { id: 'glacier', icon: Snowflake, label: 'Glaciers' },
        { id: 'spring', icon: Droplet, label: 'Springs' },
    ];

    const isLayerVisible = (id: LayerType) => visibleLayers.includes(id);

    return (
        <motion.div
            className="absolute top-4 left-4 z-[1000] flex flex-col gap-2"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
        >
            <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-1.5 rounded-2xl shadow-xl flex flex-col gap-1">
                {/* Tools Section */}
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => onToolChange(tool.id as EditorTool)}
                        className={`
                            relative group p-3 rounded-xl transition-all duration-200 flex items-center justify-center
                            ${activeTool === tool.id
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}
                        `}
                        title={tool.label}
                    >
                        <tool.icon className="w-5 h-5" />
                        <span className="absolute left-full ml-3 px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-200 dark:border-slate-700 z-50 shadow-lg">
                            {tool.label}
                        </span>
                    </button>
                ))}

                <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />

                {/* Layers Section */}
                {layers.map((layer) => (
                    <button
                        key={layer.id}
                        onClick={() => onLayerToggle(layer.id)}
                        className={`
                            relative group p-3 rounded-xl transition-all duration-200 flex items-center justify-center
                            ${isLayerVisible(layer.id)
                                ? 'bg-slate-100 dark:bg-slate-800 text-primary-500 ring-1 ring-primary-500/50'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                        `}
                        title={layer.label}
                    >
                        <layer.icon className="w-5 h-5" />
                        <span className="absolute left-full ml-3 px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-200 dark:border-slate-700 z-50 shadow-lg">
                            {layer.label}
                        </span>
                    </button>
                ))}

                <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />

                <div className="flex flex-col gap-1">
                    {/* Save Button */}
                    <button
                        onClick={onSave}
                        disabled={!canSave}
                        className={`p-3 rounded-xl transition-colors ${canSave
                                ? 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 bg-emerald-500/5'
                                : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            } disabled:opacity-30 disabled:cursor-not-allowed`}
                        title="Save Changes"
                    >
                        <Save className="w-5 h-5" />
                    </button>

                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-1" />

                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Undo"
                    >
                        <Undo2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onRedo}
                        disabled={!canRedo}
                        className="p-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Redo"
                    >
                        <Redo2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
