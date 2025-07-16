"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface SearchControlsProps {
  onSearch: (city: string) => void
  onUseLocation: () => void
  isLoading?: boolean
}

// Popular cities for autocomplete suggestions
const POPULAR_CITIES = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington",
  "Boston", "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis", "Louisville", "Baltimore",
  "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Mesa", "Sacramento", "Atlanta", "Kansas City", "Colorado Springs", "Miami",
  "Raleigh", "Omaha", "Long Beach", "Virginia Beach", "Oakland", "Minneapolis", "Tulsa", "Arlington", "Tampa", "New Orleans",
  "London", "Paris", "Berlin", "Madrid", "Rome", "Amsterdam", "Vienna", "Prague", "Budapest", "Warsaw", "Stockholm", "Oslo",
  "Copenhagen", "Helsinki", "Dublin", "Edinburgh", "Brussels", "Zurich", "Geneva", "Munich", "Frankfurt", "Hamburg",
  "Barcelona", "Valencia", "Seville", "Lisbon", "Porto", "Athens", "Istanbul", "Moscow", "Saint Petersburg", "Kiev",
  "Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Kobe", "Fukuoka", "Sapporo", "Sendai", "Hiroshima",
  "Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Wuhan", "Xi'an", "Suzhou", "Tianjin",
  "Hong Kong", "Taipei", "Kaohsiung", "Taichung", "Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju",
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri", "Patna", "Vadodara",
  "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Doha", "Kuwait City", "Riyadh",
  "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Buraidah", "Khamis Mushait", "Hofuf", "Taif",
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle", "Canberra", "Sunshine Coast", "Wollongong",
  "Auckland", "Wellington", "Christchurch", "Hamilton", "Napier", "Hastings", "Dunedin", "Palmerston North", "Nelson", "Rotorua",
  "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener",
  "London", "Victoria", "Halifax", "Windsor", "Saskatoon", "Regina", "Sherbrooke", "Kelowna", "Barrie", "Guelph",
  "Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Zapopan", "Nezahualcóyotl", "Chihuahua",
  "São Paulo", "Rio de Janeiro", "Salvador", "Brasília", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Goiânia",
  "Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Tucumán", "La Plata", "Mar del Plata", "Quilmes", "Salta", "Santa Fe",
  "Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos", "Cusco", "Chimbote", "Huancayo", "Tacna",
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Soledad", "Ibagué", "Bucaramanga", "Soacha",
  "Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Rancagua", "Talca", "Arica", "Chillán",
  "Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana", "Maturín", "Barcelona", "Turmero", "Ciudad Bolívar",
  "Quito", "Guayaquil", "Cuenca", "Santo Domingo", "Machala", "Durán", "Manta", "Portoviejo", "Ambato", "Riobamba",
  "Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Port Said", "Suez", "Luxor", "Aswan", "Asyut", "Ismailia",
  "Casablanca", "Rabat", "Fez", "Marrakech", "Agadir", "Tangier", "Meknes", "Oujda", "Kenitra", "Tetouan",
  "Lagos", "Kano", "Ibadan", "Kaduna", "Port Harcourt", "Benin City", "Maiduguri", "Zaria", "Aba", "Jos",
  "Johannesburg", "Cape Town", "Durban", "Pretoria", "Soweto", "Benoni", "Tembisa", "East London", "Vereeniging", "Bloemfontein",
  "Nairobi", "Mombasa", "Nakuru", "Eldoret", "Kisumu", "Thika", "Malindi", "Kitale", "Garissa", "Kakamega"
]

export function SearchControls({ onSearch, onUseLocation, isLoading = false }: SearchControlsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [filteredCities, setFilteredCities] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Ensure we're on the client side before showing the popover
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase()
      
      // Sort cities: those starting with the query first, then those containing it
      const filtered = POPULAR_CITIES.filter(city =>
        city.toLowerCase().includes(query)
      ).sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(query)
        const bStarts = b.toLowerCase().startsWith(query)
        
        // If one starts with query and other doesn't, prioritize the one that starts
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        
        // If both start or both don't start, sort alphabetically
        return a.localeCompare(b)
      }).slice(0, 10) // Limit to 10 suggestions
      
      setFilteredCities(filtered)
      setSelectedIndex(-1) // Reset selection when cities change
      if (isClient) {
        setOpen(filtered.length > 0)
      }
    } else {
      setFilteredCities([])
      setSelectedIndex(-1)
      setOpen(false)
    }
  }, [searchQuery, isClient])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedIndex >= 0 && selectedIndex < filteredCities.length) {
      // If a city is selected via keyboard, use it
      handleSelectCity(filteredCities[selectedIndex])
    } else if (searchQuery.trim()) {
      // Otherwise use the typed query
      onSearch(searchQuery.trim())
      setSearchQuery("")
      setOpen(false)
    }
  }

  const handleSelectCity = (city: string) => {
    setOpen(false)
    onSearch(city)
    setSearchQuery("")
  }

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filteredCities.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Escape':
        setOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
      <div className="relative">
        <form
          onSubmit={handleSubmit}
          className="flex bg-white/90 backdrop-blur-md rounded-full shadow-lg overflow-hidden"
        >
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (isClient && filteredCities.length > 0) {
                setOpen(true)
              }
            }}
            onBlur={() => {
              // Delay closing to allow clicking on suggestions
              setTimeout(() => setOpen(false), 200)
            }}
            placeholder="Search for any city..."
            className="px-6 py-4 text-gray-800 bg-transparent outline-none min-w-[300px] md:min-w-[400px]"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-4 bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "⏳" : "🔍"}
          </button>
        </form>
        
        {/* Dropdown suggestions */}
        {isClient && open && filteredCities.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-white/20 z-50 max-h-80 overflow-y-auto">
            <div className="py-2">
              {filteredCities.map((city: string, index: number) => (
                <div
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  className={`px-6 py-3 cursor-pointer transition-colors duration-150 flex items-center text-gray-800 ${
                    index === selectedIndex 
                      ? 'bg-blue-100/80 text-blue-700' 
                      : 'hover:bg-blue-50/80 hover:text-blue-600'
                  }`}
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="mr-3 text-blue-500">📍</span>
                  <span className="font-medium">{city}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onUseLocation}
        className="px-6 py-4 bg-white/20 backdrop-blur-md text-white border-2 border-white/30 rounded-full hover:bg-white/30 hover:border-white/50 transition-all duration-200"
      >
        📍 Use My Location
      </button>
    </div>
  )
}
