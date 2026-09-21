import { cn } from '@/lib/utils';
import { CircleNotch } from '@phosphor-icons/react';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <CircleNotch
      role="status"
      aria-label="Chargement"
      weight="bold"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
