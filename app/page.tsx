"use client"

import { useState, useEffect } from "react"
import { StatCards } from "@/components/stat-cards"
import { DashboardCalendar } from "@/components/dashboard-calendar"
import { TodaysEvents } from "@/components/todays-events"
import { Randevu, Psikolog } from "@/lib/csv-parser"

// Psikolog isimlerini eşleştirmek için mapping - artık gerekli değil çünkü aynı isimler kullanılıyor
const psikologMapping: Record<string, string> = {
  // Eğer eski format varsa buraya ekleyin
  // 'Eski Format': 'Yeni Format',
}

export default function Dashboard() {
  const [selectedPsikolog, setSelectedPsikolog] = useState<string>("tumu")
  const [randevular, setRandevular] = useState<Randevu[]>([])
  const [psikologlar, setPsikologlar] = useState<Psikolog[]>([])
  const [loading, setLoading] = useState(true)

  // Load data once at the top level
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log('Loading data from main page...')
        
        // Load appointments
        const randevularResponse = await fetch('/api/csv-data?type=randevular')
        const randevularResult = await randevularResponse.json()
        console.log('Loaded randevular from main page:', randevularResult.data)
        setRandevular(randevularResult.data)

        // Load psychologists
        const psikologlarResponse = await fetch('/api/csv-data?type=psikologlar')
        const psikologlarResult = await psikologlarResponse.json()
        console.log('Loaded psikologlar from main page:', psikologlarResult.data)
        setPsikologlar(psikologlarResult.data)
      } catch (error) {
        console.error('Data loading error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <main className="w-[85%] mx-auto px-4 py-3 space-y-3">
        <div>Yükleniyor...</div>
      </main>
    )
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-3 space-y-3">
      {/* Stats Cards */}
      <StatCards />

      {/* Dashboard Grid */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Calendar - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <DashboardCalendar 
            selectedPsikolog={selectedPsikolog} 
            randevular={randevular}
            psikologMapping={psikologMapping}
          />
        </div>

        {/* Today's Events - Takes 1 column */}
        <div>
          <TodaysEvents 
            selectedPsikolog={selectedPsikolog} 
            onPsikologChange={setSelectedPsikolog}
            randevular={randevular}
            psikologlar={psikologlar}
            psikologMapping={psikologMapping}
          />
        </div>
      </div>
    </main>
  )
}
