"use client"

import { Header } from "@/components/header"
import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, startOfWeek, addDays } from "date-fns"
import { tr } from "date-fns/locale"
import { UserPlus, Phone, Mail, CalendarCheck, Edit, Trash2, CheckIcon, Search, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

// Tip tanımlamaları
interface Client {
  id: number
  name: string
  phone: string
  email: string
  registration_date: string
  psychologist_id: number | null
  created_at: string
}

interface Psychologist {
  id: number
  name: string
  created_at: string
}


interface Note {
  id: number
  client_id: number
  psychologist_id: number
  date: string
  content: string
  created_at: string
}

export default function ClientManagementPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  // appointments state removed
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false)
  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isEditingClient, setIsEditingClient] = useState(false)

  const [newClientName, setNewClientName] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientPsychologistId, setNewClientPsychologistId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")

  // Verileri Supabase'den yükle
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Danışanları yükle
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (clientsError) throw clientsError
      
      // Psikologları yükle
      const { data: psychologistsData, error: psychologistsError } = await supabase
        .from('psychologists')
        .select('*')
        .order('name')
      
      if (psychologistsError) throw psychologistsError
      
      // appointments fetch removed
      
      // Notları yükle
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .order('date', { ascending: false })
      
      if (notesError) throw notesError

      setClients(clientsData || [])
      setPsychologists(psychologistsData || [])
      // setAppointments removed
      setNotes(notesData || [])
    } catch (error) {
      let errorMsg = ''
      if (error && typeof error === 'object') {
        if ('message' in error && typeof (error as any).message === 'string') {
          errorMsg = (error as any).message
        } else {
          try {
            errorMsg = JSON.stringify(error)
          } catch {
            errorMsg = String(error)
          }
        }
      } else {
        errorMsg = String(error)
      }
      toast.error('Veri yüklenirken hata oluştu!', {
        description: errorMsg,
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrelenmiş danışan listesi
  const filteredClients = useMemo(() => {
    if (!searchTerm) {
      return clients
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return clients.filter((client) => client.name.toLowerCase().includes(lowerCaseSearchTerm))
  }, [clients, searchTerm])

  // lastAppointment removed

  // Seçili danışanın son notunu bul
  const lastNote = useMemo(() => {
    if (!selectedClient) return null
    const clientNotes = notes.filter((note) => note.client_id === selectedClient.id)
    if (clientNotes.length === 0) return null
    return clientNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }, [selectedClient, notes])

  // Add/Edit modal açıldığında form alanlarını doldur
  useEffect(() => {
    if (isEditingClient && selectedClient) {
      setNewClientName(selectedClient.name)
      setNewClientPhone(selectedClient.phone)
      setNewClientEmail(selectedClient.email)
      setNewClientPsychologistId(selectedClient.psychologist_id?.toString() || "none")
    } else {
      setNewClientName("")
      setNewClientPhone("")
      setNewClientEmail("")
      setNewClientPsychologistId("none")
    }
  }, [isEditingClient, selectedClient])

  const handleSaveClient = async () => {
    if (!newClientName.trim() || !newClientPhone.trim() || !newClientEmail.trim()) {
      toast.error("Eksik Alan!", {
        description: "Lütfen tüm alanları doldurun.",
        duration: 3000,
      })
      return
    }

    const psychologistIdToSave = newClientPsychologistId && newClientPsychologistId !== "none" ? Number(newClientPsychologistId) : null

    try {
      if (isEditingClient && selectedClient) {
        // Danışanı güncelle
        const { error } = await supabase
          .from('clients')
          .update({
            name: newClientName,
            phone: newClientPhone,
            email: newClientEmail,
            psychologist_id: psychologistIdToSave,
          })
          .eq('id', selectedClient.id)

        if (error) throw error

        // State'i güncelle
        setClients(prevClients =>
          prevClients.map(client =>
            client.id === selectedClient.id
              ? { ...client, name: newClientName, phone: newClientPhone, email: newClientEmail, psychologist_id: psychologistIdToSave }
              : client
          )
        )

        setSelectedClient({
          ...selectedClient,
          name: newClientName,
          phone: newClientPhone,
          email: newClientEmail,
          psychologist_id: psychologistIdToSave,
        })
      } else {
        // Yeni danışan ekle
        const { data, error } = await supabase
          .from('clients')
          .insert({
            name: newClientName,
            phone: newClientPhone,
            email: newClientEmail,
            psychologist_id: psychologistIdToSave,
            registration_date: new Date().toISOString(),
          })
          .select()

        if (error) throw error

        // State'e yeni danışanı ekle
        if (data && data[0]) {
          setClients(prevClients => [data[0], ...prevClients])
        }
      }

      setIsAddClientModalOpen(false)
      setIsEditingClient(false)
    } catch (error) {
      toast.error('Danışan kaydedilirken hata oluştu!', {
        description: (error as any)?.message || String(error),
        duration: 4000,
      })
    }
  }

  const handleDeleteClient = async (clientId: number) => {
    if (window.confirm("Bu danışanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', clientId)

        if (error) throw error

        setClients(prevClients => prevClients.filter(client => client.id !== clientId))
        setIsClientDetailModalOpen(false)
        setSelectedClient(null)
      } catch (error) {
        toast.error('Danışan silinirken hata oluştu!', {
          description: (error as any)?.message || String(error),
          duration: 4000,
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
          </div>
        </main>
      </div>
    )
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
                          {client.psychologist_id
                            ? psychologists.find((p) => p.id === client.psychologist_id)?.name
                            : "Psikolog Atanmadı"}
                        </div>
                        {/* Son randevu bilgisi kaldırıldı */}
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
                      <b>Kayıt Tarihi:</b> {format(new Date(selectedClient.registration_date), "dd MMMM yyyy", { locale: tr })}
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
                      {selectedClient.psychologist_id
                        ? psychologists.find((p) => p.id === selectedClient.psychologist_id)?.name
                        : "Atanmadı"}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        setIsEditingClient(true)
                        setIsAddClientModalOpen(true)
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
                  {/* Son Randevu bölümü kaldırıldı */}

                  {/* Son Not */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Son Not</h3>
                    {lastNote ? (
                      <Card className="dark:bg-gray-700 dark:border-gray-600 shadow-sm rounded-lg">
                        <CardContent className="p-4 text-sm text-gray-700 dark:text-gray-200">
                          <p>
                            <b>Tarih:</b> {format(new Date(lastNote.date), "dd MMMM yyyy EEEE", { locale: tr })}
                          </p>
                          <p>
                            <b>Psikolog:</b> {psychologists.find((p) => p.id === lastNote.psychologist_id)?.name}
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
                    <SelectItem value="none">Psikolog Atama</SelectItem>
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
