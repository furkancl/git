
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, User, FileText, Users, Heart, UserCheck } from "lucide-react"
import { Psikolog, Randevu } from "@/lib/csv-parser"

interface TodaysEventsProps {
  selectedPsikolog: string
  onPsikologChange: (value: string) => void
  randevular: Randevu[]
  psikologlar: Psikolog[]
}

const getEventIcon = (seansTipi: string) => {
  switch (seansTipi) {
    case "Bireysel Terapi":
      return User
    case "MMPI Testi":
      return FileText
    case "Çift Terapisi":
      return Users
    default:
      return Heart
  }
}

const getEventColor = (seansTipi: string) => {
  switch (seansTipi) {
    case "Bireysel Terapi":
      return "bg-blue-100 text-blue-800"
    case "MMPI Testi":
      return "bg-purple-100 text-purple-800"
    case "Çift Terapisi":
      return "bg-pink-100 text-pink-800"
    default:
      return "bg-green-100 text-green-800"
  }
}

const getStatusColor = (durum: string) => {
  switch (durum) {
    case "Onaylandı":
      return "bg-green-100 text-green-800"
    case "Planlandı":
      return "bg-blue-100 text-blue-800"
    case "Beklemede":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getStatusLabel = (durum: string) => {
  switch (durum) {
    case "Onaylandı":
      return "Onaylandı"
    case "Planlandı":
      return "Planlandı"
    case "Beklemede":
      return "Bekliyor"
    default:
      return "Bilinmiyor"
  }
}

// Tarih formatını standardize etmek için yardımcı fonksiyon
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function TodaysEvents({ selectedPsikolog, onPsikologChange, randevular, psikologlar }: TodaysEventsProps) {
  const currentTime = new Date()
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()

  // Get today's date in YYYY-MM-DD format (CSV formatı ile aynı)
  const today = formatDateToYYYYMMDD(currentTime)
  console.log('Today\'s Events - Today\'s date (YYYY-MM-DD):', today)

  // Filter today's appointments based on selected psychologist
  const todaysAppointments = randevular.filter(randevu => {
    const isToday = randevu.tarih === today
    const matchesPsychologist = selectedPsikolog === "tumu" || randevu.psikolog === selectedPsikolog
    
    // Debug için log ekleyelim
    if (isToday) {
      console.log('Today\'s Events - Today appointment:', {
        danisan: randevu.danisan,
        psikolog: randevu.psikolog,
        tarih: randevu.tarih,
        selectedPsikolog: selectedPsikolog,
        matches: matchesPsychologist
      })
    }
    
    return isToday && matchesPsychologist
  })

  console.log('Today\'s Events - Selected psychologist:', selectedPsikolog)
  console.log('Today\'s Events - Today\'s appointments:', todaysAppointments)

  // Sort appointments by time
  const sortedAppointments = todaysAppointments.sort((a, b) => 
    a.saat.localeCompare(b.saat)
  )

  const isEventActive = (eventTime: string) => {
    const [hour, minute] = eventTime.split(":").map(Number)
    const eventMinutes = hour * 60 + minute
    const currentMinutes = currentHour * 60 + currentMinute
    return currentMinutes >= eventMinutes && currentMinutes < eventMinutes + 50
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Bugünün Etkinlikleri</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs px-1.5 py-0.5">
            {sortedAppointments.length}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          {selectedPsikolog === "tumu" 
            ? "Bugün için planlanan tüm randevular" 
            : `${selectedPsikolog} için bugünkü randevular`}
        </CardDescription>
      </CardHeader>
      
      {/* Psikolog Seçimi Dropdown */}
      <div className="px-4 pb-3">
        <div className="flex items-center space-x-2 mb-2">
          <UserCheck className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Psikolog Seçimi</span>
        </div>
        <Select value={selectedPsikolog} onValueChange={onPsikologChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue>
              {selectedPsikolog === "tumu" ? "Tüm Psikologlar" : selectedPsikolog}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tumu">Tüm Psikologlar</SelectItem>
            {psikologlar.map((psikolog, index) => (
              <SelectItem key={index} value={psikolog.adiSoyadi}>
                {psikolog.adiSoyadi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CardContent className="p-2">
        {sortedAppointments.length > 0 ? (
          <div className="space-y-1.5">
            {sortedAppointments.map((appointment, index) => {
              const EventIcon = getEventIcon(appointment.seansTipi)
              const isActive = isEventActive(appointment.saat)

              return (
                <div
                  key={index}
                  className={`
                    p-2 rounded border transition-all duration-200 hover:shadow-sm
                    ${isActive ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-accent/50"}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <div className={`p-0.5 rounded ${getEventColor(appointment.seansTipi)}`}>
                        <EventIcon className="h-2.5 w-2.5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-xs">{appointment.danisan}</h4>
                        <p className="text-xs text-muted-foreground">{appointment.seansTipi}</p>
                        <p className="text-xs text-muted-foreground">{appointment.psikolog}</p>
                      </div>
                    </div>
                    {isActive && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-1 py-0">
                        Aktif
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-2 w-2 text-muted-foreground" />
                      <span className="font-medium">{appointment.saat}</span>
                      <span className="text-muted-foreground">({appointment.sure} dk)</span>
                    </div>
                    <Badge variant="secondary" className={`${getStatusColor(appointment.durum)} text-xs px-1 py-0`}>
                      {getStatusLabel(appointment.durum)}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="h-6 w-6 mx-auto mb-1 opacity-50" />
            <p className="text-xs">
              {selectedPsikolog === "tumu" 
                ? "Bugün için randevu yok" 
                : `${selectedPsikolog} için bugünkü randevu yok`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
