"use client"

import { Header } from "@/components/header"
import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Select bileşeni eklendi
import { format, startOfWeek, addDays } from "date-fns"
import { tr } from "date-fns/locale"
import { UserPlus, Phone, Mail, CalendarCheck, Edit, Trash2, CheckIcon, Search, User } from "lucide-react" // User ikonu eklendi

// Dummy danışan verisi (ek bilgiler ve psychologistId ile)
const initialClients = [
  {
    id: 1,
    name: "Ayşe Yılmaz",
    phone: "555-1234",
    email: "ayse@example.com",
    registrationDate: new Date(2023, 0, 15),
    psychologistId: 101, // Atanmış psikolog
  },
  {
    id: 2,
    name: "Mehmet Demir",
    phone: "555-5678",
    email: "mehmet@example.com",
    registrationDate: new Date(2023, 2, 1),
    psychologistId: 102, // Atanmış psikolog
  },
  {
    id: 3,
    name: "Zeynep Kaya",
    phone: "555-9012",
    email: "zeynep@example.com",
    registrationDate: new Date(2023, 4, 10),
    psychologistId: null, // Atanmamış psikolog
  },
  {
    id: 4,
    name: "Ali Can",
    phone: "555-1122",
    email: "ali@example.com",
    registrationDate: new Date(2024, 1, 20),
    psychologistId: 103,
  },
  {
    id: 5,
    name: "Elif Su",
    phone: "555-3344",
    email: "elif@example.com",
    registrationDate: new Date(2024, 3, 5),
    psychologistId: null,
  },
]

// Dummy psikolog verisi (mevcut projeden)
const initialPsychologists = [
  { id: 101, name: "Dr. Elif Yılmaz" },
  { id: 102, name: "Uzm. Psk. Can Demir" },
  { id: 103, name: "Psk. Zeynep Akın" },
]

// Dummy randevu verisi (mevcut projeden, güncel tarihlerle)
const today = new Date()
const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })

const initialAppointments = [
  {
    id: 1,
    clientId: 1,
    psychologistId: 101,
    date: addDays(startOfCurrentWeek, 0), // Pazartesi
    hour: 12,
    minute: 0,
    duration: 60,
    desc: "Bireysel seans",
  },
  {
    id: 2,
    clientId: 2,
    psychologistId: 102,
    date: addDays(startOfCurrentWeek, 2), // Çarşamba
    hour: 14,
    minute: 30,
    duration: 90,
    desc: "Aile danışmanlığı",
  },
  {
    id: 3,
    clientId: 1,
    psychologistId: 101,
    date: addDays(startOfCurrentWeek, 4), // Cuma
    hour: 11,
    minute: 0,
    duration: 60,
    desc: "Çocuk seansı",
  },
  {
    id: 4,
    clientId: 4,
    psychologistId: 103,
    date: addDays(startOfCurrentWeek, 1), // Salı
    hour: 16,
    minute: 0,
    duration: 60,
    desc: "Yeni danışan ilk görüşme",
  },
  {
    id: 5,
    clientId: 2,
    psychologistId: 102,
    date: addDays(startOfCurrentWeek, 0), // Pazartesi
    hour: 10,
    minute: 0,
    duration: 60,
    desc: "Grup Terapisi",
  },
  {
    id: 6,
    clientId: 5,
    psychologistId: 103,
    date: addDays(startOfCurrentWeek, 4), // Cuma
    hour: 10,
    minute: 15,
    duration: 60,
    desc: "Bireysel Danışmanlık",
  },
]

// Dummy not verisi (mevcut projeden, güncel tarihlerle)
const initialNotes = [
  {
    id: 1,
    clientId: 1,
    psychologistId: 101,
    date: addDays(startOfCurrentWeek, 0), // Pazartesi
    content:
      "İlk seans notları: Danışan oldukça gergin, uyum sorunları yaşıyor. Gelecek seans için hedefler belirlendi.",
  },
  {
    id: 2,
    clientId: 2,
    psychologistId: 102,
    date: addDays(startOfCurrentWeek, 2), // Çarşamba
    content:
      "Aile danışmanlığı seansı. İletişim problemleri üzerinde duruldu. Çiftin birbirini dinlemesi teşvik edildi.",
  },
  {
    id: 3,
    clientId: 1,
    psychologistId: 101,
    date: addDays(startOfCurrentWeek, 0), // Pazartesi (aynı danışan, aynı gün, farklı not)
    content: "Ek not: Danışanın ev ödevlerini tamamladığı görüldü. İlerleme kaydediliyor.",
  },
  {
    id: 4,
    clientId: 4,
    psychologistId: 103,
    date: addDays(startOfCurrentWeek, 1), // Salı
    content: "Yeni danışan Ali Can için ilk not. Oldukça çekingen, güven ilişkisi kurmak önemli.",
  },
  {
    id: 5,
    clientId: 2,
    psychologistId: 102,
    date: addDays(startOfCurrentWeek, 0), // Pazartesi
    content: "Grup terapisi notları: Katılımcıların etkileşimi olumlu. Yeni üyeler gruba adapte oluyor.",
  },
  {
    id: 6,
    clientId: 5,
    psychologistId: 103,
    date: addDays(startOfCurrentWeek, 4), // Cuma
    content: "Elif Su ile ilk görüşme notları. Motivasyonu yüksek, hedeflerini netleştirdik.",
  },
]

