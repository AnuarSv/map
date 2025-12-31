import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

// Primary button with spring animation
interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    loading?: boolean;
    className?: string;
}

const variantStyles = {
    primary: 'bg-ocean-600 hover:bg-ocean-500 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-300',
    danger: 'bg-error/20 hover:bg-error/30 text-error border border-error/30',
};

const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
};

export function Button({
    children,
    onClick,
    disabled,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    fullWidth,
    loading,
    className = '',
}: ButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center font-medium rounded-xl transition-colors
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
            {loading ? (
                <Spinner size={size === 'sm' ? 14 : 18} />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />}
                </>
            )}
        </motion.button>
    );
}

// Icon-only button
interface IconButtonProps {
    icon: LucideIcon;
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'primary' | 'ghost';
    label: string;
    className?: string;
}

export function IconButton({
    icon: Icon,
    onClick,
    disabled,
    active,
    size = 'md',
    variant = 'default',
    label,
    className = '',
}: IconButtonProps) {
    const sizeClasses = {
        sm: 'p-2',
        md: 'p-2.5',
        lg: 'p-3',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const variantClasses = {
        default: active
            ? 'bg-ocean-600 text-white'
            : 'text-slate-400 hover:text-white hover:bg-white/5',
        primary: 'bg-ocean-600 hover:bg-ocean-500 text-white',
        ghost: 'text-slate-400 hover:text-white hover:bg-white/10',
    };

    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={`
        rounded-xl transition-colors
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
        ${className}
      `}
            whileTap={!disabled ? { scale: 0.92 } : undefined}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
            <Icon className={iconSizes[size]} />
        </motion.button>
    );
}

// Loading spinner
function Spinner({ size = 18 }: { size?: number }) {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.25"
            />
            <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </motion.svg>
    );
}

// Toast notification
interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    visible: boolean;
    onClose?: () => void;
}

export function Toast({ message, type = 'info', visible, onClose }: ToastProps) {
    const bgColors = {
        success: 'bg-success/20 border-success/30',
        error: 'bg-error/20 border-error/30',
        info: 'bg-ocean-600/20 border-ocean-500/30',
    };

    const textColors = {
        success: 'text-success',
        error: 'text-error',
        info: 'text-ocean-400',
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className={`
            fixed bottom-24 left-1/2 -translate-x-1/2 z-[2000]
            px-4 py-3 rounded-xl border backdrop-blur-sm
            ${bgColors[type]}
          `}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20 }}
                    onClick={onClose}
                >
                    <p className={`text-sm font-medium ${textColors[type]}`}>{message}</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
