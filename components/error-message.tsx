"use client"

interface ErrorMessageProps {
  message: string
  onRetry: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="text-center text-white py-8 mb-8 bg-red-500/20 backdrop-blur-md rounded-2xl border border-red-500/30">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-lg mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  )
}