export default function ClientManagementPage() {
  const [clients, setClients] = useState(initialClients)
  const [psychologists] = useState(initialPsychologists) // Psikologlar sabit kalsın
  const [appointments] = useState(initialAppointments) // Randevular sabit kalsın
  const [notes] = useState(initialNotes) // Notlar sabit kalsın

  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)
  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<(typeof initialClients)[0] | null>(null)
  const [isEditingClient, setIsEditingClient] = useState(false)

  const [newClientName, setNewClientName] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientPsychologistId, setNewClientPsychologistId] = useState<string>("") // Yeni: Psikolog ID state'i
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrelenmiş danışan listesi (arama terimine göre)
  const filteredClients = useMemo(() => {
    if (!searchTerm) {
      return clients
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return clients.filter((client) => client.name.toLowerCase().includes(lowerCaseSearchTerm))
  }, [clients, searchTerm])

  // Seçili danışanın son randevusunu bul
  const lastAppointment = useMemo(() => {
    if (!selectedClient) return null
    const clientAppointments = appointments.filter((appt) => appt.clientId === selectedClient.id)
    if (clientAppointments.length === 0) return null
    return clientAppointments.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
  }, [selectedClient, appointments])

  // Seçili danışanın son notunu bul
  const lastNote = useMemo(() => {
    if (!selectedClient) return null
    const clientNotes = notes.filter((note) => note.clientId === selectedClient.id)
    if (clientNotes.length === 0) return null
    return clientNotes.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
  }, [selectedClient, notes])

  // Add/Edit modal açıldığında veya selectedClient değiştiğinde form alanlarını doldur
  useEffect(() => {
    if (isEditingClient && selectedClient) {
      setNewClientName(selectedClient.name)
      setNewClientPhone(selectedClient.phone)
      setNewClientEmail(selectedClient.email)
      setNewClientPsychologistId(selectedClient.psychologistId?.toString() || "") // Psikolog ID'yi doldur
    } else {
      setNewClientName("")
      setNewClientPhone("")
      setNewClientEmail("")
      setNewClientPsychologistId("") // Sıfırla
    }
  }, [isEditingClient, selectedClient])

  const handleSaveClient = () => {
    if (!newClientName.trim() || !newClientPhone.trim() || !newClientEmail.trim()) {
      alert("Lütfen tüm alanları doldurun.")
      return
    }

    const psychologistIdToSave = newClientPsychologistId ? Number(newClientPsychologistId) : null

    if (isEditingClient && selectedClient) {
      // Danışanı düzenle
      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === selectedClient.id
            ? {
                ...client,
                name: newClientName,
                phone: newClientPhone,
                email: newClientEmail,
                psychologistId: psychologistIdToSave, // Psikolog ID'yi kaydet
              }
            : client,
        ),
      )
      setSelectedClient({
        ...selectedClient,
        name: newClientName,
        phone: newClientPhone,
        email: newClientEmail,
        psychologistId: psychologistIdToSave, // Detay modalını güncelle
      })
    } else {
      // Yeni danışan ekle
      setClients((prevClients) => [
        ...prevClients,
        {
          id: Date.now(), // Basit bir ID ataması
          name: newClientName,
          phone: newClientPhone,
          email: newClientEmail,
          registrationDate: new Date(),
          psychologistId: psychologistIdToSave, // Psikolog ID'yi kaydet
        },
      ])
    }
    setIsAddClientModalOpen(false)
    setIsEditingClient(false)
  }

  const handleDeleteClient = (clientId: number) => {
    if (window.confirm("Bu danışanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      setClients((prevClients) => prevClients.filter((client) => client.id !== clientId))
      setIsClientDetailModalOpen(false) // Detay modalını kapat
      setSelectedClient(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col md:flex-row items-start justify-start p-4 md:p-8 gap-6">
        {/* Sol Panel: Danışan Listesi */}
        <Card className="w-full md:w-1/4 flex-shrink-0 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Danışanlar</CardTitle>
            <Button
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-md transition-colors flex items-center gap-1 text-sm"
              onClick={() => {
                setIsAddClientModalOpen(true)
                setIsEditingClient(false)
              }}
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
                placeholder="Danışan ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <ScrollArea className="h-[300px] md:h-[calc(100vh-330px)]">
              <nav className="grid gap-1 p-2">
                {filteredClients.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">Danışan bulunamadı.</p>
                ) : (
                  filteredClients.map((client) => (
                    <Button
                      key={client.id}
                      variant={selectedClient?.id === client.id ? "secondary" : "ghost"}
                      className="justify-start text-left px-3 py-2 rounded-lg dark:hover:bg-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:hover:text-gray-100 h-auto"
                      onClick={() => {
                        setSelectedClient(client)
                        setIsClientDetailModalOpen(true)
                      }}
                    >
                      <div className="flex flex-col items-start w-full">
                        <span className="flex-grow font-semibold text-base">{client.name}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Phone className="h-3 w-3" /> {client.phone}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 truncate w-full">
                          <Mail className="h-3 w-3" /> {client.email}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <User className="h-3 w-3" />{" "}
                          {client.psychologistId
                            ? psychologists.find((p) => p.id === client.psychologistId)?.name
                            : "Psikolog Atanmadı"}
                        </div>
                        {appointments.filter((appt) => appt.clientId === client.id).length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <CalendarCheck className="h-3 w-3" /> Son Randevu:{" "}
                            {format(
                              appointments
                                .filter((appt) => appt.clientId === client.id)
                                .sort((a, b) => b.date.getTime() - a.date.getTime())[0].date,
                              "dd MMM yyyy",
                              { locale: tr },
                            )}
                          </div>
                        )}
                      </div>
                      {selectedClient?.id === client.id && <CheckIcon className="ml-2 h-4 w-4" />}
                    </Button>
                  ))
                )}
              </nav>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sağ Panel: Danışan Detayları */}
        <Card className="flex-grow w-full dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {selectedClient ? `${selectedClient.name} Detayları` : "Danışan Seçiniz"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100vh-280px)] overflow-y-auto">
            {selectedClient ? (
              <div className="grid md:grid-cols-2 gap-6 py-4">
                {/* Sol Taraf: Genel Bilgiler */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Genel Bilgiler</h3>
                  <div className="space-y-2 text-gray-700 dark:text-gray-200">
                    <p className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-blue-500" />
                      <b>Kayıt Tarihi:</b> {format(selectedClient.registrationDate, "dd MMMM yyyy", { locale: tr })}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-blue-500" />
                      <b>Telefon:</b> {selectedClient.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <b>E-posta:</b> {selectedClient.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      <b>Atanan Psikolog:</b>{" "}
                      {selectedClient.psychologistId
                        ? psychologists.find((p) => p.id === selectedClient.psychologistId)?.name
                        : "Atanmadı"}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        setIsEditingClient(true)
                        setIsAddClientModalOpen(true)
                        // Detay modalını kapatmaya gerek yok, yeni modal açılacak
                      }}
                      className="dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" /> Düzenle
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClient(selectedClient.id)}
                      className="rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Sil
                    </Button>
                  </div>
                </div>

                {/* Sağ Taraf: Randevular ve Notlar */}
                <div className="space-y-6">
                  {/* Son Randevu */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Son Randevu</h3>
                    {lastAppointment ? (
                      <Card className="dark:bg-gray-700 dark:border-gray-600 shadow-sm rounded-lg">
                        <CardContent className="p-4 text-sm text-gray-700 dark:text-gray-200">
                          <p>
                            <b>Tarih:</b> {format(lastAppointment.date, "dd MMMM yyyy EEEE", { locale: tr })}
                          </p>
                          <p>
                            <b>Saat:</b> {lastAppointment.hour}:{lastAppointment.minute.toString().padStart(2, "0")}
                          </p>
                          <p>
                            <b>Psikolog:</b>{" "}
                            {initialPsychologists.find((p) => p.id === lastAppointment.psychologistId)?.name}
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

                  {/* Son Not */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Son Not</h3>
                    {lastNote ? (
                      <Card className="dark:bg-gray-700 dark:border-gray-600 shadow-sm rounded-lg">
                        <CardContent className="p-4 text-sm text-gray-700 dark:text-gray-200">
                          <p>
                            <b>Tarih:</b> {format(lastNote.date, "dd MMMM yyyy EEEE", { locale: tr })}
                          </p>
                          <p>
                            <b>Psikolog:</b> {initialPsychologists.find((p) => p.id === lastNote.psychologistId)?.name}
                          </p>
                          <p className="whitespace-pre-wrap">{lastNote.content}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">Not bulunamadı.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Detaylarını görmek için sol panelden bir danışan seçin.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Yeni Danışan Ekle/Düzenle Modalı */}
        <Dialog
          open={isAddClientModalOpen}
          onOpenChange={(open) => {
            setIsAddClientModalOpen(open)
            if (!open) setIsEditingClient(false)
          }}
        >
          <DialogContent className="dark:bg-gray-800 rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">
                {isEditingClient ? "Danışanı Düzenle" : "Yeni Danışan Ekle"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Ad Soyad
                </label>
                <Input
                  id="name"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phone" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Telefon
                </label>
                <Input
                  id="phone"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
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
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="psychologist" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Atanan Psikolog
                </label>
                <Select value={newClientPsychologistId} onValueChange={setNewClientPsychologistId}>
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Psikolog seç (isteğe bağlı)" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    <SelectItem value="none">Psikolog Atama</SelectItem> {/* Boş seçenek */}
                    {psychologists.map((psychologist) => (
                      <SelectItem key={psychologist.id} value={psychologist.id.toString()}>
                        {psychologist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddClientModalOpen(false)}
                className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                İptal
              </Button>
              <Button
                onClick={handleSaveClient}
                className="dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg"
                disabled={!newClientName.trim() || !newClientPhone.trim() || !newClientEmail.trim()}
              >
                {isEditingClient ? "Kaydet" : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
