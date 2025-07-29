"use client"

import type React from "react"

import { AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { PlusIcon, CalendarIcon, EditIcon, Trash2Icon } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"
import { supabase } from "@/lib/supabase" // Supabase istemcisini içe aktar

// Supabase tablosuna uygun Evaluation tipi
interface Evaluation {
  id: number
  client_id: number
  psychologist_id: number
  meeting_date: string // ISO string
  client_post_meeting_requests: string | null
  process_status: "Devam Ediyor" | "Tamamlandı" | "Ara Verildi" | "Beklemede"
  psychologist_opinions: string | null
  created_at: string
  // Join ile gelen ek alanlar
  clientName?: string
  psychologistName?: string
}

// Supabase'den çekilecek Client ve Psychologist tipleri
interface Client {
  id: number
  name: string
}

interface Psychologist {
  id: number
  name: string
}

const processStatuses = ["Devam Ediyor", "Tamamlandı", "Ara Verildi", "Beklemede"]

export default function MeetingEvaluationPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [clientNameFilter, setClientNameFilter] = useState("")
  const [psychologistFilter, setPsychologistFilter] = useState("all") // ID olarak tutulacak
  const [meetingDateRange, setMeetingDateRange] = useState<DateRange | undefined>(undefined)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEditingEvaluation, setCurrentEditingEvaluation] = useState<Evaluation | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [evaluationToDeleteId, setEvaluationToDeleteId] = useState<number | null>(null)

  // Supabase'den verileri getirme fonksiyonu
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Psikologları getir
      const { data: psychologistsData, error: psychError } = await supabase.from("psychologists").select("id, name")
      if (psychError) throw psychError
      setPsychologists(psychologistsData || [])

      // Danışanları getir
      const { data: clientsData, error: clientError } = await supabase.from("clients").select("id, name")
      if (clientError) throw clientError
      setClients(clientsData || [])

      // Değerlendirmeleri getir (client ve psychologist adlarıyla birlikte)
      const { data: evaluationsData, error: evalError } = await supabase
        .from("evaluations")
        .select(`
          id,
          client_id,
          psychologist_id,
          meeting_date,
          client_post_meeting_requests,
          process_status,
          psychologist_opinions,
          created_at,
          clients(name),
          psychologists(name)
        `)
        .order("meeting_date", { ascending: false })

      if (evalError) throw evalError

      const mappedEvaluations: Evaluation[] = evaluationsData.map((item: any) => ({
        id: item.id,
        client_id: item.client_id,
        psychologist_id: item.psychologist_id,
        meeting_date: item.meeting_date,
        client_post_meeting_requests: item.client_post_meeting_requests,
        process_status: item.process_status,
        psychologist_opinions: item.psychologist_opinions,
        created_at: item.created_at,
        clientName: item.clients?.name,
        psychologistName: item.psychologists?.name,
      }))
      setEvaluations(mappedEvaluations)
    } catch (err: any) {
      console.error("Veri getirilirken hata oluştu:", err.message)
      setError("Veriler yüklenirken bir hata oluştu: " + err.message)
      setEvaluations([])
      setClients([])
      setPsychologists([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      const matchesClientName = evaluation.clientName?.toLowerCase().includes(clientNameFilter.toLowerCase()) || false
      const matchesPsychologist =
        psychologistFilter === "all" ? true : evaluation.psychologist_id === Number(psychologistFilter)

      const meetingDateTime = new Date(evaluation.meeting_date)
      const matchesDateRange = meetingDateRange?.from
        ? meetingDateTime >= meetingDateRange.from && (!meetingDateRange.to || meetingDateTime <= meetingDateRange.to)
        : true

      return matchesClientName && matchesPsychologist && matchesDateRange
    })
  }, [evaluations, clientNameFilter, psychologistFilter, meetingDateRange])

  // Yeni değerlendirme ekleme formu için
  const AddEvaluationForm = ({
    onAddEvaluation,
    clients,
    psychologists,
    processStatuses,
  }: {
    onAddEvaluation: (
      newEval: Omit<Evaluation, "id" | "created_at" | "clientName" | "psychologistName">,
    ) => Promise<void>
    clients: Client[]
    psychologists: Psychologist[]
    processStatuses: string[]
  }) => {
    const [clientId, setClientId] = useState<string>("")
    const [psychologistId, setPsychologistId] = useState<string>("")
    const [meetingDate, setMeetingDate] = useState<Date | undefined>(undefined)
    const [meetingTime, setMeetingTime] = useState<string>("") // "HH:mm"
    const [clientPostMeetingRequests, setClientPostMeetingRequests] = useState<string>("")
    const [processStatus, setProcessStatus] = useState<string>("")
    const [psychologistOpinions, setPsychologistOpinions] = useState<string>("")

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!clientId || !psychologistId || !meetingDate || !processStatus) {
        alert("Lütfen tüm zorunlu alanları doldurun.")
        return
      }

      // Tarih ve saat birleştirme
      let meetingDateTime = meetingDate
      if (meetingDate && meetingTime) {
        const [hours, minutes] = meetingTime.split(":").map(Number)
        meetingDateTime = new Date(meetingDate)
        meetingDateTime.setHours(hours)
        meetingDateTime.setMinutes(minutes)
        meetingDateTime.setSeconds(0)
        meetingDateTime.setMilliseconds(0)
      }
      await onAddEvaluation({
        client_id: Number(clientId),
        psychologist_id: Number(psychologistId),
        meeting_date: meetingDateTime ? meetingDateTime.toISOString() : meetingDate?.toISOString(),
        client_post_meeting_requests: clientPostMeetingRequests || null,
        process_status: processStatus as "Devam Ediyor" | "Tamamlandı" | "Ara Verildi" | "Beklemede",
        psychologist_opinions: psychologistOpinions || null,
      })
      // Formu sıfırla
      setClientId("")
      setPsychologistId("")
      setMeetingDate(undefined)
      setClientPostMeetingRequests("")
      setProcessStatus("")
      setPsychologistOpinions("")
      setMeetingTime("")
    }

    return (
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="client" className="text-right">
            Danışan
          </Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger id="client" className="col-span-3">
              <SelectValue placeholder="Danışan Seçin" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="psychologist" className="text-right">
            Psikolog
          </Label>
          <Select value={psychologistId} onValueChange={setPsychologistId}>
            <SelectTrigger id="psychologist" className="col-span-3">
              <SelectValue placeholder="Psikolog Seçin" />
            </SelectTrigger>
            <SelectContent>
              {psychologists.map((psych) => (
                <SelectItem key={psych.id} value={psych.id.toString()}>
                  {psych.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="meetingDate" className="text-right">
            Görüşme Tarihi
          </Label>
          <div className="col-span-3 flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !meetingDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {meetingDate ? format(meetingDate, "PPP", { locale: tr }) : <span>Tarih Seçin</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={meetingDate} onSelect={setMeetingDate} initialFocus locale={tr} />
              </PopoverContent>
            </Popover>
            <input
              type="time"
              value={meetingTime}
              onChange={e => setMeetingTime(e.target.value)}
              className="border rounded px-2 py-1"
              style={{ minWidth: 90 }}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="clientRequests" className="text-right">
            Danışanın Sonraki İstekleri
          </Label>
          <Input
            id="clientRequests"
            value={clientPostMeetingRequests}
            onChange={(e) => setClientPostMeetingRequests(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="processStatus" className="text-right">
            Süreç Durumu
          </Label>
          <Select value={processStatus} onValueChange={setProcessStatus}>
            <SelectTrigger id="processStatus" className="col-span-3">
              <SelectValue placeholder="Durum Seçin" />
            </SelectTrigger>
            <SelectContent>
              {processStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="psychologistOpinions" className="text-right">
            Psikolog Görüşleri
          </Label>
          <Input
            id="psychologistOpinions"
            value={psychologistOpinions}
            onChange={(e) => setPsychologistOpinions(e.target.value)}
            className="col-span-3"
          />
        </div>
        <Button type="submit" className="w-full">
          Değerlendirme Ekle
        </Button>
      </form>
    )
  }

  // Değerlendirme düzenleme formu için
  const EditEvaluationForm = ({
    initialData,
    onUpdateEvaluation,
    clients,
    psychologists,
    processStatuses,
  }: {
    initialData: Evaluation
    onUpdateEvaluation: (updatedEval: Evaluation) => Promise<void>
    clients: Client[]
    psychologists: Psychologist[]
    processStatuses: string[]
  }) => {
    const [clientId, setClientId] = useState<string>(initialData.client_id.toString())
    const [psychologistId, setPsychologistId] = useState<string>(initialData.psychologist_id.toString())
    const [meetingDate, setMeetingDate] = useState<Date | undefined>(new Date(initialData.meeting_date))
    // Saat inputu için ilk değeri ISO stringden al
    const initialTime = initialData.meeting_date ? new Date(initialData.meeting_date).toISOString().substring(11,16) : ""
    const [meetingTime, setMeetingTime] = useState<string>(initialTime)
    const [clientPostMeetingRequests, setClientPostMeetingRequests] = useState<string>(
      initialData.client_post_meeting_requests || "",
    )
    const [processStatus, setProcessStatus] = useState<string>(initialData.process_status)
    const [psychologistOpinions, setPsychologistOpinions] = useState<string>(initialData.psychologist_opinions || "")

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!clientId || !psychologistId || !meetingDate || !processStatus) {
        alert("Lütfen tüm zorunlu alanları doldurun.")
        return
      }

      // Tarih ve saat birleştirme
      let meetingDateTime = meetingDate
      if (meetingDate && meetingTime) {
        const [hours, minutes] = meetingTime.split(":").map(Number)
        meetingDateTime = new Date(meetingDate)
        meetingDateTime.setHours(hours)
        meetingDateTime.setMinutes(minutes)
        meetingDateTime.setSeconds(0)
        meetingDateTime.setMilliseconds(0)
      }
      await onUpdateEvaluation({
        ...initialData,
        client_id: Number(clientId),
        psychologist_id: Number(psychologistId),
        meeting_date: meetingDateTime ? meetingDateTime.toISOString() : meetingDate?.toISOString(),
        client_post_meeting_requests: clientPostMeetingRequests || null,
        process_status: processStatus as "Devam Ediyor" | "Tamamlandı" | "Ara Verildi" | "Beklemede",
        psychologist_opinions: psychologistOpinions || null,
      })
    }

    return (
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="client" className="text-right">
            Danışan
          </Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger id="client" className="col-span-3">
              <SelectValue placeholder="Danışan Seçin" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="psychologist" className="text-right">
            Psikolog
          </Label>
          <Select value={psychologistId} onValueChange={setPsychologistId}>
            <SelectTrigger id="psychologist" className="col-span-3">
              <SelectValue placeholder="Psikolog Seçin" />
            </SelectTrigger>
            <SelectContent>
              {psychologists.map((psych) => (
                <SelectItem key={psych.id} value={psych.id.toString()}>
                  {psych.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="meetingDate" className="text-right">
            Görüşme Tarihi
          </Label>
          <div className="col-span-3 flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !meetingDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {meetingDate ? format(meetingDate, "PPP", { locale: tr }) : <span>Tarih Seçin</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={meetingDate} onSelect={setMeetingDate} initialFocus locale={tr} />
              </PopoverContent>
            </Popover>
            <input
              type="time"
              value={meetingTime}
              onChange={e => setMeetingTime(e.target.value)}
              className="border rounded px-2 py-1"
              style={{ minWidth: 90 }}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="clientRequests" className="text-right">
            Danışanın Sonraki İstekleri
          </Label>
          <Input
            id="clientRequests"
            value={clientPostMeetingRequests}
            onChange={(e) => setClientPostMeetingRequests(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="processStatus" className="text-right">
            Süreç Durumu
          </Label>
          <Select value={processStatus} onValueChange={setProcessStatus}>
            <SelectTrigger id="processStatus" className="col-span-3">
              <SelectValue placeholder="Durum Seçin" />
            </SelectTrigger>
            <SelectContent>
              {processStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="psychologistOpinions" className="text-right">
            Psikolog Görüşleri
          </Label>
          <Input
            id="psychologistOpinions"
            value={psychologistOpinions}
            onChange={(e) => setPsychologistOpinions(e.target.value)}
            className="col-span-3"
          />
        </div>
        <Button type="submit" className="w-full">
          Değerlendirmeyi Güncelle
        </Button>
      </form>
    )
  }

  const handleAddEvaluation = async (
    newEval: Omit<Evaluation, "id" | "created_at" | "clientName" | "psychologistName">,
  ) => {
    try {
      setLoading(true)
      setError(null)
      // id ve created_at gibi alanları göndermeden ekle
      const { error } = await supabase
        .from("evaluations")
        .insert([
          {
            client_id: newEval.client_id,
            psychologist_id: newEval.psychologist_id,
            meeting_date: newEval.meeting_date,
            client_post_meeting_requests: newEval.client_post_meeting_requests,
            process_status: newEval.process_status,
            psychologist_opinions: newEval.psychologist_opinions,
          },
        ])
      if (error) throw error
      setIsAddDialogOpen(false)
      await fetchData()
    } catch (err: any) {
      setError("Kayıt eklenirken hata oluştu: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditEvaluation = async (updatedEval: Evaluation) => {
    // Implement handleEditEvaluation logic here
  }

  const handleDeleteEvaluation = async (evaluationId: number) => {
    // Implement handleDeleteEvaluation logic here
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col items-start justify-start p-4 md:p-8 gap-6">
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-center md:text-left">Görüşme Değerlendirme Sayfası</h1>
            <Button className="w-full md:w-auto" onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Yeni Değerlendirme Ekle
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtreler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="clientNameFilter" className="mb-1">
                    Danışan Adı
                  </Label>
                  <Input
                    id="clientNameFilter"
                    placeholder="Danışan adına göre filtrele..."
                    value={clientNameFilter}
                    onChange={(e) => setClientNameFilter(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="psychologistFilter" className="mb-1">
                    Psikolog Adı
                  </Label>
                  <Select value={psychologistFilter} onValueChange={setPsychologistFilter}>
                    <SelectTrigger id="psychologistFilter">
                      <SelectValue placeholder="Psikolog Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {psychologists.map((psych) => (
                        <SelectItem key={psych.id} value={psych.id.toString()}>
                          {psych.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="meetingDateRange" className="mb-1">
                    Görüşme Tarih Aralığı
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="meetingDateRange"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !meetingDateRange?.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {meetingDateRange?.from ? (
                          meetingDateRange.to ? (
                            <>
                              {format(meetingDateRange.from, "PPP", { locale: tr })} -{" "}
                              {format(meetingDateRange.to, "PPP", { locale: tr })}
                            </>
                          ) : (
                            format(meetingDateRange.from, "PPP", { locale: tr })
                          )
                        ) : (
                          <span>Tarih Aralığı Seçin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={meetingDateRange}
                        onSelect={setMeetingDateRange}
                        numberOfMonths={2}
                        initialFocus
                        locale={tr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {(clientNameFilter || psychologistFilter !== "all" || meetingDateRange?.from || meetingDateRange?.to) && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClientNameFilter("")
                      setPsychologistFilter("all")
                      setMeetingDateRange(undefined)
                    }}
                  >
                    Filtreleri Temizle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Görüşme Değerlendirmeleri</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Yükleniyor...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">{error}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Danışan Adı</TableHead>
                        <TableHead className="min-w-[150px]">Psikolog</TableHead>
                        <TableHead className="min-w-[180px]">Görüşme Tarihi</TableHead>
                        <TableHead className="min-w-[250px]">Danışanın Sonraki İstekleri</TableHead>
                        <TableHead className="min-w-[150px]">Süreç Durumu</TableHead>
                        <TableHead className="min-w-[300px]">Psikolog Görüşleri</TableHead>
                        <TableHead className="min-w-[150px]">Aksiyonlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEvaluations.length > 0 ? (
                        filteredEvaluations.map((evaluation) => (
                          <TableRow key={evaluation.id}>
                            <TableCell className="font-medium">{evaluation.clientName}</TableCell>
                            <TableCell>{evaluation.psychologistName}</TableCell>
                            <TableCell>
                              {format(new Date(evaluation.meeting_date), "PPP HH:mm", { locale: tr })}
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              {evaluation.client_post_meeting_requests}
                            </TableCell>
                            <TableCell>{evaluation.process_status}</TableCell>
                            <TableCell className="whitespace-normal">{evaluation.psychologist_opinions}</TableCell>
                            <TableCell className="flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCurrentEditingEvaluation(evaluation)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <EditIcon className="h-4 w-4 mr-1" /> Düzenle
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setEvaluationToDeleteId(evaluation.id)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2Icon className="h-4 w-4 mr-1" /> Sil
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Gösterilecek değerlendirme bulunamadı.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Evaluation Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni Değerlendirme Ekle</DialogTitle>
                <DialogDescription>Yeni bir görüşme değerlendirme kaydı oluşturun.</DialogDescription>
              </DialogHeader>
              <AddEvaluationForm
                onAddEvaluation={handleAddEvaluation}
                clients={clients}
                psychologists={psychologists}
                processStatuses={processStatuses}
              />
            </DialogContent>
          </Dialog>

          {/* Edit Evaluation Dialog */}
          {currentEditingEvaluation && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Değerlendirmeyi Düzenle</DialogTitle>
                  <DialogDescription>Görüşme değerlendirme bilgilerini güncelleyin.</DialogDescription>
                </DialogHeader>
                <EditEvaluationForm
                  initialData={currentEditingEvaluation}
                  onUpdateEvaluation={handleEditEvaluation}
                  clients={clients}
                  psychologists={psychologists}
                  processStatuses={processStatuses}
                />
              </DialogContent>
            </Dialog>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu değerlendirme kaydı kalıcı olarak silinecektir. Bu işlemi geri alamazsınız.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => evaluationToDeleteId !== null && handleDeleteEvaluation(evaluationToDeleteId)}
                >
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  )
}
