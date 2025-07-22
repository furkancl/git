"use client"

import { Header } from "@/components/header"
import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format, startOfWeek, addDays, isWithinInterval } from "date-fns"
import { tr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckIcon, CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

// Dummy danışan verisi
const initialClients = [
  { id: 1, name: "Ayşe Yılmaz" },
  { id: 2, name: "Mehmet Demir" },
  { id: 3, name: "Zeynep Kaya" },
]

// Dummy psikolog verisi
const initialPsychologists = [
  { id: 101, name: "Dr. Elif Yılmaz" },
  { id: 102, name: "Uzm. Psk. Can Demir" },
  { id: 103, name: "Psk. Zeynep Akın" },
]

// Dummy not verisi
const today = new Date()
const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Haftanın başlangıcı Pazartesi (1)

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
    clientId: 3,
    psychologistId: 103,
    date: addDays(startOfCurrentWeek, 4), // Cuma
    content: "Çocuk seansı. Oyun terapisi ile ilerleme kaydedildi. Aile ile geri bildirim paylaşıldı.",
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
    clientId: 1,
    psychologistId: 101,
    date: addDays(startOfCurrentWeek, 1), // Salı
    content:
      "Takip seansı: Danışanın kaygı seviyesinde düşüş gözlemlendi. Yeni başa çıkma stratejileri üzerinde duruldu.",
  },
  {
    id: 7,
    clientId: 1,
    psychologistId: 101,
    date: addDays(startOfCurrentWeek, 3), // Perşembe
    content: "Online seans: Danışan evden katıldı. Ortamın rahatlatıcı etkisi oldu. İleriye dönük planlar yapıldı.",
  },
]

const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

