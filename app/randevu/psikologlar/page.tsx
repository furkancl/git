"use client"

import { Header } from "@/components/header"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, startOfDay, endOfDay, isWithinInterval, subDays } from "date-fns"
import { tr } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import { CalendarIcon, Users, CalendarCheck, User } from "lucide-react" // Yeni ikonlar eklendi

// Dummy danışan verisi (mevcut projeden)
const initialClients = [
  { id: 1, name: "Ayşe Yılmaz" },
  { id: 2, name: "Mehmet Demir" },
  { id: 3, name: "Zeynep Kaya" },
]

// Dummy psikolog verisi (mevcut projeden)
const initialPsychologists = [
  { id: 101, name: "Dr. Elif Yılmaz" },
  { id: 102, name: "Uzm. Psk. Can Demir" },
  { id: 103, name: "Psk. Zeynep Akın" },
]

// Dummy randevu verisi (mevcut projeden)
const today = new Date()
const initialAppointments = [
  {
    id: 1,
    clientId: 1,
    psychologistId: 101,
    date: subDays(today, 5), // 5 gün önce
    hour: 12,
    minute: 0,
    duration: 60,
    desc: "Bireysel seans",
  },
  {
    id: 2,
    clientId: 2,
    psychologistId: 102,
    date: subDays(today, 10), // 10 gün önce
    hour: 14,
    minute: 30,
    duration: 90,
    desc: "Aile danışmanlığı",
  },
  {
    id: 3,
    clientId: 3,
    psychologistId: 101,
    date: subDays(today, 2), // 2 gün önce
    hour: 11,
    minute: 0,
    duration: 60,
    desc: "Çocuk seansı",
  },
  {
    id: 4,
    clientId: 1,
    psychologistId: 103,
    date: subDays(today, 1), // 1 gün önce
    hour: 16,
    minute: 0,
    duration: 60,
    desc: "Takip görüşmesi",
  },
  {
    id: 5,
    clientId: 2,
    psychologistId: 102,
    date: subDays(today, 0), // Bugün
    hour: 10,
    minute: 0,
    duration: 60,
    desc: "Grup Terapisi",
  },
  {
    id: 6,
    clientId: 3,
    psychologistId: 103,
    date: subDays(today, 0), // Bugün
    hour: 10,
    minute: 15,
    duration: 60,
    desc: "Bireysel Danışmanlık",
  },
  {
    id: 7,
    clientId: 1,
    psychologistId: 101,
    date: subDays(today, 35), // 35 gün önce (eski seans)
    hour: 9,
    minute: 0,
    duration: 60,
    desc: "Eski seans",
  },
]

