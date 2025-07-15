export function LoadingSpinner() {
  return (
    <div className="text-center text-white py-16">
      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-xl">Loading weather data...</p>
    </div>
  )
}