export default function RandevuNotlariPage() {
  const [clients] = useState(initialClients)
  const [psychologists] = useState(initialPsychologists)
  const [notes, setNotes] = useState(initialNotes)

  const [selectedPsychologistFilter, setSelectedPsychologistFilter] = useState<string>("all")
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateRange | undefined>(undefined) // DateRange tipini kullanıyoruz
  const [selectedClient, setSelectedClient] = useState<(typeof initialClients)[0] | null>(null)

  const [isAddOrEditNoteModalOpen, setIsAddOrEditNoteModalOpen] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null)

  const [newNoteClientId, setNewNoteClientId] = useState<string>("")
  const [newNotePsychologistId, setNewNotePsychologistId] = useState<string>("")
  const [newNoteDate, setNewNoteDate] = useState<Date | undefined>(undefined)
  const [newNoteContent, setNewNoteContent] = useState("")

  const currentWeekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    return days.map((_, i) => addDays(start, i))
  }, [])

  // Psikolog filtresine göre danışanları filtrele
  const filteredClients = useMemo(() => {
    if (selectedPsychologistFilter === "all") {
      return clients
    }
    const clientsWithNotesForPsychologist = new Set(
      notes
        .filter((note) => note.psychologistId.toString() === selectedPsychologistFilter)
        .map((note) => note.clientId),
    )
    return clients.filter((client) => clientsWithNotesForPsychologist.has(client.id))
  }, [clients, notes, selectedPsychologistFilter])

  // Seçili danışanın notlarını filtrele ve kronolojik sırala (en yeni en üstte)
  // Veya danışan seçili değilse, psikolog ve tarih filtresine göre tüm notları sırala
  const filteredAndSortedNotes = useMemo(() => {
    let notesToDisplay = notes

    // Psikolog filtresi uygula
    if (selectedPsychologistFilter !== "all") {
      notesToDisplay = notesToDisplay.filter((note) => note.psychologistId.toString() === selectedPsychologistFilter)
    }

    // Tarih aralığı filtresi uygula
    if (selectedDateFilter?.from) {
      // Eğer sadece 'from' seçiliyse, 'to' tarihini 'from' tarihi olarak kabul et
      const endDate = selectedDateFilter.to || selectedDateFilter.from
      notesToDisplay = notesToDisplay.filter((note) =>
        isWithinInterval(note.date, { start: selectedDateFilter.from!, end: endDate }),
      )
    }

    // Danışan seçiliyse, sadece o danışanın notlarını göster
    if (selectedClient) {
      notesToDisplay = notesToDisplay.filter((note) => note.clientId === selectedClient.id)
    }

    // Kronolojik sırala (en yeni en üstte)
    return notesToDisplay.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [notes, selectedClient, selectedPsychologistFilter, selectedDateFilter])

  // Düzenleme modunda modalı doldur
  useEffect(() => {
    if (isEditingNote && currentNoteId !== null) {
      const noteToEdit = notes.find((note) => note.id === currentNoteId)
      if (noteToEdit) {
        setNewNoteClientId(noteToEdit.clientId.toString())
        setNewNotePsychologistId(noteToEdit.psychologistId.toString())
        setNewNoteDate(noteToEdit.date)
        setNewNoteContent(noteToEdit.content)
      }
    } else {
      // Modal kapandığında veya ekleme moduna geçildiğinde formu sıfırla
      setNewNoteClientId(selectedClient ? selectedClient.id.toString() : "")
      setNewNotePsychologistId(selectedPsychologistFilter !== "all" ? selectedPsychologistFilter : "")
      setNewNoteDate(new Date()) // Varsayılan olarak bugünün tarihi
      setNewNoteContent("")
    }
  }, [isEditingNote, currentNoteId, notes, selectedClient, selectedPsychologistFilter])

  const handleSaveNote = () => {
    if (!newNoteClientId || !newNotePsychologistId || !newNoteDate || newNoteContent.trim().length === 0) {
      alert("Lütfen tüm alanları doldurun.")
      return
    }

    if (isEditingNote && currentNoteId !== null) {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === currentNoteId
            ? {
                ...note,
                clientId: Number(newNoteClientId),
                psychologistId: Number(newNotePsychologistId),
                date: newNoteDate,
                content: newNoteContent,
              }
            : note,
        ),
      )
    } else {
      setNotes((prevNotes) => [
        ...prevNotes,
        {
          id: Date.now(),
          clientId: Number(newNoteClientId),
          psychologistId: Number(newNotePsychologistId),
          date: newNoteDate,
          content: newNoteContent,
        },
      ])
    }
    setIsAddOrEditNoteModalOpen(false)
    setIsEditingNote(false)
    setCurrentNoteId(null)
  }

  const handleDeleteNote = (id: number) => {
    if (window.confirm("Bu notu silmek istediğinizden emin misiniz?")) {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id))
      setIsAddOrEditNoteModalOpen(false)
      setIsEditingNote(false)
      setCurrentNoteId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col md:flex-row items-start justify-start p-4 md:p-8 gap-6">
        {/* Sol Panel: Danışan Listesi ve Filtreler */}
        <Card className="w-full md:w-1/4 flex-shrink-0 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Danışanlar</CardTitle>
            <div className="mt-4">
              <label htmlFor="filter-psychologist" className="sr-only">
                Psikolog Filtresi
              </label>
              <Select value={selectedPsychologistFilter} onValueChange={setSelectedPsychologistFilter}>
                <SelectTrigger
                  id="filter-psychologist"
                  className="w-full dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg"
                >
                  <SelectValue placeholder="Psikolog Filtrele" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                  <SelectItem value="all">Tüm Psikologlar</SelectItem>
                  {psychologists.map((psychologist) => (
                    <SelectItem key={psychologist.id} value={psychologist.id.toString()}>
                      {psychologist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* ScrollArea yüksekliği küçük ekranlarda sabit, büyük ekranlarda dinamik */}
            <ScrollArea className="h-[300px] md:h-[calc(100vh-280px)]">
              <nav className="grid gap-1 p-2">
                {filteredClients.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">Danışan bulunamadı.</p>
                ) : (
                  filteredClients.map((client) => (
                    <Button
                      key={client.id}
                      variant={selectedClient?.id === client.id ? "secondary" : "ghost"}
                      className="justify-start text-left px-3 py-2 rounded-lg dark:hover:bg-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:hover:text-gray-100"
                      onClick={() => setSelectedClient(selectedClient?.id === client.id ? null : client)}
                    >
                      <span className="flex-grow">{client.name}</span>
                      {selectedClient?.id === client.id && <CheckIcon className="ml-2 h-4 w-4" />}
                    </Button>
                  ))
                )}
              </nav>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sağ Panel: Danışan Notları */}
        <Card className="flex-grow w-full dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">
              {selectedClient
                ? `${selectedClient.name} Notları`
                : selectedPsychologistFilter !== "all"
                  ? `${psychologists.find((p) => p.id.toString() === selectedPsychologistFilter)?.name} Notları`
                  : "Tüm Notlar"}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              {/* Tarih Aralığı Filtresi */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg",
                      !selectedDateFilter?.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDateFilter?.from ? (
                      selectedDateFilter.to ? (
                        <>
                          {format(selectedDateFilter.from, "dd MMM yyyy", { locale: tr })} -{" "}
                          {format(selectedDateFilter.to, "dd MMM yyyy", { locale: tr })}
                        </>
                      ) : (
                        format(selectedDateFilter.from, "dd MMM yyyy", { locale: tr })
                      )
                    ) : (
                      <span>Tarih Aralığı Seç</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={selectedDateFilter?.from}
                    selected={selectedDateFilter}
                    onSelect={setSelectedDateFilter}
                    numberOfMonths={2}
                    locale={tr}
                  />
                </PopoverContent>
              </Popover>

              <Button
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors"
                onClick={() => {
                  setIsAddOrEditNoteModalOpen(true)
                  setIsEditingNote(false)
                }}
              >
                + Not Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAndSortedNotes.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Not bulunamadı.</p>
            ) : (
              <ScrollArea className="h-[300px] md:h-[calc(100vh-280px)]">
                <div className="grid gap-4">
                  {filteredAndSortedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => {
                        setCurrentNoteId(note.id)
                        setIsEditingNote(true)
                        setIsAddOrEditNoteModalOpen(true)
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">
                          {clients.find((c) => c.id === note.clientId)?.name} -{" "}
                          {format(note.date, "dd MMMM yyyy EEEE", { locale: tr })}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {psychologists.find((p) => p.id === note.psychologistId)?.name}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Not Ekle/Düzenle Modal */}
        <Dialog
          open={isAddOrEditNoteModalOpen}
          onOpenChange={(open) => {
            setIsAddOrEditNoteModalOpen(open)
            if (!open) {
              setIsEditingNote(false)
              setCurrentNoteId(null)
            }
          }}
        >
          <DialogContent className="dark:bg-gray-800 rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">
                {isEditingNote ? "Notu Düzenle" : "Yeni Not Ekle"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="note-client" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Danışan
                </label>
                <Select
                  value={newNoteClientId}
                  onValueChange={setNewNoteClientId}
                  disabled={isEditingNote && currentNoteId !== null}
                >
                  <SelectTrigger
                    id="note-client"
                    className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg"
                  >
                    <SelectValue placeholder="Danışan seç" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="note-psychologist" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Psikolog
                </label>
                <Select value={newNotePsychologistId} onValueChange={setNewNotePsychologistId}>
                  <SelectTrigger
                    id="note-psychologist"
                    className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg"
                  >
                    <SelectValue placeholder="Psikolog seç" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {psychologists.map((psychologist) => (
                      <SelectItem key={psychologist.id} value={psychologist.id.toString()}>
                        {psychologist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="note-date" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Tarih
                </label>
                {/* Not Ekle/Düzenle Modal için tek tarih seçici */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg",
                        !newNoteDate && "text-muted-foreground",
                      )}
                      disabled={isEditingNote && currentNoteId !== null}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newNoteDate ? format(newNoteDate, "dd MMMM yyyy", { locale: tr }) : <span>Tarih Seç</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700">
                    <Calendar mode="single" selected={newNoteDate} onSelect={setNewNoteDate} initialFocus locale={tr} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="note-content" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Not İçeriği
                </label>
                <Textarea
                  id="note-content"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg min-h-[100px]"
                  placeholder="Notunuzu buraya yazın..."
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setIsAddOrEditNoteModalOpen(false)}
                className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                İptal
              </Button>
              <div className="flex gap-2">
                {isEditingNote && (
                  <Button variant="destructive" onClick={() => handleDeleteNote(currentNoteId!)} className="rounded-lg">
                    Sil
                  </Button>
                )}
                <Button
                  onClick={handleSaveNote}
                  disabled={
                    !newNoteClientId || !newNotePsychologistId || !newNoteDate || newNoteContent.trim().length === 0
                  }
                  className="dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg"
                >
                  {isEditingNote ? "Kaydet" : "Ekle"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}