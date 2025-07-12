"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, User } from "lucide-react"
import { Randevu } from "@/lib/csv-parser"

interface DashboardCalendarProps {
  selectedPsikolog: string
  randevular: Randevu[]
}

// Generate colors for psychologists
const getPsikologColor = (psikologName: string) => {
  const colors = {
    "Psk.Abdullah Yılmaz": {
      bg: "rgb(59 130 246 / 0.1)",
      text: "rgb(59 130 246)",
      border: "rgb(59 130 246 / 0.3)"
    },
    "Psk.Eralp Yılmaz": {
      bg: "rgb(168 85 247 / 0.1)",
      text: "rgb(168 85 247)",
      border: "rgb(168 85 247 / 0.3)"
    }
  }
  return colors[psikologName as keyof typeof colors] || {
    bg: "rgb(107 114 128 / 0.1)",
    text: "rgb(107 114 128)",
    border: "rgb(107 114 128 / 0.3)"
  }
}

// Tarih formatını standardize etmek için yardımcı fonksiyon
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DashboardCalendar({ selectedPsikolog, randevular }: DashboardCalendarProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [selectedDateSessions, setSelectedDateSessions] = React.useState<Randevu[]>([])

  // Filter appointments based on selected psychologist - memoized to prevent infinite loops
  const filteredRandevular = useMemo(() => {
    console.log('Dashboard Calendar - Filtering appointments for:', selectedPsikolog)
    console.log('Dashboard Calendar - Total appointments:', randevular.length)
    const filtered = selectedPsikolog === "tumu" 
      ? randevular 
      : randevular.filter(randevu => randevu.psikolog === selectedPsikolog)
    console.log('Dashboard Calendar - Filtered appointments:', filtered.length)
    return filtered
  }, [selectedPsikolog, randevular])

  // Seçilen tarihteki seansları filtrele - Şimdi psikolog filtresine göre göster
  React.useEffect(() => {
    if (date) {
      const selectedDateStr = formatDateToYYYYMMDD(date)
      console.log('Dashboard Calendar - Selected date (YYYY-MM-DD):', selectedDateStr)
      console.log('Dashboard Calendar - Selected psychologist:', selectedPsikolog)
      
      // Önce tarihe göre filtrele, sonra psikoloğa göre filtrele
      const sessionsForDate = randevular.filter((seans) => seans.tarih === selectedDateStr)
      console.log('Dashboard Calendar - Sessions for date:', sessionsForDate)
      
      const filteredSessions = selectedPsikolog === "tumu" 
        ? sessionsForDate 
        : sessionsForDate.filter(seans => seans.psikolog === selectedPsikolog)
      
      console.log('Dashboard Calendar - Sessions for selected date and psychologist:', filteredSessions)
      setSelectedDateSessions(filteredSessions)
    } else {
      setSelectedDateSessions([])
    }
  }, [date, selectedPsikolog, randevular]) // selectedPsikolog dependency'si eklendi

  // Seans olan tarihleri belirle - memoized to prevent recalculation
  const seansOlanTarihler = useMemo(() => {
    const dates = filteredRandevular.map((seans) => new Date(seans.tarih))
    console.log('Dashboard Calendar - Calendar dates with sessions:', dates)
    return dates
  }, [filteredRandevular])

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case "Onaylandı":
        return "bg-green-100 text-green-800"
      case "Planlandı":
        return "bg-blue-100 text-blue-800"
      case "Beklemede":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get calendar modifier styles based on selected psychologist - memoized
  const modifierStyles = useMemo(() => {
    if (selectedPsikolog === "tumu") {
      return {
        hasSession: {
          backgroundColor: "rgb(59 130 246 / 0.1)",
          color: "rgb(59 130 246)",
          fontWeight: "bold",
        },
      }
    } else {
      const color = getPsikologColor(selectedPsikolog)
      return {
        hasSession: {
          backgroundColor: color.bg,
          color: color.text,
          fontWeight: "bold",
        },
      }
    }
  }, [selectedPsikolog])

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Takvim</CardTitle>
          </div>
          <CardDescription className="text-xs">
            {selectedPsikolog === "tumu" 
              ? "Tüm psikologların randevuları" 
              : `${selectedPsikolog} randevuları`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border w-full max-w-none"
              modifiers={{
                hasSession: seansOlanTarihler,
              }}
              modifiersStyles={modifierStyles}
              classNames={{
                months: "flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0",
                month: "space-y-2 w-full",
                caption: "flex justify-center pt-1 relative items-center text-sm font-semibold",
                caption_label: "text-sm font-semibold",
                nav: "space-x-1 flex items-center",
                nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-accent rounded-md",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-0.5",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md w-full font-normal text-xs p-0.5",
                row: "flex w-full mt-0.5",
                cell: "h-6 w-full text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-6 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors text-xs",
                day_range_end: "day-range-end",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold",
                day_today: "bg-accent text-accent-foreground font-semibold",
                day_outside:
                  "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seçilen Tarihin Seansları */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">{date ? date.toLocaleDateString("tr-TR") : "Tarih Seçin"}</CardTitle>
            </div>
            {selectedDateSessions.length > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs px-1.5 py-0.5">
                {selectedDateSessions.length}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            {selectedDateSessions.length > 0
              ? selectedPsikolog === "tumu"
                ? `${selectedDateSessions.length} seans planlanmış`
                : `${selectedPsikolog} için ${selectedDateSessions.length} seans planlanmış`
              : selectedPsikolog === "tumu"
                ? "Bu tarihte seans yok"
                : `${selectedPsikolog} için bu tarihte seans yok`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          {selectedDateSessions.length > 0 ? (
            <div className="space-y-2">
              {selectedDateSessions.map((seans, index) => {
                const psikologColor = getPsikologColor(seans.psikolog)
                return (
                  <div
                    key={index}
                    className="p-2 rounded border transition-all duration-200 hover:shadow-sm bg-card hover:bg-accent/50"
                    style={{ borderLeftColor: psikologColor.border, borderLeftWidth: '3px' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <User className="h-2.5 w-2.5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium text-xs">{seans.danisan}</h4>
                          <p className="text-xs text-muted-foreground">{seans.seansTipi}</p>
                          <p className="text-xs text-muted-foreground" style={{ color: psikologColor.text }}>
                            {seans.psikolog}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className={`${getDurumColor(seans.durum)} text-xs px-1 py-0`}>
                        {seans.durum}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <Clock className="h-2 w-2 text-muted-foreground mr-1" />
                        <span className="font-medium">{seans.saat}</span>
                        <span className="text-muted-foreground ml-1">({seans.sure} dk)</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <CalendarDays className="h-6 w-6 mx-auto mb-1 opacity-50" />
              <p className="text-xs">
                {selectedPsikolog === "tumu" 
                  ? "Bu tarihte seans yok" 
                  : `${selectedPsikolog} için bu tarihte seans yok`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