export default function PsychologistPerformancePage() {
  const [psychologists] = useState(initialPsychologists)
  const [appointments] = useState(initialAppointments)

  // Tarih aralığı filtresi için state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30), // Varsayılan: Son 30 gün
    to: new Date(),
  })

  // Psikolog performans metriklerini hesapla
  const psychologistStats = useMemo(() => {
    return psychologists.map((psychologist) => {
      const psychAppointments = appointments.filter((appt) => appt.psychologistId === psychologist.id)

      // Belirli tarih aralığındaki seanslar
      const sessionsInDateRange = psychAppointments.filter((appt) => {
        if (!dateRange?.from) return true // Tarih aralığı seçilmediyse tüm seanslar
        const start = startOfDay(dateRange.from)
        const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)
        return isWithinInterval(appt.date, { start, end })
      })

      // Toplam danışanlar (benzersiz clientId'ler)
      const totalClients = new Set(psychAppointments.map((appt) => appt.clientId)).size

      // Aktif danışanlar (son 90 gün içinde randevusu olan danışanlar)
      const activeClients = new Set(
        psychAppointments
          .filter((appt) => isWithinInterval(appt.date, { start: subDays(new Date(), 90), end: new Date() }))
          .map((appt) => appt.clientId),
      ).size

      return {
        ...psychologist,
        sessionsCount: sessionsInDateRange.length,
        totalClientsCount: totalClients,
        activeClientsCount: activeClients,
      }
    })
  }, [psychologists, appointments, dateRange])

  // Genel klinik performans metriklerini hesapla
  const overallClinicStats = useMemo(() => {
    const allSessionsInDateRange = appointments.filter((appt) => {
      if (!dateRange?.from) return true
      const start = startOfDay(dateRange.from)
      const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)
      return isWithinInterval(appt.date, { start, end })
    })
    const totalUniqueClients = new Set(appointments.map((appt) => appt.clientId)).size
    const totalActiveClients = new Set(
      appointments
        .filter((appt) => isWithinInterval(appt.date, { start: subDays(new Date(), 90), end: new Date() }))
        .map((appt) => appt.clientId),
    ).size

    return {
      totalSessions: allSessionsInDateRange.length,
      totalClients: totalUniqueClients,
      totalActiveClients: totalActiveClients,
    }
  }, [appointments, dateRange])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start p-6 md:p-12">
        {" "}
        {/* Genel dolgu artırıldı */}
        <div className="w-full max-w-7xl mb-10">
          {" "}
          {/* Maksimum genişlik ve alt boşluk artırıldı */}
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center">
            {" "}
            {/* Daha büyük, kalın başlık, ortalandı */}
            Psikolog Paneli
          </h1>
          {/* Tarih Aralığı Filtresi */}
          <div className="flex justify-end mb-10">
            {" "}
            {/* Alt boşluk artırıldı */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[300px] justify-start text-left font-normal dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-xl h-11", // Hafifçe daha uzun buton, yuvarlak köşeler
                    !dateRange?.from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5" /> {/* Hafifçe daha büyük ikon */}
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd MMM yyyy", { locale: tr })} -{" "}
                        {format(dateRange.to, "dd MMM yyyy", { locale: tr })}
                      </>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy", { locale: tr })
                    )
                  ) : (
                    <span>Tarih Aralığı Seç</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-lg"
                align="end"
              >
                {" "}
                {/* Yuvarlak ve gölgeli popover içeriği */}
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Aktif Psikolog Kadrosu */}
          <section className="mb-10">
            {" "}
            {/* Alt boşluk artırıldı */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Aktif Psikolog Kadrosu</h2>{" "}
            {/* Daha büyük, kalın alt başlık */}
            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-2xl">
              {" "}
              {/* Daha yumuşak gölge, daha yuvarlak */}
              <CardContent className="p-8">
                {" "}
                {/* Dolgu artırıldı */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {" "}
                  {/* Daha iyi kontrol için div ve grid kullanıldı */}
                  {psychologists.map((psychologist) => (
                    <div
                      key={psychologist.id}
                      className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-200"
                    >
                      {" "}
                      {/* Daha temiz liste öğesi */}
                      <User className="h-5 w-5 text-blue-500" /> {/* Her psikolog için ikon */}
                      <span>{psychologist.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
          {/* Genel Klinik Performansı */}
          <section className="mb-10">
            {" "}
            {/* Alt boşluk artırıldı */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Genel Klinik Performansı</h2>{" "}
            {/* Daha büyük, kalın alt başlık */}
            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-2xl">
              {" "}
              {/* Daha yumuşak gölge, daha yuvarlak */}
              <CardContent className="p-8 space-y-4 text-gray-700 dark:text-gray-200">
                {" "}
                {/* Dolgu ve boşluk artırıldı */}
                <div className="flex items-center gap-4">
                  <CalendarCheck className="h-6 w-6 text-green-500" /> {/* İkon */}
                  <p className="text-xl">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {overallClinicStats.totalSessions}
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-300">Toplam Seans Sayısı (Seçilen Aralıktaki)</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Users className="h-6 w-6 text-purple-500" /> {/* İkon */}
                  <p className="text-xl">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {overallClinicStats.totalClients}
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-300">Toplam Benzersiz Danışan Sayısı</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Users className="h-6 w-6 text-orange-500" /> {/* İkon */}
                  <p className="text-xl">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {overallClinicStats.totalActiveClients}
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-300">Toplam Aktif Danışan Sayısı (Son 90 Gün)</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
          {/* Psikolog Performans Özeti Kartları */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Psikologların Performansları</h2>{" "}
            {/* Daha büyük, kalın alt başlık */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {psychologistStats.map((psychologist) => (
                <Card key={psychologist.id} className="dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-2xl">
                  {" "}
                  {/* Daha yumuşak gölge, daha yuvarlak */}
                  <CardHeader className="pb-4">
                    {" "}
                    {/* Alt dolgu eklendi */}
                    <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {" "}
                      {/* Daha büyük, hafifçe kalın başlık */}
                      {psychologist.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-gray-700 dark:text-gray-200">
                    {" "}
                    {/* Boşluk artırıldı */}
                    <div className="flex items-center gap-3">
                      <CalendarCheck className="h-5 w-5 text-blue-500" /> {/* İkon */}
                      <p className="text-lg">
                        <span className="font-bold">{psychologist.sessionsCount}</span>{" "}
                        <span className="text-gray-600 dark:text-gray-300">Seans (Seçilen Aralıktaki)</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-500" /> {/* İkon */}
                      <p className="text-lg">
                        <span className="font-bold">{psychologist.totalClientsCount}</span>{" "}
                        <span className="text-gray-600 dark:text-gray-300">Toplam Danışan</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-500" /> {/* İkon */}
                      <p className="text-lg">
                        <span className="font-bold">{psychologist.activeClientsCount}</span>{" "}
                        <span className="text-gray-600 dark:text-gray-300">Aktif Danışan (Son 90 Gün)</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}