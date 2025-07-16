"use client"

import { useState, useEffect, useCallback } from "react"
import { WeatherCard } from "@/components/weather-card"
import { SearchControls } from "@/components/search-controls"
import { QuickCityButtons } from "@/components/quick-city-buttons"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"

const API_KEY = "69c2bbcf90f04fa6ab9162334251407"
const API_BASE_URL = "https://api.weatherapi.com/v1/current.json"

const DEFAULT_CITIES = ["New York", "London", "Tokyo", "Sydney", "Dubai", "Mumbai"]

interface WeatherData {
  location: {
    name: string
    region: string
    country: string
    localtime: string
    tz_id: string
  }
  current: {
    temp_c: number
    temp_f: number
    condition: {
      text: string
      icon: string
      code: number
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

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [featuredCity, setFeaturedCity] = useState<string>("New York")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [backgroundClass, setBackgroundClass] = useState("sunny-bg")

  const getWeatherConditionClass = (condition: string, isDay: boolean) => {
    const conditionLower = condition.toLowerCase()

    if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
      return isDay ? "sunny-bg" : "clear-night-bg"
    } else if (conditionLower.includes("rain") || conditionLower.includes("drizzle")) {
      return "rainy-bg"
    } else if (conditionLower.includes("cloud") || conditionLower.includes("overcast")) {
      return "cloudy-bg"
    } else if (conditionLower.includes("snow") || conditionLower.includes("blizzard")) {
      return "snowy-bg"
    }

    return "sunny-bg"
  }

  const fetchWeatherData = useCallback(
    async (cities: string[]) => {
      try {
        setLoading(true)
        setError(null)

        const promises = cities.map(async (city) => {
          try {
            const response = await fetch(`${API_BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`)
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              throw new Error(errorData.error?.message || `Failed to fetch weather for ${city}`)
            }
            return response.json()
          } catch (error) {
            console.error(`Error fetching weather for ${city}:`, error)
            throw error
          }
        })

        const results = await Promise.all(promises)
        setWeatherData(results)

        // Update background based on featured city - use current featuredCity state
        const featured = results.find(
          (data) =>
            data.location.name.toLowerCase().includes(featuredCity.toLowerCase()) ||
            featuredCity.toLowerCase().includes(data.location.name.toLowerCase()),
        )

        if (featured) {
          const isDay = featured.current.condition.icon.includes("day")
          const bgClass = getWeatherConditionClass(featured.current.condition.text, isDay)
          setBackgroundClass(bgClass)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      } finally {
        setLoading(false)
      }
    },
    [], // Remove featuredCity dependency to prevent infinite loops
  )

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lon: longitude })

        try {
          const response = await fetch(`${API_BASE_URL}?key=${API_KEY}&q=${latitude},${longitude}&aqi=no`)
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error?.message || "Failed to fetch location weather")
          }

          const locationWeather = await response.json()
          const cityName = locationWeather.location.name
          setFeaturedCity(cityName)

          // Add user's city to the list if not already present
          const citiesWithUser = [...DEFAULT_CITIES]
          if (!citiesWithUser.some((city) => city.toLowerCase() === cityName.toLowerCase())) {
            citiesWithUser[0] = cityName // Replace first city with user's location
          }

          fetchWeatherData(citiesWithUser)
        } catch (err) {
          setError("Failed to fetch weather for your location")
          fetchWeatherData(DEFAULT_CITIES)
        }
      },
      (error) => {
        setError("Unable to retrieve your location")
        fetchWeatherData(DEFAULT_CITIES)
      },
    )
  }, [fetchWeatherData])

  const handleCitySelect = useCallback(
    (city: string) => {
      setFeaturedCity(city)

      // Update background immediately
      const cityData = weatherData.find(
        (data) =>
          data.location.name.toLowerCase().includes(city.toLowerCase()) ||
          city.toLowerCase().includes(data.location.name.toLowerCase()),
      )

      if (cityData) {
        const isDay = cityData.current.condition.icon.includes("day")
        const bgClass = getWeatherConditionClass(cityData.current.condition.text, isDay)
        setBackgroundClass(bgClass)
      }
    },
    [weatherData],
  )

  const handleSearch = useCallback(async (searchCity: string) => {
    if (!searchCity.trim()) return

    try {
      setLoading(true)
      setError(null)
      
      console.log(`🔍 Searching for city: "${searchCity}"`)
      
      const response = await fetch(`${API_BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(searchCity)}&aqi=no`)
      
      console.log(`📡 API Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error?.message || "City not found")
      }

      const newCityData = await response.json()
      const cityName = newCityData.location.name

      console.log(`✅ Found city: "${cityName}"`)
      console.log('📊 City data:', newCityData)

      // Always update weather data - remove duplicates if they exist
      setWeatherData((prev) => {
        console.log('🔧 setWeatherData called, prev.length:', prev.length)
        console.log('🔧 Previous cities:', prev.map(d => d.location.name))
        
        // Remove any existing city with the same name
        const filteredData = prev.filter((data) => {
          const existingCity = data.location.name.toLowerCase().trim()
          const newCity = cityName.toLowerCase().trim()
          return existingCity !== newCity
        })
        
        console.log('🔧 After filtering, filteredData.length:', filteredData.length)
        
        // Add the new city data to the beginning
        const newData = [newCityData, ...filteredData]
        console.log('📈 Final weather data cities:', newData.map(d => d.location.name))
        console.log('📈 Final weather data length:', newData.length)
        return newData
      })

      setFeaturedCity(cityName)
      console.log(`⭐ Set featured city to: "${cityName}"`)

      // Update background
      const isDay = newCityData.current.condition.icon.includes("day")
      const bgClass = getWeatherConditionClass(newCityData.current.condition.text, isDay)
      setBackgroundClass(bgClass)
      console.log(`🎨 Updated background class to: ${bgClass}`)
    } catch (err) {
      console.error('💥 Search error:', err)
      setError(err instanceof Error ? err.message : "City not found. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  const formatLocalTime = (localtime: string) => {
    const date = new Date(localtime)
    return (
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }) + " Local Time"
    )
  }

  // Initial load - only run once
  useEffect(() => {
    console.log('🚀 Initial load effect triggered')
    fetchWeatherData(DEFAULT_CITIES)
  }, []) // Remove fetchWeatherData dependency to prevent re-runs

  // Auto-refresh every 10 minutes - TEMPORARILY DISABLED FOR DEBUGGING
  useEffect(() => {
    console.log('🔄 Auto-refresh effect triggered, weatherData.length:', weatherData.length)
    
    // Temporarily disable auto-refresh to debug the search issue
    // const interval = setInterval(
    //   () => {
    //     const currentCities = weatherData.map((data) => data.location.name)
    //     if (currentCities.length > 0) {
    //       console.log('🔄 Auto-refreshing weather data for cities:', currentCities)
    //       fetchWeatherData(currentCities)
    //     }
    //   },
    //   10 * 60 * 1000,
    // ) // 10 minutes

    // return () => clearInterval(interval)
  }, [fetchWeatherData])

  if (loading && weatherData.length === 0) {
    return (
      <div className={`min-h-screen transition-all duration-700 ${backgroundClass}`}>
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-700 ${backgroundClass}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-10 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">🌤️ Global Weather Dashboard</h1>
          <p className="text-xl text-white/80 font-light">Real-time weather updates for cities worldwide</p>
        </header>

        {/* Controls */}
        <SearchControls onSearch={handleSearch} onUseLocation={getUserLocation} isLoading={loading} />

        {/* Debug info - remove this later */}
        <div className="bg-black/20 text-white p-4 rounded-lg mb-4 text-sm">
          <p><strong>Featured City:</strong> "{featuredCity}"</p>
          <p><strong>Weather Data Count:</strong> {weatherData.length}</p>
          <p><strong>Cities:</strong> {weatherData.map(d => d.location.name).join(", ")}</p>
        </div>

        {/* Quick City Buttons */}
        <QuickCityButtons cities={DEFAULT_CITIES} featuredCity={featuredCity} onCitySelect={handleCitySelect} />

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={() => fetchWeatherData(DEFAULT_CITIES)} />}

        {/* Weather Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {weatherData
            .sort((a, b) => {
              // Sort so that the featured city appears first
              const aFeatured = a.location.name.toLowerCase() === featuredCity.toLowerCase()
              const bFeatured = b.location.name.toLowerCase() === featuredCity.toLowerCase()
              
              if (aFeatured && !bFeatured) return -1
              if (!aFeatured && bFeatured) return 1
              return 0 // Keep original order for non-featured cities
            })
            .map((data) => {
              const cityName = data.location.name.toLowerCase()
              const featured = featuredCity.toLowerCase()
              const isFeatured = cityName === featured || 
                                cityName.includes(featured) || 
                                featured.includes(cityName)
              
              // Debug logging for featured city matching
              if (cityName === featured) {
                console.log(`🎯 Exact match found: "${data.location.name}" === "${featuredCity}"`)
              }

              return (
                <WeatherCard
                  key={data.location.name}
                  data={data}
                  isFeatured={isFeatured}
                  localTime={formatLocalTime(data.location.localtime)}
                  onClick={() => handleCitySelect(data.location.name)}
                />
              )
            })}
        </div>
      </div>
    </div>
  )
}
