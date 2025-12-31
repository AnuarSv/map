import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MousePointer2,
    Pentagon,
    Scissors,
    Move,
    Undo2,
    Redo2,
    ChevronLeft,
} from 'lucide-react';

type Tool = 'select' | 'polygon' | 'cut' | 'vertex';

const tools: { id: Tool; icon: React.ElementType; label: string; shortcut: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
    { id: 'polygon', icon: Pentagon, label: 'Draw Polygon', shortcut: 'P' },
    { id: 'cut', icon: Scissors, label: 'Cut', shortcut: 'C' },
    { id: 'vertex', icon: Move, label: 'Edit Vertices', shortcut: 'E' },
];

interface FloatingToolbarProps {
    activeTool: Tool;
    onToolChange: (tool: Tool) => void;
    canUndo?: boolean;
    canRedo?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
}

export function FloatingToolbar({
    activeTool,
    onToolChange,
    canUndo = false,
    canRedo = false,
    onUndo,
    onRedo,
}: FloatingToolbarProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <motion.div
            className="fixed left-4 top-1/2 -translate-y-1/2 z-[1000] hidden md:block"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
            <div className="glass-panel rounded-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            className="p-2 flex flex-col gap-1"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 'auto', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {tools.map((tool) => (
                                <ToolButton
                                    key={tool.id}
                                    icon={tool.icon}
                                    label={tool.label}
                                    shortcut={tool.shortcut}
                                    active={activeTool === tool.id}
                                    onClick={() => onToolChange(tool.id)}
                                />
                            ))}

                            <div className="h-px bg-slate-700 my-1" />

                            <ToolButton
                                icon={Undo2}
                                label="Undo"
                                shortcut="Ctrl+Z"
                                disabled={!canUndo}
                                onClick={onUndo}
                            />
                            <ToolButton
                                icon={Redo2}
                                label="Redo"
                                shortcut="Ctrl+Y"
                                disabled={!canRedo}
                                onClick={onRedo}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-3 w-full hover:bg-white/5 transition-colors flex justify-center"
                    aria-label={collapsed ? 'Expand toolbar' : 'Collapse toolbar'}
                >
                    <motion.div
                        animate={{ rotate: collapsed ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-400" />
                    </motion.div>
                </button>
            </div>
        </motion.div>
    );
}

interface ToolButtonProps {
    icon: React.ElementType;
    label: string;
    shortcut?: string;
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
}

function ToolButton({
    icon: Icon,
    label,
    shortcut,
    active,
    disabled,
    onClick,
}: ToolButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
        relative p-3 rounded-xl transition-colors
        ${active
                    ? 'bg-ocean-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
            whileTap={!disabled ? { scale: 0.92 } : undefined}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
        >
            <Icon className="w-5 h-5" />
        </motion.button>
    );
}
