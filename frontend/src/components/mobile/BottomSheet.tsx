import { motion, useDragControls } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useState, useRef } from 'react';
import type { ReactNode } from 'react';

interface BottomSheetProps {
    children: ReactNode;
    header?: ReactNode;
    minHeight?: number;
    maxHeight?: number;
    defaultOpen?: boolean;
}

export function BottomSheet({
    children,
    header,
    minHeight = 80,
    maxHeight = 400,
    defaultOpen = false,
}: BottomSheetProps) {
    const [height, setHeight] = useState(defaultOpen ? maxHeight : minHeight);
    const [isDragging, setIsDragging] = useState(false);
    const controls = useDragControls();
    const containerRef = useRef<HTMLDivElement>(null);

    const isExpanded = height > minHeight + 50;

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const newHeight = height - info.delta.y;
        setHeight(Math.min(Math.max(newHeight, minHeight), maxHeight));
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        // Snap to min or max
        const midpoint = (minHeight + maxHeight) / 2;
        if (height < midpoint) {
            setHeight(minHeight);
        } else {
            setHeight(maxHeight);
        }
    };

    const toggleSheet = () => {
        setHeight(isExpanded ? minHeight : maxHeight);
    };

    return (
        <motion.div
            ref={containerRef}
            className="fixed bottom-0 left-0 right-0 z-[1000] glass-panel rounded-t-3xl md:hidden"
            animate={{ height }}
            transition={isDragging ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 300 }}
        >
            {/* Drag Handle */}
            <motion.div
                className="flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
                drag="y"
                dragControls={controls}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onTap={toggleSheet}
            >
                <div className="w-12 h-1 rounded-full bg-slate-600" />
            </motion.div>

            {/* Header (always visible) */}
            {header && (
                <div className="px-4 pb-2 border-b border-slate-700/50">
                    {header}
                </div>
            )}

            {/* Content (scrollable when expanded) */}
            <motion.div
                className="px-4 pb-4 overflow-y-auto"
                style={{ maxHeight: height - (header ? 100 : 60) }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}
