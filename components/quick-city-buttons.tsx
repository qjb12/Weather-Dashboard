"use client"

interface QuickCityButtonsProps {
  cities: string[]
  featuredCity: string
  onCitySelect: (city: string) => void
}

export function QuickCityButtons({ cities, featuredCity, onCitySelect }: QuickCityButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {cities.map((city) => (
        <button
          key={city}
          onClick={() => onCitySelect(city)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            ${
              featuredCity.toLowerCase().includes(city.toLowerCase()) ||
              city.toLowerCase().includes(featuredCity.toLowerCase())
                ? "bg-white/90 text-blue-600 border-2 border-white/90"
                : "bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 hover:border-white/50"
            }
          `}
        >
          {city}
        </button>
      ))}
    </div>
  )
}
