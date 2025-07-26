"use client"

import { Header } from "@/components/header"
import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, Trash2, UserPlus, User, CalendarCheck, CheckIcon, Search, Users, CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { tr } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

// Dummy psikolog verisi
type Psychologist = {
  id: number;
  name: string;
  email: string;
  phone: string;
};

const initialPsychologists: Psychologist[] = [
  { id: 101, name: "Dr. Elif Yılmaz", email: "elif.yilmaz@example.com", phone: "555-1111" },
  { id: 102, name: "Uzm. Psk. Can Demir", email: "can.demir@example.com", phone: "555-2222" },
  { id: 103, name: "Psk. Zeynep Akın", email: "zeynep.akin@example.com", phone: "555-3333" },
]

// Dummy randevu verisi
type Appointment = {
  id: number;
  psychologistId: number;
  date: Date;
  desc: string;
};
const initialAppointments: Appointment[] = [
  { id: 1, psychologistId: 101, date: new Date(2024, 3, 10), desc: "Bireysel seans" },
  { id: 2, psychologistId: 102, date: new Date(2024, 3, 11), desc: "Aile danışmanlığı" },
  { id: 3, psychologistId: 101, date: new Date(2024, 3, 12), desc: "Çocuk seansı" },
  { id: 4, psychologistId: 103, date: new Date(2024, 3, 13), desc: "Takip görüşmesi" },
  { id: 5, psychologistId: 102, date: new Date(2024, 3, 14), desc: "Grup Terapisi" },
]

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

  // Filtreli psikolog listesi
  const filteredPsychologists = useMemo(() => {
    if (!searchTerm) return psychologists
    return psychologists.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [psychologists, searchTerm])

  // Tarih aralığı filtresi
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  // Seçili psikoloğun son randevusu
  const lastAppointment = useMemo(() => {
    if (!selectedPsychologist) return null
    const psychAppointments = appointments.filter((a) => a.psychologistId === selectedPsychologist.id)
    if (psychAppointments.length === 0) return null
    return psychAppointments.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
  }, [selectedPsychologist, appointments])

  // Seçili psikoloğun danışanları (tarih filtresiyle)
  const filteredClients = useMemo(() => {
    if (!selectedPsychologist) return []
    let psychAppointments = appointments.filter((a) => a.psychologistId === selectedPsychologist.id)
    if (dateRange?.from) {
      const start = startOfDay(dateRange.from)
      const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)
      psychAppointments = psychAppointments.filter((appt) => isWithinInterval(appt.date, { start, end }))
    }
    // Dummy danışan isimleri (id'den üret)
    const clientNames = psychAppointments.map((appt) => `Danışan #${appt.id}`)
    // Benzersiz danışanlar (id ile)
    const uniqueClients = Array.from(new Set(clientNames))
    return uniqueClients
  }, [selectedPsychologist, appointments, dateRange])

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
      setPsychologists((prev) => prev.map((p) => p.id === selectedPsychologist.id ? { ...p, name: formName, email: formEmail, phone: formPhone } : p))
      setSelectedPsychologist({ ...selectedPsychologist, name: formName, email: formEmail, phone: formPhone })
    } else {
      setPsychologists((prev) => [
        ...prev,
        { id: Date.now(), name: formName, email: formEmail, phone: formPhone },
      ])
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
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col md:flex-row items-start justify-start p-4 md:p-8 gap-6">
        {/* Sol Panel: Psikolog Listesi */}
        <Card className="w-full md:w-1/4 flex-shrink-0 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Psikologlar</CardTitle>
            <Button
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-md transition-colors flex items-center gap-1 text-sm"
              onClick={() => { setIsAddModalOpen(true); setIsEditing(false) }}
            >
              <UserPlus className="h-4 w-4" /> Ekle
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {/* Arama Kutusu */}
            <div className="relative p-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Psikolog ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <ScrollArea className="h-[300px] md:h-[calc(100vh-330px)]">
              <nav className="grid gap-1 p-2">
                {filteredPsychologists.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">Psikolog bulunamadı.</p>
                ) : (
                  filteredPsychologists.map((psych) => (
                    <Button
                      key={psych.id}
                      variant={selectedPsychologist?.id === psych.id ? "secondary" : "ghost"}
                      className="justify-start text-left px-3 py-2 rounded-lg dark:hover:bg-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:hover:text-gray-100 h-auto"
                      onClick={() => {
                        if (selectedPsychologist?.id === psych.id) {
                          setSelectedPsychologist(null)
                        } else {
                          setSelectedPsychologist(psych)
                        }
                      }}
                    >
                      <div className="flex flex-col items-start w-full">
                        <span className="flex-grow font-semibold text-base">{psych.name}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <User className="h-3 w-3" /> {psych.email}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <User className="h-3 w-3" /> {psych.phone}
                        </div>
                      </div>
                      {selectedPsychologist?.id === psych.id && <CheckIcon className="ml-2 h-4 w-4" />}
                    </Button>
                  ))
                )}
              </nav>
            </ScrollArea>
          </CardContent>
        </Card>
        {/* Sağ Panel: Psikolog Detayları */}
        <Card className="flex-grow w-full dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {selectedPsychologist ? `${selectedPsychologist.name} Detayları` : "Psikolog Seçiniz"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100vh-280px)] overflow-y-auto">
            {selectedPsychologist ? (
              <div className="grid md:grid-cols-2 gap-6 py-4">
                {/* Sol: Genel Bilgiler */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Genel Bilgiler</h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-200">
                    <p className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      <b>Email:</b> {selectedPsychologist.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      <b>Telefon:</b> {selectedPsychologist.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-500" />
                      <b>Toplam Danışan:</b> {filteredClients.length}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => { setIsEditing(true); setIsAddModalOpen(true) }}
                      className="dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" /> Düzenle
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(selectedPsychologist.id)}
                      className="rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Sil
                    </Button>
                  </div>
                </div>
                {/* Sağ: Son Randevu ve Danışanlar */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Son Randevu</h3>
                    {lastAppointment ? (
                      <Card className="dark:bg-gray-700 dark:border-gray-600 shadow-sm rounded-lg">
                        <CardContent className="p-4 text-sm text-gray-700 dark:text-gray-200">
                          <p>
                            <b>Tarih:</b> {lastAppointment.date.toLocaleDateString("tr-TR")}
                          </p>
                          <p>
                            <b>Açıklama:</b> {lastAppointment.desc}
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">Randevu bulunamadı.</p>
                    )}
                  </div>
                  {/* Danışanlar ve Tarih Filtresi */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Danışanlar</h3>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-8 px-2 text-xs dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {dateRange?.from
                              ? dateRange.to
                                ? `${format(dateRange.from, "dd MMM yyyy", { locale: tr })} - ${format(dateRange.to, "dd MMM yyyy", { locale: tr })}`
                                : format(dateRange.from, "dd MMM yyyy", { locale: tr })
                              : "Tarih Filtresi"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-lg" align="end">
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
                    {filteredClients.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">Danışan bulunamadı.</p>
                    ) : (
                      <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200 text-sm">
                        {filteredClients.map((client, idx) => (
                          <li key={idx}>{client}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Detayları görmek için sol panelden bir psikolog seçin.
              </p>
            )}
          </CardContent>
        </Card>
        {/* Ekle/Düzenle Modalı */}
        <Dialog
          open={isAddModalOpen}
          onOpenChange={(open) => {
            setIsAddModalOpen(open)
            if (!open) setIsEditing(false)
          }}
        >
          <DialogContent className="dark:bg-gray-800 rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">
                {isEditing ? "Psikoloğu Düzenle" : "Yeni Psikolog Ekle"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Ad Soyad
                </label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  E-posta
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phone" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Telefon
                </label>
                <Input
                  id="phone"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg"
                disabled={!formName.trim() || !formEmail.trim() || !formPhone.trim()}
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