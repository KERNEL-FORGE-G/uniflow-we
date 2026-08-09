import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary:   'bg-[#1e3a8a] text-white hover:bg-[#2d4fa8] shadow-sm hover:shadow-md',
  secondary: 'bg-[#0d9488] text-white hover:bg-[#14b8a8] shadow-sm hover:shadow-md',
  outline:   'border border-[#e5e7eb] bg-white text-[#374151] hover:bg-[#f9fafb] hover:border-[#d1d5db]',
  ghost:     'text-[#1e3a8a] hover:bg-[#eff3ff]',
  danger:    'bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-sm hover:shadow-md',
  success:   'bg-[#10b981] text-white hover:bg-[#059669] shadow-sm hover:shadow-md',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-sm gap-2',
}

interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled,
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:ring-offset-1',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </motion.button>
  )
}
