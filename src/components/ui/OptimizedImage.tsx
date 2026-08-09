import { useState, useEffect, useRef } from 'react'
import { cn } from '../../utils/cn'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  onLoad?: () => void
}

export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  loading = 'lazy',
  onLoad 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )

    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]" 
          style={{ animation: 'shimmer 1.5s infinite' }} 
        />
      )}
      <img
        ref={imgRef}
        src={isInView || loading === 'eager' ? src : undefined}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        className={cn(
          'transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        decoding="async"
      />
    </div>
  )
}
