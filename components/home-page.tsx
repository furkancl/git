"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, TrendingUp, ChevronLeft, ChevronRight, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"

// Same types as randevu planlama page
type Appointment = {
  id: string;
  client_id: string;
  psychologist_id: string;
  appointment_date: string;
  hour: number;
  minute: number;
  duration: number;
  description: string;
  fee: number;
  clients: {
    id: string;
    name: string;
  } | null;
  psychologists: {
    id: string;
    name: string;
    renk_kodu?: string;
  } | null;
};

type Psychologist = {
  id: string;
  name: string;
  renk_kodu?: string;
};

export function HomePage() {
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedPsychologist, setSelectedPsychologist] = useState("Tüm Psikologlar")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Helper to format date to YYYY-MM-DD string using local date components
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0") // Month is 0-indexed, add 1
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Dashboard card calculations based on appointment data
  const todayAppointments = useMemo(() => {
    if (!mounted) return 0
    return appointments.filter((app) => {
      const appointmentDate = formatDate(new Date(app.appointment_date))
      return appointmentDate === formatDate(new Date()) && app.psychologists?.name
    }).length
  }, [appointments, mounted])

  const activeClients = useMemo(() => {
    if (!mounted) return 0
    // Unique clients from appointments in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentAppointments = appointments.filter((app) => {
      const appointmentDate = new Date(app.appointment_date)
      return appointmentDate >= thirtyDaysAgo && app.clients?.id
    })
    const uniqueClientIds = new Set(recentAppointments.map(app => app.clients?.id).filter(Boolean))
    return uniqueClientIds.size
  }, [appointments, mounted])

  const thisWeekAppointments = useMemo(() => {
    if (!mounted) return 0
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1) // Monday
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday
    
    return appointments.filter((app) => {
      const appointmentDate = new Date(app.appointment_date)
      return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek && app.psychologists?.name
    }).length
  }, [appointments, mounted])

  const monthlyRevenue = useMemo(() => {
    if (!mounted) return 0
    
    const now = new Date()
    // Get start of current month (00:00:00 local time)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    // Get end of current month (23:59:59.999 local time)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    return appointments
      .filter((app) => {
        if (!app.appointment_date || app.fee === undefined || app.fee === null) return false
        
        // Create date in local timezone
        const appointmentDate = new Date(app.appointment_date)
        // Reset time components to handle pure date comparison
        const appDateOnly = new Date(
          appointmentDate.getFullYear(),
          appointmentDate.getMonth(),
          appointmentDate.getDate()
        )
        
        return (
          appDateOnly >= new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), startOfMonth.getDate()) &&
          appDateOnly <= new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate())
        )
      })
      .reduce((sum, app) => {
        const fee = Number(app.fee)
        return isNaN(fee) ? sum : sum + fee
      }, 0)
  }, [appointments, mounted])



  // Set today's date on client-side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setSelectedDate(formatDate(new Date()))
  }, [])

  // Fetch appointments and psychologists from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointments with related client and psychologist data
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            *,
            clients(id, name),
            psychologists(id, name, renk_kodu)
          `)
          .order('appointment_date', { ascending: true })

        if (appointmentsError) {
          console.error('Randevular çekilirken hata:', appointmentsError)
        } else {
          setAppointments(appointmentsData || [])
        }

        // Fetch psychologists for dropdown
        const { data: psychologistsData, error: psychologistsError } = await supabase
          .from('psychologists')
          .select('*')
          .order('name')

        if (psychologistsError) {
          console.error('Psikologlar çekilirken hata:', psychologistsError)
        } else {
          setPsychologists(psychologistsData || [])
        }
      } catch (error) {
        console.error('Veri çekilirken genel hata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    // getDay() returns 0 for Sunday, 1 for Monday...
    // We want Monday to be the first day of the week in our calendar grid (index 0)
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1 // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  }

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1)
        return 11
      }
      return prevMonth - 1
    })
  }

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear((prevYear) => prevYear + 1)
        return 0
      }
      return prevMonth + 1
    })
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const monthNames = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ]
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"] // Adjusted for Monday start

  // Get psychologist color from Supabase renk_kodu (now using inline styles)
  const getPsychologistColor = (appointment: Appointment) => {
    if (appointment.psychologists?.renk_kodu?.startsWith('#')) {
      return appointment.psychologists.renk_kodu
    }
    // Fallback color for appointments without psychologist or color
    return '#6b7280' // gray-500
  }

  // Calendar rendering logic

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="p-1"></div>)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(currentYear, currentMonth, i)
    const dayDateString = formatDate(dayDate)
    const isToday = mounted && dayDateString === formatDate(new Date())
    const isSelected = selectedDate === dayDateString

    // Filter appointments for this specific day from Supabase data
    const appointmentsForDay = appointments.filter((app) => {
      const appointmentDate = formatDate(new Date(app.appointment_date))
      return appointmentDate === dayDateString
    })

    // Get unique psychologists for this day (excluding appointments without psychologist)
    const psychologistsForDay = Array.from(
      new Set(
        appointmentsForDay
          .filter((app) => app.psychologists?.name)
          .map((app) => app.psychologists!.name)
      )
    )

    calendarDays.push(
      <div
        key={`day-${i}`}
        className={`relative p-1 rounded-md cursor-pointer transition-colors duration-200 text-sm flex flex-col items-center justify-center overflow-hidden border-2 ${
          isSelected && !isToday 
            ? "bg-blue-100 text-blue-900 font-semibold border-blue-500" 
            : isSelected && isToday 
            ? "bg-blue-700 text-white font-bold shadow-lg border-blue-800" 
            : isToday 
            ? "bg-blue-600 text-white font-bold shadow-md border-blue-600" 
            : "hover:bg-blue-50 text-gray-800 border-transparent"
        }`}
        onClick={() => setSelectedDate(dayDateString)}
      >
        {i}
        {/* Psikolog renk göstergeleri - her randevu için bir nokta */}
        <div className="flex flex-wrap gap-0.5 mt-1 z-10 justify-center">
          {appointmentsForDay.map((app, idx) => {
            const psychologistColor = app.psychologists?.renk_kodu
            const backgroundColor = psychologistColor?.startsWith('#') ? psychologistColor : '#6b7280' // fallback gray
            
            return (
              <div
                key={`${app.id}-${idx}`}
                className="w-2 h-2 rounded-full border border-white shadow-sm"
                style={{ backgroundColor }}
                title={`${app.psychologists?.name || 'Psikolog atanmamış'} - ${app.hour.toString().padStart(2, '0')}:${app.minute.toString().padStart(2, '0')}`}
              ></div>
            )
          })}
        </div>
      </div>,
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Create psychologist dropdown options from Supabase data
  const psychologistOptions = [
    "Tüm Psikologlar",
    ...psychologists.map(p => p.name),
    "Diğer"
  ]

  // Filter appointments based on selected date and psychologist
  const filteredAppointments = appointments.filter((app) => {
    const appointmentDate = formatDate(new Date(app.appointment_date))
    const matchesDate = !selectedDate || appointmentDate === selectedDate
    
    let matchesPsychologist = false
    if (selectedPsychologist === "Tüm Psikologlar") {
      matchesPsychologist = true
    } else if (selectedPsychologist === "Diğer") {
      matchesPsychologist = !app.psychologists // Appointments without psychologist
    } else {
      matchesPsychologist = app.psychologists?.name === selectedPsychologist
    }

    return matchesDate && matchesPsychologist
  })

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 flex-shrink-0">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bugünkü Seanslar</p>
              <p className="text-2xl font-bold text-blue-700">{todayAppointments}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500 opacity-70" />
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Danışanlar</p>
              <p className="text-2xl font-bold text-green-700">{activeClients}</p>
            </div>
            <Users className="h-8 w-8 text-green-500 opacity-70" />
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bu Hafta</p>
              <p className="text-2xl font-bold text-orange-700">{thisWeekAppointments}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500 opacity-70" />
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aylık Gelir</p>
              <p className="text-2xl font-bold text-red-700">₺{monthlyRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-500 opacity-70" />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow overflow-hidden">
        {/* Takvim - Daha Geniş ve Estetik */}
        <div className="lg:col-span-2 h-full flex flex-col">
          <Card className="h-full shadow-sm border-none flex-grow">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-xl font-bold text-gray-800">Takvim</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs flex-grow overflow-y-auto overflow-x-hidden">
                {dayNames.map((day) => (
                  <div key={day} className="p-1 font-medium text-gray-600">
                    {day}
                  </div>
                ))}
                {calendarDays}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Sağ Sütun: Bugünkü Randevular ve Psikolog Dropdown */}
        <div className="flex flex-col gap-4 h-full">
          {/* Bugünkü Randevular */}
          <Card className="shadow-sm border-none flex-grow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
              <CardTitle className="text-xl font-bold text-gray-800">
                {selectedDate
                  ? `${new Date(selectedDate).getDate()} ${monthNames[new Date(selectedDate).getMonth()]} ${selectedPsychologist === "Diğer" ? "Etkinlikleri" : "Randevuları"}`
                  : "Bugünkü Randevular"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow overflow-hidden">
              <div className="mb-4 flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-white border-gray-300 text-gray-700 hover:bg-gray-50 text-sm h-9"
                    >
                      <User className="mr-2 h-4 w-4" /> {selectedPsychologist}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                    {psychologistOptions.map((psychologist) => (
                      <DropdownMenuItem key={psychologist} onClick={() => setSelectedPsychologist(psychologist)}>
                        {psychologist}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Randevu listesi için sabit yükseklik ve kaydırma */}
              <div className="space-y-2 flex-grow overflow-y-auto overflow-x-hidden max-h-[calc(100vh-400px)]">
                {/* max-h değeri ekran yüksekliğine göre ayarlandı */}
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment, index) => {
                    // Format time from hour and minute
                    const appointmentTime = `${appointment.hour.toString().padStart(2, '0')}:${appointment.minute.toString().padStart(2, '0')}`
                    
                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg shadow-xs text-sm"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="text-center flex-shrink-0">
                            <div className="text-base font-semibold text-blue-700">{appointmentTime}</div>
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {appointment.clients?.name || 'Müşteri bilgisi yok'}
                            </h3>
                            <p className="text-xs text-gray-600 truncate">{appointment.description || 'Açıklama yok'}</p>
                            {appointment.psychologists?.name && (
                              <p className="text-xs text-gray-500 truncate">{appointment.psychologists.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Onaylandı
                          </span>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100 h-8 w-8 p-0">
                            Detay
                          </Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-gray-500 text-sm">
                    {selectedDate ? "Seçilen gün için randevu bulunmamaktadır." : "Bugün için randevu bulunmamaktadır."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
