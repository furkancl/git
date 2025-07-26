"use client"

import { Header } from "@/components/header"
import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, Trash2, UserPlus, User, CalendarCheck, CheckIcon, Search, CalendarIcon, DollarSign, Phone, Mail } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { tr } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

// Dummy psikolog verisi
type Psychologist = {
  id: number
  name: string
  email: string
  phone: string
}

const initialPsychologists: Psychologist[] = [
  { id: 101, name: "Dr. Elif Yılmaz", email: "elif.yilmaz@example.com", phone: "555-1111" },
  { id: 102, name: "Uzm. Psk. Can Demir", email: "can.demir@example.com", phone: "555-2222" },
  { id: 103, name: "Psk. Zeynep Akın", email: "zeynep.akin@example.com", phone: "555-3333" },
]

// Dummy randevu verisi
type Appointment = {
  id: number
  psychologistId: number
  date: Date
  desc: string
}
const initialAppointments: Appointment[] = [
  { id: 1, psychologistId: 101, date: new Date(2024, 3, 10), desc: "Bireysel seans" },
  { id: 2, psychologistId: 102, date: new Date(2024, 3, 11), desc: "Aile danışmanlığı" },
  { id: 3, psychologistId: 101, date: new Date(2024, 3, 12), desc: "Çocuk seansı" },
  { id: 4, psychologistId: 103, date: new Date(2024, 3, 13), desc: "Takip görüşmesi" },
  { id: 5, psychologistId: 102, date: new Date(2024, 3, 14), desc: "Grup Terapisi" },
  { id: 6, psychologistId: 101, date: new Date(2024, 4, 1), desc: "Bireysel seans" },
  { id: 7, psychologistId: 102, date: new Date(2024, 4, 2), desc: "Çift terapisi" },
  { id: 8, psychologistId: 103, date: new Date(2024, 4, 3), desc: "Ergen danışmanlığı" },
  // Yeni eklenen randevular (örnek olarak bugünden sonraki tarihler)
  { id: 9, psychologistId: 101, date: new Date(2025, 7, 28), desc: "Online Terapi" },
  { id: 10, psychologistId: 102, date: new Date(2025, 8, 5), desc: "Yetişkin Danışmanlığı" },
  { id: 11, psychologistId: 103, date: new Date(2025, 7, 30), desc: "Kısa Süreli Çözüm Odaklı Terapi" },
]

// Sabit seans ücreti (örnek olarak)
const SESSION_FEE = 500 // TL

