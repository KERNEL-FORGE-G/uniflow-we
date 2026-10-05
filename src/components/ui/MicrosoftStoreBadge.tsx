import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import {
  MICROSOFT_STORE_INSTALLER_URL,
  MICROSOFT_STORE_BADGE_IMAGE_DARK,
} from '../../lib/contactInfo'

export function MicrosoftStoreBadge({
  className,
  width = 200,
}: {
  className?: string
  width?: number | string
}) {
  return (
    <motion.a
      href={MICROSOFT_STORE_INSTALLER_URL}
      target="_self"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center transition-all focus:outline-none focus:ring-2 focus:ring-[#0078d4] focus:ring-offset-2 rounded-xl group',
        className
      )}
      aria-label="Télécharger UniFlow dans le Microsoft Store"
    >
      <img
        src={MICROSOFT_STORE_BADGE_IMAGE_DARK}
        alt="Télécharger dans le Microsoft Store"
        width={width}
        className="h-auto object-contain rounded-lg shadow-sm transition-shadow group-hover:shadow-md"
        loading="lazy"
      />
    </motion.a>
  )
}
