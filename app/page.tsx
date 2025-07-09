"use client"

import { StatCards } from "@/components/stat-cards"
import { DashboardCalendar } from "@/components/dashboard-calendar"
import { TodaysEvents } from "@/components/todays-events"

export default function Dashboard() {
  return (
    <main className="w-[85%] mx-auto px-4 py-3 space-y-3">
      {/* Stats Cards */}
      <StatCards />

      {/* Dashboard Grid */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Calendar - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <DashboardCalendar />
        </div>

        {/* Today's Events - Takes 1 column */}
        <div>
          <TodaysEvents />
        </div>
      </div>
    </main>
  )
}
