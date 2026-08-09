import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../utils/cn'
import { cardHover } from '../../utils/animations'

interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean
  children: React.ReactNode
}

export function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <motion.div
      initial="rest"
      whileHover={hover ? "hover" : undefined}
      variants={hover ? cardHover : undefined}
      className={cn(
        'rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-sm transition-shadow duration-300',
        hover && 'cursor-pointer hover:shadow-lg hover:border-[#d1d5db]',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
