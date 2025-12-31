import { motion } from 'framer-motion';
import {
    MousePointer2,
    Pentagon,
    Scissors,
    Move,
    Undo2,
    Redo2,
    Crosshair,
    Check,
} from 'lucide-react';

type Tool = 'select' | 'polygon' | 'cut' | 'vertex';

const tools: { id: Tool; icon: React.ElementType }[] = [
    { id: 'select', icon: MousePointer2 },
    { id: 'polygon', icon: Pentagon },
    { id: 'cut', icon: Scissors },
    { id: 'vertex', icon: Move },
];

interface MobileToolbarProps {
    activeTool: Tool;
    onToolChange: (tool: Tool) => void;
    crosshairMode: boolean;
    onCrosshairToggle: () => void;
    onPlacePoint?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
}

export function MobileToolbar({
    activeTool,
    onToolChange,
    crosshairMode,
    onCrosshairToggle,
    onPlacePoint,
    canUndo = false,
    canRedo = false,
    onUndo,
    onRedo,
}: MobileToolbarProps) {
    return (
        <div className="flex items-center justify-between gap-2">
            {/* Main tools */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
                {tools.map((tool) => (
                    <MobileToolButton
                        key={tool.id}
                        icon={tool.icon}
                        active={activeTool === tool.id}
                        onClick={() => onToolChange(tool.id)}
                    />
                ))}
            </div>

            {/* Crosshair mode toggle */}
            {(activeTool === 'polygon' || activeTool === 'vertex') && (
                <motion.button
                    onClick={onCrosshairToggle}
                    className={`
            p-3 rounded-xl transition-colors
            ${crosshairMode
                            ? 'bg-ocean-600 text-white'
                            : 'bg-slate-800/50 text-slate-400'}
          `}
                    whileTap={{ scale: 0.95 }}
                >
                    <Crosshair className="w-5 h-5" />
                </motion.button>
            )}

            {/* Place point button (only in crosshair mode) */}
            {crosshairMode && (
                <motion.button
                    onClick={onPlacePoint}
                    className="p-3 rounded-xl bg-success text-white"
                    whileTap={{ scale: 0.95 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                    <Check className="w-5 h-5" />
                </motion.button>
            )}

            {/* Undo/Redo */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
                <MobileToolButton
                    icon={Undo2}
                    disabled={!canUndo}
                    onClick={onUndo}
                />
                <MobileToolButton
                    icon={Redo2}
                    disabled={!canRedo}
                    onClick={onRedo}
                />
            </div>
        </div>
    );
}

interface MobileToolButtonProps {
    icon: React.ElementType;
    active?: boolean;
    disabled?: boolean;
    onClick?: () => void;
}

function MobileToolButton({
    icon: Icon,
    active,
    disabled,
    onClick,
}: MobileToolButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
        p-3 rounded-xl transition-colors
        ${active
                    ? 'bg-ocean-600 text-white'
                    : 'text-slate-400 hover:text-white'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
      `}
            whileTap={!disabled ? { scale: 0.92 } : undefined}
        >
            <Icon className="w-5 h-5" />
        </motion.button>
    );
}
