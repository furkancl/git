"use client"

import { useState, useMemo } from "react"
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddEvaluationForm } from "@/components/add-evaluation-form"
import { EditEvaluationForm } from "@/components/edit-evaluation-form"
import { Header } from "@/components/header"

// Define Evaluation Type
interface Evaluation {
  id: string
  clientName: string
  psychologistName: string
  meetingDate: string // ISO string for consistent parsing
  clientPostMeetingRequests: string
  processStatus: "Devam Ediyor" | "Tamamlandı" | "Ara Verildi" | "Beklemede"
  psychologistOpinions: string
}

// Mock data for demonstration purposes
const initialEvaluations: Evaluation[] = [
  {
    id: "1",
    clientName: "Ayşe Yılmaz",
    psychologistName: "Dr. Elif Can",
    meetingDate: "2025-07-25T11:00:00",
    clientPostMeetingRequests: "Bir sonraki seansta aile dinamiklerini konuşmak istiyor.",
    processStatus: "Devam Ediyor",
    psychologistOpinions: "Danışan kaygı yönetimi konusunda ilerleme kaydediyor. Ev ödevlerini düzenli yapıyor.",
  },
  {
    id: "2",
    clientName: "Mehmet Demir",
    psychologistName: "Dr. Burak Aksoy",
    meetingDate: "2025-07-26T15:30:00",
    clientPostMeetingRequests: "İletişim becerileri üzerine daha fazla pratik yapmak istiyor.",
    processStatus: "Devam Ediyor",
    psychologistOpinions: "İlişki sorunlarında farkındalığı arttı. Empati egzersizlerine devam edilecek.",
  },
  {
    id: "3",
    clientName: "Zeynep Kaya",
    psychologistName: "Dr. Elif Can",
    meetingDate: "2025-07-27T10:00:00",
    clientPostMeetingRequests: "Kariyer hedefleri konusunda netleşmek için destek bekliyor.",
    processStatus: "Beklemede",
    psychologistOpinions: "Özsaygı konusunda direnç gösteriyor. Küçük başarılarla motive edilmeli.",
  },
  {
    id: "4",
    clientName: "Canan Erdem",
    psychologistName: "Dr. Deniz Yılmaz",
    meetingDate: "2025-07-28T12:00:00",
    clientPostMeetingRequests: "Yas sürecini daha sağlıklı atlatmak için grup terapisi önerisi istiyor.",
    processStatus: "Tamamlandı",
    psychologistOpinions: "Yas sürecinin son aşamalarında. Destek gruplarına yönlendirme yapıldı.",
  },
]

const mockPsychologists = ["Dr. Elif Can", "Dr. Burak Aksoy", "Dr. Deniz Yılmaz"]
const processStatuses = ["Devam Ediyor", "Tamamlandı", "Ara Verildi", "Beklemede"]

export default function MeetingEvaluationPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(initialEvaluations)
  const [clientNameFilter, setClientNameFilter] = useState("")
  const [psychologistNameFilter, setPsychologistNameFilter] = useState("all")
  const [meetingDateRange, setMeetingDateRange] = useState<DateRange | undefined>(undefined)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEditingEvaluation, setCurrentEditingEvaluation] = useState<Evaluation | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [evaluationToDeleteId, setEvaluationToDeleteId] = useState<string | null>(null)

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      const matchesClientName = evaluation.clientName.toLowerCase().includes(clientNameFilter.toLowerCase())
      const matchesPsychologistName =
        psychologistNameFilter === "all" ? true : evaluation.psychologistName === psychologistNameFilter

      const meetingDateTime = new Date(evaluation.meetingDate)
      const matchesDateRange = meetingDateRange?.from
        ? meetingDateTime >= meetingDateRange.from && (!meetingDateRange.to || meetingDateTime <= meetingDateRange.to)
        : true

      return matchesClientName && matchesPsychologistName && matchesDateRange
    })
  }, [evaluations, clientNameFilter, psychologistNameFilter, meetingDateRange])

  const handleAddEvaluation = (newEvaluation: Omit<Evaluation, "id">) => {
    const id = (evaluations.length > 0 ? Math.max(...evaluations.map((e) => Number.parseInt(e.id))) + 1 : 1).toString()
    setEvaluations((prev) => [...prev, { ...newEvaluation, id }])
    setIsAddDialogOpen(false)
  }

  const handleEditEvaluation = (updatedEvaluation: Evaluation) => {
    setEvaluations((prev) =>
      prev.map((evalItem) => (evalItem.id === updatedEvaluation.id ? updatedEvaluation : evalItem)),
    )
    setIsEditDialogOpen(false)
    setCurrentEditingEvaluation(null)
  }

  const handleDeleteEvaluation = (id: string) => {
    setEvaluations((prev) => prev.filter((evalItem) => evalItem.id !== id))
    setIsDeleteDialogOpen(false)
    setEvaluationToDeleteId(null)
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
                  <Label htmlFor="psychologistNameFilter" className="mb-1">
                    Psikolog Adı
                  </Label>
                  <Select value={psychologistNameFilter} onValueChange={setPsychologistNameFilter}>
                    <SelectTrigger id="psychologistNameFilter">
                      <SelectValue placeholder="Psikolog Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {mockPsychologists.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
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
              {(clientNameFilter ||
                psychologistNameFilter !== "all" ||
                meetingDateRange?.from ||
                meetingDateRange?.to) && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClientNameFilter("")
                      setPsychologistNameFilter("all")
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
                          <TableCell>{format(new Date(evaluation.meetingDate), "PPP HH:mm", { locale: tr })}</TableCell>
                          <TableCell className="whitespace-normal">{evaluation.clientPostMeetingRequests}</TableCell>
                          <TableCell>{evaluation.processStatus}</TableCell>
                          <TableCell className="whitespace-normal">{evaluation.psychologistOpinions}</TableCell>
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
                psychologists={mockPsychologists}
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
                  psychologists={mockPsychologists}
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
                <AlertDialogAction onClick={() => evaluationToDeleteId && handleDeleteEvaluation(evaluationToDeleteId)}>
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
