import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { cn } from '../../utils/cn'
import { fadeInUp, staggerContainer } from '../../utils/animations'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  stagger?: boolean
  delay?: number
}

export function AnimatedSection({ 
  children, 
  className, 
  stagger = false,
  delay = 0 
}: AnimatedSectionProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger ? staggerContainer : fadeInUp}
      transition={{ delay }}
      className={cn(className)}
    >
      {children}
    </motion.section>
  )
}

interface AnimatedItemProps {
  children: React.ReactNode
  className?: string
}

export function AnimatedItem({ children, className }: AnimatedItemProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
