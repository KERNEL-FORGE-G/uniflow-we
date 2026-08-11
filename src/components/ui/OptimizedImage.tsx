import { useState, useEffect, useRef } from 'react'
import { cn } from '../../utils/cn'
import { ImageOff } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  fallbackSrc?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({ 
  src, 
  alt, 
  className, 
  loading = 'lazy',
  fallbackSrc = '/logos/logo-principal.png',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isInView, setIsInView] = useState(loading === 'eager')
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setCurrentSrc(src)
    setHasError(false)
  }, [src])

  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true)
      return
    }

    if (!imgRef.current) return

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

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
  }, [loading])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    } else {
      setHasError(true)
      setIsLoaded(true)
    }
    onError?.()
  }

  return (
    <div className={cn('relative overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800', className)}>
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]" 
          style={{ animation: 'shimmer 1.5s infinite' }} 
        />
      )}

      {hasError ? (
        <div className="flex flex-col items-center justify-center p-3 text-slate-400 dark:text-slate-500 text-xs text-center">
          <ImageOff className="h-6 w-6 mb-1 opacity-60" />
          <span className="font-medium truncate max-w-full">{alt || 'Image non disponible'}</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={isInView ? currentSrc : undefined}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300 w-full h-full object-cover',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          decoding="async"
        />
      )}
    </div>
  )
}

