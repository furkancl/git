"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, TrendingUp, ChevronLeft, ChevronRight, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function HomePage() {
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedPsychologist, setSelectedPsychologist] = useState("Tüm Psikologlar")

  // Helper to format date to YYYY-MM-DD string using local date components
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0") // Month is 0-indexed, add 1
    const day = date.getDate().toString().padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // State for selected date on calendar, defaults to today
  const [selectedDate, setSelectedDate] = useState<string | null>(formatDate(new Date()))

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
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

  // Define psychologist colors
  const psychologistColors: { [key: string]: string } = {
    "Dr. Elif Yılmaz": "bg-blue-500",
    "Uzm. Psk. Can Demir": "bg-green-500",
    "Psk. Zeynep Kaya": "bg-purple-500",
    "Dr. Ayşe Güneş": "bg-red-500",
    "Uzm. Psk. Burak Akın": "bg-yellow-500",
    "Psk. Cemil Yıldız": "bg-indigo-500",
  }

  // --- Sabit Randevu ve Etkinlik Verileri Başlangıcı ---
  const allAppointments = [
    // Temmuz 2025 için sabit randevular ve etkinlikler
    // Not: formatDate fonksiyonu mevcut yıla göre çalışır, bu yüzden randevu tarihlerini buna göre ayarladım.
    // Gerçek bir uygulamada bu veriler bir veritabanından gelmelidir.

    // 1 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 1)),
      time: "09:00",
      client: "Ayşe Yılmaz",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Dr. Elif Yılmaz",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 1)),
      time: "11:00",
      client: "Ekip Toplantısı",
      type: "Toplantı",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 1)),
      time: "14:00",
      client: "Can Demir",
      type: "Çift Terapisi",
      status: "pending",
      psychologist: "Uzm. Psk. Can Demir",
    },

    // 2 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 2)),
      time: "10:00",
      client: "Zeynep Kaya",
      type: "Online Terapi",
      status: "confirmed",
      psychologist: "Psk. Zeynep Kaya",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 2)),
      time: "15:00",
      client: "Mehmet Aksoy",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Dr. Ayşe Güneş",
    },

    // 3 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 3)),
      time: "09:30",
      client: "Seminer Hazırlığı",
      type: "Hazırlık",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 3)),
      time: "13:00",
      client: "Elif Can",
      type: "Aile Terapisi",
      status: "confirmed",
      psychologist: "Uzm. Psk. Burak Akın",
    },

    // 4 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 4)),
      time: "10:30",
      client: "Burak Yıldız",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Psk. Cemil Yıldız",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 4)),
      time: "16:00",
      client: "Gizem Kara",
      type: "Çocuk Terapisi",
      status: "pending",
      psychologist: "Dr. Elif Yılmaz",
    },

    // 5 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 5)),
      time: "11:00",
      client: "Ofis Bakımı",
      type: "Bakım",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 5)),
      time: "14:30",
      client: "Deniz Arslan",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Uzm. Psk. Can Demir",
    },

    // 6 Temmuz (Hafta Sonu)
    {
      date: formatDate(new Date(currentYear, currentMonth, 6)),
      time: "10:00",
      client: "Hafta Sonu Etkinliği",
      type: "Etkinlik",
      status: "confirmed",
      psychologist: "Diğer",
    },

    // 7 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 7)),
      time: "09:00",
      client: "Aslı Güneş",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Psk. Zeynep Kaya",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 7)),
      time: "14:00",
      client: "Kerem Demir",
      type: "Çift Terapisi",
      status: "confirmed",
      psychologist: "Dr. Ayşe Güneş",
    },

    // 8 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 8)),
      time: "10:00",
      client: "Eğitim Semineri",
      type: "Eğitim",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 8)),
      time: "11:30",
      client: "Selin Akın",
      type: "Online Terapi",
      status: "pending",
      psychologist: "Uzm. Psk. Burak Akın",
    },

    // 9 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 9)),
      time: "10:00",
      client: "Cemil Yılmaz",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Psk. Cemil Yıldız",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 9)),
      time: "15:00",
      client: "Fatma Can",
      type: "Aile Terapisi",
      status: "confirmed",
      psychologist: "Dr. Elif Yılmaz",
    },

    // 10 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 10)),
      time: "09:00",
      client: "Murat Kaya",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Uzm. Psk. Can Demir",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 10)),
      time: "14:00",
      client: "Webinar Katılımı",
      type: "Webinar",
      status: "confirmed",
      psychologist: "Diğer",
    },

    // 11 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 11)),
      time: "10:30",
      client: "İrem Özkan",
      type: "Çocuk Terapisi",
      status: "confirmed",
      psychologist: "Psk. Zeynep Kaya",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 11)),
      time: "16:00",
      client: "Hakan Şahin",
      type: "Bireysel Terapi",
      status: "pending",
      psychologist: "Dr. Ayşe Güneş",
    },

    // 12 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 12)),
      time: "11:00",
      client: "Danışmanlık Görüşmesi",
      type: "Danışmanlık",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 12)),
      time: "14:30",
      client: "Ebru Çelik",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Uzm. Psk. Burak Akın",
    },

    // 13 Temmuz (Hafta Sonu)
    {
      date: formatDate(new Date(currentYear, currentMonth, 13)),
      time: "10:00",
      client: "Hafta Sonu Etkinliği 2",
      type: "Etkinlik",
      status: "confirmed",
      psychologist: "Diğer",
    },

    // 14 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 14)),
      time: "09:00",
      client: "Ozan Yılmaz",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Psk. Cemil Yıldız",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 14)),
      time: "14:00",
      client: "Pınar Aksoy",
      type: "Çift Terapisi",
      status: "confirmed",
      psychologist: "Dr. Elif Yılmaz",
    },

    // 15 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 15)),
      time: "10:00",
      client: "Resmi Tatil",
      type: "Resmi Tatil",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 15)),
      time: "11:30",
      client: "Canan Demir",
      type: "Online Terapi",
      status: "pending",
      psychologist: "Uzm. Psk. Can Demir",
    },

    // 16 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 16)),
      time: "09:00",
      client: "Gülşen Kaya",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Psk. Zeynep Kaya",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 16)),
      time: "15:00",
      client: "Ali Veli",
      type: "Aile Terapisi",
      status: "confirmed",
      psychologist: "Dr. Ayşe Güneş",
    },

    // 17 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 17)),
      time: "10:00",
      client: "Ekip Toplantısı",
      type: "Toplantı",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 17)),
      time: "13:00",
      client: "Deniz Can",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Uzm. Psk. Burak Akın",
    },

    // 18 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 18)),
      time: "10:30",
      client: "Efe Yıldız",
      type: "Çocuk Terapisi",
      status: "confirmed",
      psychologist: "Psk. Cemil Yıldız",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 18)),
      time: "16:00",
      client: "Zeynep Akın",
      type: "Bireysel Terapi",
      status: "pending",
      psychologist: "Dr. Elif Yılmaz",
    },

    // 19 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 19)),
      time: "11:00",
      client: "Ofis Bakımı",
      type: "Bakım",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 19)),
      time: "14:30",
      client: "Cenk Arslan",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Uzm. Psk. Can Demir",
    },

    // 20 Temmuz (Hafta Sonu)
    {
      date: formatDate(new Date(currentYear, currentMonth, 20)),
      time: "10:00",
      client: "Hafta Sonu Etkinliği 3",
      type: "Etkinlik",
      status: "confirmed",
      psychologist: "Diğer",
    },

    // 21 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 21)),
      time: "09:00",
      client: "Aslı Demir",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Psk. Zeynep Kaya",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 21)),
      time: "14:00",
      client: "Kerem Güneş",
      type: "Çift Terapisi",
      status: "confirmed",
      psychologist: "Dr. Ayşe Güneş",
    },

    // 22 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 22)),
      time: "10:00",
      client: "Eğitim Semineri",
      type: "Eğitim",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 22)),
      time: "11:30",
      client: "Selin Can",
      type: "Online Terapi",
      status: "pending",
      psychologist: "Uzm. Psk. Burak Akın",
    },

    // 23 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 23)),
      time: "10:00",
      client: "Cemil Kaya",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Psk. Cemil Yıldız",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 23)),
      time: "15:00",
      client: "Fatma Yılmaz",
      type: "Aile Terapisi",
      status: "confirmed",
      psychologist: "Dr. Elif Yılmaz",
    },

    // 24 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 24)),
      time: "09:00",
      client: "Murat Aksoy",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Uzm. Psk. Can Demir",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 24)),
      time: "14:00",
      client: "Webinar Katılımı",
      type: "Webinar",
      status: "confirmed",
      psychologist: "Diğer",
    },

    // 25 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 25)),
      time: "10:30",
      client: "İrem Demir",
      type: "Çocuk Terapisi",
      status: "confirmed",
      psychologist: "Psk. Zeynep Kaya",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 25)),
      time: "16:00",
      client: "Hakan Can",
      type: "Bireysel Terapi",
      status: "pending",
      psychologist: "Dr. Ayşe Güneş",
    },

    // 26 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 26)),
      time: "11:00",
      client: "Danışmanlık Görüşmesi",
      type: "Danışmanlık",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 26)),
      time: "14:30",
      client: "Ebru Yılmaz",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Uzm. Psk. Burak Akın",
    },

    // 27 Temmuz (Hafta Sonu)
    {
      date: formatDate(new Date(currentYear, currentMonth, 27)),
      time: "10:00",
      client: "Hafta Sonu Etkinliği 4",
      type: "Etkinlik",
      status: "confirmed",
      psychologist: "Diğer",
    },

    // 28 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 28)),
      time: "09:00",
      client: "Ozan Aksoy",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Psk. Cemil Yıldız",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 28)),
      time: "14:00",
      client: "Pınar Demir",
      type: "Çift Terapisi",
      status: "confirmed",
      psychologist: "Dr. Elif Yılmaz",
    },

    // 29 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 29)),
      time: "10:00",
      client: "Resmi Tatil",
      type: "Resmi Tatil",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 29)),
      time: "11:30",
      client: "Canan Kaya",
      type: "Online Terapi",
      status: "pending",
      psychologist: "Uzm. Psk. Can Demir",
    },

    // 30 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 30)),
      time: "09:00",
      client: "Gülşen Demir",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Psk. Zeynep Kaya",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 30)),
      time: "15:00",
      client: "Ali Can",
      type: "Aile Terapisi",
      status: "confirmed",
      psychologist: "Dr. Ayşe Güneş",
    },

    // 31 Temmuz
    {
      date: formatDate(new Date(currentYear, currentMonth, 31)),
      time: "10:00",
      client: "Ekip Toplantısı",
      type: "Toplantı",
      status: "confirmed",
      psychologist: "Diğer",
    },
    {
      date: formatDate(new Date(currentYear, currentMonth, 31)),
      time: "13:00",
      client: "Deniz Yılmaz",
      type: "Bireysel Terapi",
      status: "confirmed",
      psychologist: "Uzm. Psk. Burak Akın",
    },
  ]
  // --- Sabit Randevu ve Etkinlik Verileri Sonu ---

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="p-1"></div>)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(currentYear, currentMonth, i)
    const dayDateString = formatDate(dayDate)
    const isToday = dayDateString === formatDate(new Date())
    const isSelected = selectedDate === dayDateString

    // Filter appointments/events for this specific day
    const itemsForDay = allAppointments.filter((app) => app.date === dayDateString)

    // Determine if there are "Diğer" items or psychologist appointments for the day
    // psychologistsForDay sadece "Diğer" olmayan psikologları içerir.
    const psychologistsForDay = Array.from(
      new Set(itemsForDay.filter((item) => item.psychologist !== "Diğer").map((app) => app.psychologist)),
    )

    calendarDays.push(
      <div
        key={`day-${i}`}
        className={`relative p-1 rounded-md cursor-pointer transition-colors duration-200 text-sm flex flex-col items-center justify-center overflow-hidden ${
          isToday ? "bg-blue-600 text-white font-bold shadow-md" : "hover:bg-blue-50 text-gray-800"
        } ${isSelected ? "border-2 border-blue-700" : ""}`}
        onClick={() => setSelectedDate(dayDateString)}
      >
        {i}
        {/* Sadece "Diğer" olmayan psikologlar için göstergeler */}
        <div className="flex gap-0.5 mt-1 z-10">
          {psychologistsForDay.map((psy) => (
            <div
              key={psy}
              className={`w-1.5 h-1.5 rounded-full ${psychologistColors[psy] || "bg-gray-400"}`}
              title={psy}
            ></div>
          ))}
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

  // Updated psychologists list including "Diğer"
  const psychologists = [
    "Tüm Psikologlar",
    "Dr. Elif Yılmaz",
    "Uzm. Psk. Can Demir",
    "Psk. Zeynep Kaya",
    "Dr. Ayşe Güneş",
    "Uzm. Psk. Burak Akın",
    "Psk. Cemil Yıldız",
    "Diğer", // Changed from "Etkinlikler" to "Diğer"
  ]

  const filteredAppointments = allAppointments.filter((app) => {
    const matchesDate = !selectedDate || app.date === selectedDate
    let matchesPsychologistOrEvent = false

    if (selectedPsychologist === "Tüm Psikologlar") {
      matchesPsychologistOrEvent = true // Show all appointments and "Diğer" items
    } else if (selectedPsychologist === "Diğer") {
      matchesPsychologistOrEvent = app.psychologist === "Diğer" // Show only "Diğer" items
    } else {
      matchesPsychologistOrEvent = app.psychologist === selectedPsychologist && app.psychologist !== "Diğer" // Show specific psychologist's appointments, excluding "Diğer"
    }

    return matchesDate && matchesPsychologistOrEvent
  })

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 flex-shrink-0">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bugünkü Seanslar</p>
              <p className="text-2xl font-bold text-blue-700">
                {
                  allAppointments.filter((app) => app.date === formatDate(new Date()) && app.psychologist !== "Diğer")
                    .length
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500 opacity-70" />
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Danışanlar</p>
              <p className="text-2xl font-bold text-green-700">28</p>
            </div>
            <Users className="h-8 w-8 text-green-500 opacity-70" />
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bu Hafta</p>
              <p className="text-2xl font-bold text-orange-700">18</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500 opacity-70" />
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aylık Gelir</p>
              <p className="text-2xl font-bold text-red-700">₺12,450</p>
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
                    {psychologists.map((psychologist) => (
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
                  filteredAppointments.map((appointment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg shadow-xs text-sm"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="text-center flex-shrink-0">
                          <div className="text-base font-semibold text-blue-700">{appointment.time}</div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{appointment.client}</h3>
                          <p className="text-xs text-gray-600 truncate">{appointment.type}</p>
                          {appointment.psychologist !== "Diğer" && (
                            <p className="text-xs text-gray-500 truncate">{appointment.psychologist}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            appointment.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status === "confirmed" ? "Onaylandı" : "Bekliyor"}
                        </span>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100 h-8 w-8 p-0">
                          Detay
                        </Button>
                      </div>
                    </div>
                  ))
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
