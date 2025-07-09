"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, User } from "lucide-react"

// Örnek seans verileri - gerçek uygulamada bu veriler state management'tan gelecek
const seansVerileri = [
  {
    id: 1,
    tarih: "2024-01-20",
    saat: "14:00",
    danisan: "Ayşe K.",
    tip: "Bireysel Terapi",
    durum: "Onaylandı",
  },
  {
    id: 2,
    tarih: "2024-01-21",
    saat: "16:00",
    danisan: "Mehmet D.",
    tip: "Çift Terapisi",
    durum: "Planlandı",
  },
  {
    id: 3,
    tarih: "2024-01-22",
    saat: "10:00",
    danisan: "Zeynep Y.",
    tip: "MMPI Testi",
    durum: "Beklemede",
  },
  {
    id: 4,
    tarih: "2024-01-23",
    saat: "15:30",
    danisan: "Can Ö.",
    tip: "Bireysel Terapi",
    durum: "Onaylandı",
  },
]

export function DashboardCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [selectedDateSessions, setSelectedDateSessions] = React.useState<any[]>([])

  // Seçilen tarihteki seansları filtrele
  React.useEffect(() => {
    if (date) {
      const selectedDateStr = date.toISOString().split("T")[0]
      const sessionsForDate = seansVerileri.filter((seans) => seans.tarih === selectedDateStr)
      setSelectedDateSessions(sessionsForDate)
    }
  }, [date])

  // Seans olan tarihleri belirle
  const seansOlanTarihler = seansVerileri.map((seans) => new Date(seans.tarih))

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

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Takvim</CardTitle>
          </div>
          <CardDescription className="text-xs">Randevularınızı ve önemli tarihleri takip edin.</CardDescription>
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
              modifiersStyles={{
                hasSession: {
                  backgroundColor: "rgb(59 130 246 / 0.1)",
                  color: "rgb(59 130 246)",
                  fontWeight: "bold",
                },
              }}
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
              ? `${selectedDateSessions.length} seans planlanmış`
              : "Bu tarihte seans yok"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          {selectedDateSessions.length > 0 ? (
            <div className="space-y-2">
              {selectedDateSessions.map((seans) => (
                <div
                  key={seans.id}
                  className="p-2 rounded border transition-all duration-200 hover:shadow-sm bg-card hover:bg-accent/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <User className="h-2.5 w-2.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-xs">{seans.danisan}</h4>
                        <p className="text-xs text-muted-foreground">{seans.tip}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={`${getDurumColor(seans.durum)} text-xs px-1 py-0`}>
                      {seans.durum}
                    </Badge>
                  </div>

                  <div className="flex items-center text-xs">
                    <Clock className="h-2 w-2 text-muted-foreground mr-1" />
                    <span className="font-medium">{seans.saat}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <CalendarDays className="h-6 w-6 mx-auto mb-1 opacity-50" />
              <p className="text-xs">Bu tarihte seans yok</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
