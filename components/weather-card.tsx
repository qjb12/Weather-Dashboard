"use client"

interface WeatherCardProps {
  data: {
    location: {
      name: string
      region: string
      country: string
    }
    current: {
      temp_c: number
      temp_f: number
      condition: {
        text: string
        icon: string
      }
      wind_mph: number
      wind_kph: number
      wind_dir: string
      pressure_mb: number
      pressure_in: number
      humidity: number
      feelslike_c: number
      feelslike_f: number
      vis_km: number
      vis_miles: number
    }
  }
  isFeatured: boolean
  localTime: string
  onClick: () => void
}

export function WeatherCard({ data, isFeatured, localTime, onClick }: WeatherCardProps) {
  const { location, current } = data

  return (
    <div
      className={`
        bg-white/90 backdrop-blur-md rounded-3xl shadow-xl transition-all duration-300 cursor-pointer
        hover:transform hover:-translate-y-2 hover:shadow-2xl
        ${isFeatured ? "md:col-span-2 lg:col-span-2 p-10 border-4 border-white/50 animate-pulse bg-white/95" : "p-6"}
      `}
      onClick={onClick}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className={`font-bold text-gray-800 ${isFeatured ? "text-3xl mb-2" : "text-xl mb-1"}`}>
            {location.name}
          </h3>
          <p className={`text-gray-600 ${isFeatured ? "text-lg" : "text-sm"}`}>
            {location.region && `${location.region}, `}
            {location.country}
          </p>
        </div>
        <div className={`text-gray-500 ${isFeatured ? "text-base" : "text-sm"}`}>{localTime}</div>
      </div>

      {/* Main Weather Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img
            src={current.condition.icon || "/placeholder.svg"}
            alt={current.condition.text}
            className={`filter drop-shadow-lg ${isFeatured ? "w-32 h-32" : "w-20 h-20"}`}
          />
          <div>
            <div className={`font-bold text-gray-800 ${isFeatured ? "text-6xl" : "text-4xl"}`}>
              {Math.round(current.temp_f)}°F
            </div>
            <div className={`text-gray-600 ${isFeatured ? "text-lg" : "text-sm"}`}>{Math.round(current.temp_c)}°C</div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-gray-700 font-medium ${isFeatured ? "text-xl mb-2" : "text-base mb-1"}`}>
            {current.condition.text}
          </div>
          <div className={`text-gray-500 ${isFeatured ? "text-base" : "text-sm"}`}>
            Feels like {Math.round(current.feelslike_f)}°F
          </div>
        </div>
      </div>

      {/* Weather Details */}
      <div className={`grid gap-3 ${isFeatured ? "grid-cols-2" : "grid-cols-1"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">💧</span>
            <span className="text-gray-600 text-sm">Humidity</span>
          </div>
          <span className="font-medium text-gray-800">{current.humidity}%</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">💨</span>
            <span className="text-gray-600 text-sm">Wind</span>
          </div>
          <span className="font-medium text-gray-800">
            {Math.round(current.wind_mph)} mph {current.wind_dir}
          </span>
        </div>

        {isFeatured && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">👁️</span>
                <span className="text-gray-600 text-sm">Visibility</span>
              </div>
              <span className="font-medium text-gray-800">{current.vis_miles} mi</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">🌡️</span>
                <span className="text-gray-600 text-sm">Pressure</span>
              </div>
              <span className="font-medium text-gray-800">{current.pressure_in.toFixed(2)} in</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
