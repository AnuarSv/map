import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: -20,
    },
};

const pageTransition = {
    type: 'tween' as const,
    ease: 'easeInOut' as const,
    duration: 0.3,
};

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Fade only variant for overlays
export function FadeTransition({ children, className = '' }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Slide from right for panels
export function SlideTransition({ children, className = '' }: PageTransitionProps) {
    return (
        <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