export default function PsychologistsPage() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>(initialPsychologists)
  const [appointments] = useState<Appointment[]>(initialAppointments)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPsychologist, setSelectedPsychologist] = useState<Psychologist | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Form state
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")

  // Tarih aralığı filtresi
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  // Tarih aralığına göre filtrelenmiş randevular
  const filteredAppointmentsByDate = useMemo(() => {
    if (!dateRange?.from) return appointments
    const start = startOfDay(dateRange.from)
    const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)
    return appointments.filter((appt) => isWithinInterval(appt.date, { start, end }))
  }, [appointments, dateRange])

  // Filtreli psikolog listesi (arama terimine göre)
  const filteredPsychologists = useMemo(() => {
    if (!searchTerm) return psychologists
    return psychologists.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [psychologists, searchTerm])

  // Seçili psikoloğun son randevusu (tarih filtresine göre)
  const lastAppointment = useMemo(() => {
    if (!selectedPsychologist) return null
    const psychAppointments = filteredAppointmentsByDate.filter((a) => a.psychologistId === selectedPsychologist.id)
    if (psychAppointments.length === 0) return null
    return psychAppointments.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
  }, [selectedPsychologist, filteredAppointmentsByDate])

  // Seçili psikoloğun bir sonraki randevusu (tarih filtresine göre)
  const nextAppointment = useMemo(() => {
    if (!selectedPsychologist) return null
    const now = new Date()
    const psychAppointments = filteredAppointmentsByDate.filter(
      (a) => a.psychologistId === selectedPsychologist.id && a.date > now,
    )
    if (psychAppointments.length === 0) return null
    return psychAppointments.sort((a, b) => a.date.getTime() - b.date.getTime())[0]
  }, [selectedPsychologist, filteredAppointmentsByDate])

  // Seçili psikoloğun danışanları (tarih filtresine göre)
  const filteredClients = useMemo(() => {
    if (!selectedPsychologist) return []
    const psychAppointments = filteredAppointmentsByDate.filter((a) => a.psychologistId === selectedPsychologist.id)
    // Dummy danışan isimleri (id'den üret)
    const clientNames = psychAppointments.map((appt) => `Danışan #${appt.id}`)
    // Benzersiz danışanlar (id ile)
    const uniqueClients = Array.from(new Set(clientNames))
    return uniqueClients
  }, [selectedPsychologist, filteredAppointmentsByDate])

  // Toplam randevu sayısı ve gelir (tarih filtresine göre)
  const totalAppointmentsCount = useMemo(() => filteredAppointmentsByDate.length, [filteredAppointmentsByDate])
  const totalIncome = useMemo(() => totalAppointmentsCount * SESSION_FEE, [totalAppointmentsCount])

  // Her psikolog için seans sayısı ve gelir (tarih filtresine göre)
  const psychologistStats = useMemo(() => {
    const stats: { [key: number]: { appointmentCount: number; income: number } } = {}
    psychologists.forEach((psych) => {
      const psychAppointments = filteredAppointmentsByDate.filter((appt) => appt.psychologistId === psych.id)
      stats[psych.id] = {
        appointmentCount: psychAppointments.length,
        income: psychAppointments.length * SESSION_FEE,
      }
    })
    return stats
  }, [psychologists, filteredAppointmentsByDate])

  // Modal açıldığında formu doldur
  useEffect(() => {
    if (isEditing && selectedPsychologist) {
      setFormName(selectedPsychologist.name)
      setFormEmail(selectedPsychologist.email)
      setFormPhone(selectedPsychologist.phone)
    } else {
      setFormName("")
      setFormEmail("")
      setFormPhone("")
    }
  }, [isEditing, selectedPsychologist])

  // Ekle/düzenle işlemi
  const handleSave = () => {
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      alert("Lütfen tüm alanları doldurun.")
      return
    }
    if (isEditing && selectedPsychologist) {
      setPsychologists((prev) =>
        prev.map((p) =>
          p.id === selectedPsychologist.id ? { ...p, name: formName, email: formEmail, phone: formPhone } : p,
        ),
      )
      setSelectedPsychologist({ ...selectedPsychologist, name: formName, email: formEmail, phone: formPhone })
    } else {
      setPsychologists((prev) => [...prev, { id: Date.now(), name: formName, email: formEmail, phone: formPhone }])
    }
    setIsAddModalOpen(false)
    setIsEditing(false)
  }

  // Silme işlemi
  const handleDelete = (id: number) => {
    if (window.confirm("Bu psikoloğu silmek istediğinizden emin misiniz?")) {
      setPsychologists((prev) => prev.filter((p) => p.id !== id))
      setSelectedPsychologist(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main className="flex flex-col md:flex-row gap-8 p-6 md:p-8 max-w-7xl mx-auto">
        {/* Sol Panel: Psikolog Listesi */}
        <div className="w-full md:w-80 flex-shrink-0">
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-blue-500/10 dark:shadow-slate-900/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Psikologlar
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  onClick={() => {
                    setIsAddModalOpen(true)
                    setIsEditing(false)
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Arama Kutusu */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Psikolog ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 focus:bg-white dark:focus:bg-slate-700 transition-all duration-300 rounded-xl"
                />
              </div>
              
              <ScrollArea className="h-[400px] md:h-[calc(100vh-300px)]">
                <div className="space-y-2">
                  {filteredPsychologists.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">Psikolog bulunamadı.</p>
                  ) : (
                    filteredPsychologists.map((psych) => (
                      <div
                        key={psych.id}
                        onClick={() => {
                          if (selectedPsychologist?.id === psych.id) {
                            setSelectedPsychologist(null)
                          } else {
                            setSelectedPsychologist(psych)
                          }
                        }}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedPsychologist?.id === psych.id
                            ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/30 shadow-lg'
                            : 'bg-white/40 dark:bg-slate-700/40 hover:bg-white/60 dark:hover:bg-slate-700/60 border border-slate-200/30 dark:border-slate-600/30 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                              {psych.name}
                            </h3>

                          </div>
                          {selectedPsychologist?.id === psych.id && (
                            <CheckIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Panel: Detaylar */}
        <div className="flex-1">
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-blue-500/10 dark:shadow-slate-900/20 h-full">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  {selectedPsychologist ? selectedPsychologist.name : "Genel İstatistikler"}
                </CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 hover:bg-white dark:hover:bg-slate-700 rounded-xl"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange?.from
                        ? dateRange.to
                          ? `${format(dateRange.from, "dd MMM", { locale: tr })} - ${format(dateRange.to, "dd MMM", { locale: tr })}`
                          : format(dateRange.from, "dd MMM yyyy", { locale: tr })
                        : "Tarih Seç"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl" align="end">
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
            </CardHeader>

            <CardContent className="space-y-8">
              {selectedPsychologist ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Sol: Genel Bilgiler */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/60 to-blue-50/60 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-200/30 dark:border-slate-600/30">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        İletişim Bilgileri
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                          <Mail className="h-5 w-5 text-blue-500" />
                          <span>{selectedPsychologist.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                          <Phone className="h-5 w-5 text-green-500" />
                          <span>{selectedPsychologist.phone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsEditing(true)
                            setIsAddModalOpen(true)
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(selectedPsychologist.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </div>

                    {/* Danışanlar */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/60 to-green-50/60 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-200/30 dark:border-slate-600/30">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Danışanlar ({filteredClients.length})
                      </h3>
                      {filteredClients.length === 0 ? (
                        <p className="text-slate-400">Danışan bulunamadı.</p>
                      ) : (
                        <div className="space-y-2">
                          {filteredClients.slice(0, 5).map((client, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              {client}
                            </div>
                          ))}
                          {filteredClients.length > 5 && (
                            <p className="text-xs text-slate-400 mt-2">+{filteredClients.length - 5} daha...</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sağ: Randevular ve İstatistikler */}
                  <div className="space-y-6">
                    {/* İstatistik Kartları */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-200/30 dark:border-blue-800/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Toplam Seans</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {psychologistStats[selectedPsychologist.id]?.appointmentCount || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-200/30 dark:border-green-800/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Toplam Gelir</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {psychologistStats[selectedPsychologist.id]?.income || 0} ₺
                        </p>
                      </div>
                    </div>

                    {/* Randevu Kartları */}
                    <div className="space-y-4">
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-white/60 to-purple-50/60 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-200/30 dark:border-slate-600/30">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Son Randevu</h4>
                        {lastAppointment ? (
                          <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">Tarih:</span> {lastAppointment.date.toLocaleDateString("tr-TR")}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">Açıklama:</span> {lastAppointment.desc}
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">Randevu bulunamadı.</p>
                        )}
                      </div>

                      <div className="p-6 rounded-2xl bg-gradient-to-br from-white/60 to-orange-50/60 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-200/30 dark:border-slate-600/30">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Sonraki Randevu</h4>
                        {nextAppointment ? (
                          <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">Tarih:</span> {nextAppointment.date.toLocaleDateString("tr-TR")}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">Açıklama:</span> {nextAppointment.desc}
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">Sonraki randevu bulunamadı.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-12 py-8">
                  {/* Genel İstatistikler */}
                  <div className="text-center space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        Genel İstatistikler
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400">
                        Tüm psikologların performans özeti
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-600/10 to-indigo-600/10 border-2 border-blue-200/30 dark:border-blue-800/30 shadow-xl backdrop-blur-sm">
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Toplam Randevu</p>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                          {totalAppointmentsCount}
                        </p>
                      </div>
                      
                      <div className="p-8 rounded-3xl bg-gradient-to-br from-green-500/10 via-green-600/10 to-emerald-600/10 border-2 border-green-200/30 dark:border-green-800/30 shadow-xl backdrop-blur-sm">
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Toplam Gelir</p>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                          {totalIncome.toLocaleString()} ₺
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Psikolog Bazında İstatistikler */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        Psikolog Performansı
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        Her psikoloğun detaylı istatistikleri
                      </p>
                    </div>
                    
                    <div className="grid gap-4 max-w-4xl mx-auto">
                      {psychologists.map((psych) => (
                        <div
                          key={psych.id}
                          className="p-6 rounded-2xl bg-gradient-to-r from-white/60 to-slate-50/60 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-200/30 dark:border-slate-600/30 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {psych.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                                  {psych.name}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {psych.email}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-6 text-sm">
                              <div className="text-center">
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                                  {(psychologistStats[psych.id]?.income || 0).toLocaleString()}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">TL</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-400 dark:text-slate-500">
                      Detaylı bilgi için sol panelden bir psikolog seçin
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal */}
        <Dialog
          open={isAddModalOpen}
          onOpenChange={(open) => {
            setIsAddModalOpen(open)
            if (!open) setIsEditing(false)
          }}
        >
          <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 border-0 shadow-2xl rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                {isEditing ? "Psikoloğu Düzenle" : "Yeni Psikolog Ekle"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Ad Soyad
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 focus:bg-white dark:focus:bg-slate-700 rounded-xl"
                  placeholder="Dr. Ahmet Yılmaz"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  E-posta
                </label>
                <Input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 focus:bg-white dark:focus:bg-slate-700 rounded-xl"
                  placeholder="ahmet@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Telefon
                </label>
                <Input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 focus:bg-white dark:focus:bg-slate-700 rounded-xl"
                  placeholder="555-1234"
                />
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 hover:bg-white dark:hover:bg-slate-700 rounded-xl"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formName.trim() || !formEmail.trim() || !formPhone.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl"
              >
                {isEditing ? "Kaydet" : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}