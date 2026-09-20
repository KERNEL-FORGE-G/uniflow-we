import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Bug } from 'lucide-react'
import { ErrorScreen } from './ActionResult'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Remise à zéro quand cette clé change (ex. le chemin courant). */
  resetKey?: string
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Filet de sécurité global : une exception de rendu affichait auparavant une
 * page blanche sans explication. On montre un écran d'erreur animé avec la
 * cause et deux issues (réessayer, retour à l'accueil).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[UniFlow] Erreur de rendu', error, info.componentStack)
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <ErrorScreen
          icon={Bug}
          title="Quelque chose s’est mal passé"
          description="L’écran n’a pas pu s’afficher. Vos données ne sont pas perdues : réessayez, ou revenez à l’accueil."
          detail={this.state.error.message}
          actions={[
            { label: 'Réessayer', onClick: () => this.setState({ error: null }) },
            { label: 'Retour à l’accueil', to: '/', variant: 'secondary' },
          ]}
        />
      </div>
    )
  }
}
