"use client"

import type React from "react"

import { useState } from "react"

interface SearchControlsProps {
  onSearch: (city: string) => void
  onUseLocation: () => void
}

export function SearchControls({ onSearch, onUseLocation }: SearchControlsProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim())
      setSearchQuery("")
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
      <form
        onSubmit={handleSubmit}
        className="flex bg-white/90 backdrop-blur-md rounded-full shadow-lg overflow-hidden"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for any city..."
          className="px-6 py-4 text-gray-800 bg-transparent outline-none min-w-[300px] md:min-w-[400px]"
        />
        <button
          type="submit"
          className="px-6 py-4 bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
        >
          🔍
        </button>
      </form>

      <button
        onClick={onUseLocation}
        className="px-6 py-4 bg-white/20 backdrop-blur-md text-white border-2 border-white/30 rounded-full hover:bg-white/30 hover:border-white/50 transition-all duration-200"
      >
        📍 Use My Location
      </button>
    </div>
  )
}
