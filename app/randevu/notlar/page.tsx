"use client"

import { Header } from "@/components/header"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format, startOfWeek, addDays, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { tr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckIcon, CalendarIcon, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

// Supabase tipleri
type Client = {
  id: number
  name: string
  created_at?: string
}

type Psychologist = {
  id: string
  name: string
  renk_kodu?: string
  created_at?: string
}

interface Note {
  id: number
  client_id: number
  psychologist_id: number
  content: string
  note_date?: string
  date?: string
  created_at: string
  updated_at?: string
}

const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

export default function RandevuNotlariPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [selectedPsychologistFilter, setSelectedPsychologistFilter] = useState<number | "all">("all")
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateRange | undefined>(undefined)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const [isAddOrEditNoteModalOpen, setIsAddOrEditNoteModalOpen] = useState(false)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(null)

  const [newNoteClientId, setNewNoteClientId] = useState<number | "">("")
  const [newNotePsychologistId, setNewNotePsychologistId] = useState<number | "">("")
  const [newNoteDate, setNewNoteDate] = useState<Date | undefined>(undefined)
  const [newNoteContent, setNewNoteContent] = useState("")
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Silme onay diyaloğu için yeni state'ler
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)

  // Form sıfırlama fonksiyonu
  const resetForm = () => {
    setNewNoteClientId("")
    setNewNotePsychologistId("")
    setNewNoteDate(undefined)
    setNewNoteContent("")
    setCurrentNoteId(null)
    setIsEditingNote(false)
  }

  // Verileri Supabase'den çekmek için fonksiyon
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Danışanları çek
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, name, created_at")
        .order('created_at', { ascending: false }) // En yeni kayıtlar üstte
      if (clientsError) throw clientsError
      setClients(clientsData || [])

      // Psikologları çek
      const { data: psychologistsData, error: psychologistsError } = await supabase
        .from("psychologists")
        .select("id, name, renk_kodu, created_at")
      if (psychologistsError) throw psychologistsError
      setPsychologists(psychologistsData || [])
      
      // Psikolog ID'lerini konsola yazdır
      console.log("Mevcut psikologlar:", psychologistsData?.map(p => ({
        id: p.id,
        name: p.name,
        type: typeof p.id
      })))

      // Notes tablosundan verileri çek
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select("*")
      
      if (notesError) {
        console.error("Notes error:", notesError)
        throw notesError
      }
      
      // Notlardaki psikolog ID'lerini kontrol et
      if (notesData && notesData.length > 0) {
        console.log("Notlardaki benzersiz psikolog ID'leri:", 
          [...new Set(notesData.map(n => n.psychologist_id))]
        )
        console.log("İlk notun yapısı:", {
          ...notesData[0],
          psychologist_id_type: typeof notesData[0]?.psychologist_id
        })
      }
      
      setNotes(notesData || [])

    } catch (err: any) {
      console.error("Veri çekme hatası:", err.message)
      setError("Veriler yüklenirken bir hata oluştu: " + err.message)
      toast.error("Veriler yüklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }, [])

  // Realtime subscription for client changes
  useEffect(() => {
    // Set up the subscription
    const clientSubscription = supabase
      .channel('clients_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'clients' 
        }, 
        (payload) => {
          // When any change happens to clients table, refetch the data
          fetchData();
        }
      )
      .subscribe()

    // Initial data fetch
    fetchData()

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(clientSubscription)
    }
  }, [fetchData])

  // Bileşen yüklendiğinde verileri çek
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const currentWeekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    return days.map((_, i) => addDays(start, i))
  }, [])

  // Psikolog filtresine göre danışanları filtrele
  const filteredClients = useMemo(() => {
    if (selectedPsychologistFilter === "all") {
      return clients
    }
    const psychologistId = Number(selectedPsychologistFilter)
    const clientsWithNotesForPsychologist = new Set(
      notes
        .filter((note: Note) => note.psychologist_id === psychologistId)
        .map((note: Note) => note.client_id),
    )
    return clients.filter((client: Client) => clientsWithNotesForPsychologist.has(client.id))
  }, [clients, notes, selectedPsychologistFilter])

  // Seçili psikolog bilgisini al
  const selectedPsychologistInfo = useMemo(() => {
    if (selectedPsychologistFilter === "all") return null
    
    // Hem string hem number karşılaştırması yap
    return psychologists.find((p: Psychologist) => 
      p.id === selectedPsychologistFilter.toString() || 
      Number(p.id) === selectedPsychologistFilter
    )
  }, [psychologists, selectedPsychologistFilter])

  // Seçili danışanın notlarını filtrele ve kronolojik sırala (en yeni en üstte)
  // Veya danışan seçili değilse, psikolog ve tarih filtresine göre tüm notları sırala
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes

    // Müşteri filtresi
    if (selectedClient) {
      filtered = filtered.filter((note: any) => note.client_id === selectedClient.id)
    }

    // Psikolog filtresi
    if (selectedPsychologistFilter !== "all") {
      const selectedId = Number(selectedPsychologistFilter)
      console.log("Psikolog filtresi uygulanıyor. Seçilen psikolog ID:", selectedId, "Türü:", typeof selectedId)
      filtered = filtered.filter((note: Note) => {
        const matches = note.psychologist_id === selectedId
        console.log(`Not ID: ${note.id}, Psikolog ID: ${note.psychologist_id} (${typeof note.psychologist_id}), Eşleşme: ${matches}`)
        return matches
      })
      console.log("Filtreleme sonrası not sayısı:", filtered.length)
    }

    // Tarih aralığı filtresi
    if (selectedDateFilter?.from || selectedDateFilter?.to) {
      filtered = filtered.filter((note: any) => {
        // Esnek tarih alanı - note_date, date veya created_at kullanabilir
        const noteDateStr = note.note_date || note.date || note.created_at
        if (!noteDateStr) return true
        
        const noteDate = new Date(noteDateStr)
        const from = selectedDateFilter?.from
        const to = selectedDateFilter?.to

        if (from && to) {
          return isWithinInterval(noteDate, { start: startOfDay(from), end: endOfDay(to) })
        } else if (from) {
          return noteDate >= startOfDay(from)
        } else if (to) {
          return noteDate <= endOfDay(to)
        }
        return true
      })
    }

    // Arama filtresi
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((note: any) => {
        const clientName = clients.find((c: any) => c.id === note.client_id)?.name?.toLowerCase() || ""
        const psychologistName = psychologists.find((p: any) => p.id === note.psychologist_id)?.name?.toLowerCase() || ""
        const content = note.content?.toLowerCase() || ""
        
        return clientName.includes(search) || psychologistName.includes(search) || content.includes(search)
      })
    }

    // Tarihe göre sırala (en yeni önce)
    return filtered.sort((a: any, b: any) => {
      const dateStrA = a.note_date || a.date || a.created_at
      const dateStrB = b.note_date || b.date || b.created_at
      
      if (!dateStrA || !dateStrB) return 0
      
      const dateA = new Date(dateStrA)
      const dateB = new Date(dateStrB)
      return dateB.getTime() - dateA.getTime()
    })
  }, [notes, selectedClient, selectedPsychologistFilter, selectedDateFilter, searchTerm, clients, psychologists])

  // Düzenleme modunda modalı doldur
  useEffect(() => {
    if (isEditingNote && currentNoteId !== null) {
      const noteToEdit = notes.find((note: any) => note.id === currentNoteId)
      if (noteToEdit) {
        setNewNoteClientId(noteToEdit.client_id)
        setNewNotePsychologistId(noteToEdit.psychologist_id)
        // Esnek tarih alanı kullan
        const dateStr = noteToEdit.note_date || noteToEdit.date || noteToEdit.created_at
        setNewNoteDate(dateStr ? new Date(dateStr) : new Date())
        setNewNoteContent(noteToEdit.content)
      }
    } else {
      // Modal kapandığında veya ekleme moduna geçildiğinde formu sıfırla
      setNewNoteClientId(selectedClient ? selectedClient.id : "")
      setNewNotePsychologistId(selectedPsychologistFilter !== "all" ? selectedPsychologistFilter : "")
      setNewNoteDate(new Date()) // Varsayılan olarak bugünün tarihi
      setNewNoteContent("")
    }
  }, [isEditingNote, currentNoteId, notes, selectedClient, selectedPsychologistFilter])

  const handleSaveNote = async () => {
    if (!newNoteClientId || !newNotePsychologistId || !newNoteDate || newNoteContent.trim().length === 0) {
      toast.error("Gerekli Alanlar Eksik!", {
        description: "Lütfen not bilgilerinin tümünü doldurun.",
        duration: 3000,
      });
      return
    }

    setIsSaving(true)
    try {
      if (isEditingNote && currentNoteId !== null) {
        // Not güncelle - esnek tarih alanı kullan
        const updateData: any = {
          client_id: newNoteClientId,
          psychologist_id: newNotePsychologistId,
          content: newNoteContent,
        }
        
        // Tarih alanını esnek şekilde ayarla
        const dateStr = format(newNoteDate, "yyyy-MM-dd")
        const { error } = await supabase
          .from("notes")
          .update(updateData)
          .eq("id", currentNoteId)
        
        if (error) throw error

        // Toast mesajı için güvenli client name alma
        const clientName = clients.find(c => c.id === newNoteClientId)?.name;
        toast.success("Not Başarıyla Güncellendi!", {
          description: clientName
            ? `${clientName} için not güncellendi.`
            : "Not başarıyla güncellendi.",
        });
      } else {
        const noteData = {
          client_id: newNoteClientId,
          psychologist_id: newNotePsychologistId,
          content: newNoteContent,
          date: format(newNoteDate, "yyyy-MM-dd"),
          created_at: new Date().toISOString()
        }
        
        const { error } = await supabase
          .from("notes")
          .insert([noteData])
        
        if (error) throw error

        // Toast mesajı için güvenli client name alma
        const clientName = clients.find(c => c.id === newNoteClientId)?.name;
        toast.success("Yeni Not Eklendi!", {
          description: clientName
            ? `${clientName} için yeni bir not oluşturuldu.`
            : "Not başarıyla oluşturuldu.",
        });
      }

      resetForm()
      await fetchData()
      setIsAddOrEditNoteModalOpen(false)
    } catch (error: any) {
      console.error("Not kaydedilirken hata:", error)
      toast.error("Hata!", { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  // Silme onayı için fonksiyon
  const confirmDeleteNote = (note: Note) => {
    setNoteToDelete(note);
    setShowDeleteConfirm(true);
  };

  // Gelişmiş silme fonksiyonu
  const handleDeleteNote = async () => {
    if (!noteToDelete) {
      toast.error("Silinecek not bulunamadı");
      setShowDeleteConfirm(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteToDelete.id)
      
      if (error) throw error

      // Update local state
      setNotes(prev => prev.filter(n => n.id !== noteToDelete.id));
      
      // Close the dialog and reset state
      setShowDeleteConfirm(false);
      setNoteToDelete(null);
      setIsAddOrEditNoteModalOpen(false);
      setIsEditingNote(false);
      setCurrentNoteId(null);
      
      // Show success message with client name
      const clientName = clients.find(c => c.id === noteToDelete.client_id)?.name;
      toast.success("Not Başarıyla Silindi!", {
        description: clientName
          ? `${clientName} için not başarıyla silindi.`
          : "Not başarıyla silindi.",
      });
      
    } catch (err: any) {
      console.error("Not silme hatası:", err.message)
      toast.error("Not silinirken bir hata oluştu");
    }
  }

  // Loading durumu
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Veriler yükleniyor...</span>
          </div>
        </main>
      </div>
    )
  }

  // Error durumu
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchData}>Tekrar Dene</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col md:flex-row items-start justify-start p-4 md:p-8 gap-6">
        {/* Sol Panel: Arama ve Filtreler */}
        <div className="w-full md:w-1/4 space-y-4">
          {/* Arama Kutusu */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Ara</h3>
            <Input
              type="text"
              placeholder="İsim, not içeriği..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          {/* Psikolog Filtresi */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Psikolog Filtresi</h3>
                <Select
                  value={selectedPsychologistFilter === "all" ? "all" : selectedPsychologistFilter.toString()}
                  onValueChange={(value) => setSelectedPsychologistFilter(value === "all" ? "all" : Number(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Psikolog seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Psikologlar</SelectItem>
                    {psychologists.map((psychologist) => (
                      <SelectItem key={psychologist.id} value={psychologist.id.toString()}>
                        {psychologist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
          </div>

          {/* Danışan Listesi */}
          <Card className="w-full dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Danışanlar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px] md:h-[calc(100vh-500px)]">
                <nav className="grid gap-1 p-2">
                  {filteredClients.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      {psychologists.length > 0 ? "Danışan bulunamadı" : "Psikolog seçin"}
                    </p>
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
        </div>

        {/* Sağ Panel: Danışan Notları */}
        <Card className="flex-grow w-full dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">
              {selectedClient
                ? `${selectedClient.name} Notları`
                : selectedPsychologistFilter !== "all" && selectedPsychologistInfo
                  ? `${selectedPsychologistInfo.name} Notları`
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
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                          {clients.find((c: any) => c.id === note.client_id)?.name || 'Bilinmeyen Danışan'}
                        </div>
                        <div className="flex flex-col sm:items-end gap-1">
                          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            {psychologists.find((p: Psychologist) => Number(p.id) === note.psychologist_id)?.name || 'Bilinmeyen Psikolog'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {(() => {
                              const dateStr = note.note_date || note.date || note.created_at
                              return dateStr ? format(new Date(dateStr), "dd MMMM yyyy EEEE", { locale: tr }) : "Tarih yok"
                            })()}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap mt-2">{note.content}</p>
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
          <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 border-0 shadow-2xl rounded-3xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {isEditingNote ? "Notu Düzenle" : "Yeni Not Ekle"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="note-client" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Danışan
                </label>
                <Select
                  value={newNoteClientId === "" ? "" : newNoteClientId.toString()}
                  onValueChange={(value) => setNewNoteClientId(value === "" ? "" : Number(value))}
                  disabled={isEditingNote && currentNoteId !== null}
                >
                  <SelectTrigger
                    id="note-client"
                    className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg"
                  >
                    <SelectValue placeholder="Danışan seçin" />
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
                <div className="col-span-3">
                  <Select
                    value={newNotePsychologistId === "" ? "" : newNotePsychologistId.toString()}
                    onValueChange={(value) => setNewNotePsychologistId(value === "" ? "" : Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Psikolog seçin" />
                    </SelectTrigger>
                    <SelectContent className="min-w-[300px]">
                      {psychologists.map((psychologist) => (
                        <SelectItem 
                          key={psychologist.id} 
                          value={psychologist.id.toString()}
                          className="py-2 px-3"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: psychologist.renk_kodu || '#6b7280' }}
                            />
                            <span className="truncate">{psychologist.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      if (currentNoteId !== null) {
                        const noteToDeleteObj = notes.find(n => n.id === currentNoteId);
                        if (noteToDeleteObj) {
                          confirmDeleteNote(noteToDeleteObj);
                        } else {
                          toast.error("Lütfen silinecek bir not seçin");
                        }
                      } else {
                        toast.error("Lütfen silinecek bir not seçin");
                      }
                    }} 
                    className="rounded-lg"
                  >
                    Sil
                  </Button>
                )}
                <Button
                  onClick={handleSaveNote}
                  disabled={
                    isSaving || !newNoteClientId || !newNotePsychologistId || !newNoteDate || newNoteContent.trim().length === 0
                  }
                  className="dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditingNote ? "Güncelleniyor..." : "Ekleniyor..."}
                    </>
                  ) : (
                    isEditingNote ? "Kaydet" : "Ekle"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Diyaloğu */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 border-0 shadow-2xl rounded-3xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Notu Sil
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700 dark:text-gray-200">Bu notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
              {noteToDelete && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {clients.find(c => c.id === noteToDelete.client_id)?.name || 'Bilinmeyen Danışan'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {(() => {
                      const dateStr = noteToDelete.note_date || noteToDelete.date || noteToDelete.created_at
                      return dateStr ? format(new Date(dateStr), "dd MMMM yyyy", { locale: tr }) : "Tarih yok"
                    })()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {noteToDelete.content.length > 100 
                      ? `${noteToDelete.content.substring(0, 100)}...` 
                      : noteToDelete.content}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                İptal
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteNote}
                className="bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}