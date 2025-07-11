"use client"

import { useState } from "react"
import { StatCards } from "@/components/stat-cards"
import { DashboardCalendar } from "@/components/dashboard-calendar"
import { TodaysEvents } from "@/components/todays-events"

export default function Dashboard() {
  const [selectedPsikolog, setSelectedPsikolog] = useState<string>("tumu")

  return (
    <main className="w-[85%] mx-auto px-4 py-3 space-y-3">
      {/* Stats Cards */}
      <StatCards />

      {/* Dashboard Grid */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Calendar - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <DashboardCalendar selectedPsikolog={selectedPsikolog} />
        </div>

        {/* Today's Events - Takes 1 column */}
        <div>
          <TodaysEvents 
            selectedPsikolog={selectedPsikolog} 
            onPsikologChange={setSelectedPsikolog} 
          />
        </div>
      </div>
    </main>
  )
}
