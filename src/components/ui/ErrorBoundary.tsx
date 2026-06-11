import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
        style={{ backgroundColor: 'oklch(97.5% 0.007 72)' }}
      >
        <div style={{ maxWidth: 480, width: '100%' }}>
          <div
            className="text-xs font-medium uppercase tracking-widest mb-3"
            style={{ color: 'oklch(50% 0.12 20)' }}
          >
            Something went wrong
          </div>
          <div
            className="text-lg font-light mb-4"
            style={{ fontFamily: '"Fraunces", Georgia, serif', color: 'oklch(14% 0.008 72)' }}
          >
            {error.message}
          </div>
          <pre
            className="text-xs overflow-auto rounded-xl p-4 mb-5"
            style={{
              backgroundColor: 'oklch(93% 0.009 72)',
              color: 'oklch(30% 0.008 72)',
              maxHeight: 240,
              fontFamily: '"IBM Plex Mono", monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            className="text-sm px-4 py-2 rounded-full"
            style={{
              backgroundColor: 'oklch(30% 0.11 255)',
              color: 'oklch(97% 0.007 72)',
            }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
}
