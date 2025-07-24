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
import { AddAppointmentForm } from "@/components/add-appointment-form"
import { EditAppointmentForm } from "@/components/edit-appointment-form"
import { Header } from "@/components/header"

// Define Appointment Type
interface Appointment {
  id: string
  clientName: string
  appointmentDate: string // ISO string or similar for consistent parsing
  clientIssues: string
  psychologistNotes: string
  psychologistName: string // New field for psychologist
}

// Mock data for demonstration purposes
const initialAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "Ayşe Yılmaz",
    appointmentDate: "2025-07-25T10:00:00",
    clientIssues: "Anxiety, stress at work, difficulty sleeping, perfectionism.",
    psychologistNotes:
      "Review coping mechanisms, discuss work-life balance strategies, introduce mindfulness exercises.",
    psychologistName: "Dr. Elif Can",
  },
  {
    id: "2",
    clientName: "Mehmet Demir",
    appointmentDate: "2025-07-26T14:30:00",
    clientIssues: "Relationship problems, communication issues, feeling misunderstood, trust issues.",
    psychologistNotes: "Focus on active listening, explore attachment styles, suggest couples therapy if applicable.",
    psychologistName: "Dr. Burak Aksoy",
  },
  {
    id: "3",
    clientName: "Zeynep Kaya",
    appointmentDate: "2025-07-27T09:00:00",
    clientIssues: "Low self-esteem, procrastination, career uncertainty, fear of failure.",
    psychologistNotes: "Identify strengths, set small achievable goals, discuss cognitive restructuring techniques.",
    psychologistName: "Dr. Elif Can",
  },
  {
    id: "4",
    clientName: "Canan Erdem",
    appointmentDate: "2025-07-28T11:00:00",
    clientIssues: "Grief and loss, difficulty processing emotions, social withdrawal.",
    psychologistNotes: "Provide space for emotional expression, explore grief stages, suggest support groups.",
    psychologistName: "Dr. Burak Aksoy",
  },
  {
    id: "5",
    clientName: "Burak Akın",
    appointmentDate: "2025-07-29T16:00:00",
    clientIssues: "Anger management, impulsivity, family conflict.",
    psychologistNotes: "Teach anger regulation techniques, explore triggers, discuss family dynamics.",
    psychologistName: "Dr. Deniz Yılmaz",
  },
]

const mockPsychologists = ["Dr. Elif Can", "Dr. Burak Aksoy", "Dr. Deniz Yılmaz"]

export default function MeetingPreparationPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [clientNameFilter, setClientNameFilter] = useState("")
  const [psychologistNameFilter, setPsychologistNameFilter] = useState("all")
  const [appointmentDateRange, setAppointmentDateRange] = useState<DateRange | undefined>(undefined)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEditingAppointment, setCurrentEditingAppointment] = useState<Appointment | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [appointmentToDeleteId, setAppointmentToDeleteId] = useState<string | null>(null)

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesClientName = appointment.clientName.toLowerCase().includes(clientNameFilter.toLowerCase())
      const matchesPsychologistName =
        psychologistNameFilter === "all" ? true : appointment.psychologistName === psychologistNameFilter

      const appointmentDateTime = new Date(appointment.appointmentDate)
      const matchesDateRange = appointmentDateRange?.from
        ? appointmentDateTime >= appointmentDateRange.from &&
          (!appointmentDateRange.to || appointmentDateTime <= appointmentDateRange.to)
        : true

      return matchesClientName && matchesPsychologistName && matchesDateRange
    })
  }, [appointments, clientNameFilter, psychologistNameFilter, appointmentDateRange])

  const handleAddAppointment = (newAppointment: Omit<Appointment, "id">) => {
    const id = (
      appointments.length > 0 ? Math.max(...appointments.map((a) => Number.parseInt(a.id))) + 1 : 1
    ).toString()
    setAppointments((prev) => [...prev, { ...newAppointment, id }])
    setIsAddDialogOpen(false)
  }

  const handleEditAppointment = (updatedAppointment: Appointment) => {
    setAppointments((prev) => prev.map((app) => (app.id === updatedAppointment.id ? updatedAppointment : app)))
    setIsEditDialogOpen(false)
    setCurrentEditingAppointment(null)
  }

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((app) => app.id !== id))
    setIsDeleteDialogOpen(false)
    setAppointmentToDeleteId(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col items-start justify-start p-4 md:p-8 gap-6">
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-center md:text-left">Görüşme Hazırlık Sayfası</h1>
            <Button className="w-full md:w-auto" onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Yeni Randevu Ekle
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
                  <Label htmlFor="appointmentDateRange" className="mb-1">
                    Randevu Tarih Aralığı
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="appointmentDateRange"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !appointmentDateRange?.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {appointmentDateRange?.from ? (
                          appointmentDateRange.to ? (
                            <>
                              {format(appointmentDateRange.from, "PPP", { locale: tr })} -{" "}
                              {format(appointmentDateRange.to, "PPP", { locale: tr })}
                            </>
                          ) : (
                            format(appointmentDateRange.from, "PPP", { locale: tr })
                          )
                        ) : (
                          <span>Tarih Aralığı Seçin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={appointmentDateRange}
                        onSelect={setAppointmentDateRange}
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
                appointmentDateRange?.from ||
                appointmentDateRange?.to) && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setClientNameFilter("")
                      setPsychologistNameFilter("all")
                      setAppointmentDateRange(undefined)
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
              <CardTitle>Yaklaşan Randevular ve Hazırlık Notları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Danışan Adı</TableHead>
                      <TableHead className="min-w-[180px]">Randevu Günü</TableHead>
                      <TableHead className="min-w-[150px]">Psikolog</TableHead>
                      <TableHead className="min-w-[300px]">Danışanın Sıkıntıları / Görüşmek İstedikleri</TableHead>
                      <TableHead className="min-w-[300px]">Psikolog Notu</TableHead>
                      <TableHead className="min-w-[150px]">Aksiyonlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">{appointment.clientName}</TableCell>
                          <TableCell>
                            {format(new Date(appointment.appointmentDate), "PPP HH:mm", { locale: tr })}
                          </TableCell>
                          <TableCell>{appointment.psychologistName}</TableCell>
                          <TableCell className="whitespace-normal">{appointment.clientIssues}</TableCell>
                          <TableCell className="whitespace-normal">{appointment.psychologistNotes}</TableCell>
                          <TableCell className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentEditingAppointment(appointment)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <EditIcon className="h-4 w-4 mr-1" /> Düzenle
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setAppointmentToDeleteId(appointment.id)
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
                        <TableCell colSpan={6} className="text-center py-4">
                          Gösterilecek randevu bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Add Appointment Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni Randevu Ekle</DialogTitle>
                <DialogDescription>Yeni bir randevu kaydı oluşturun.</DialogDescription>
              </DialogHeader>
              <AddAppointmentForm onAddAppointment={handleAddAppointment} psychologists={mockPsychologists} />
            </DialogContent>
          </Dialog>

          {/* Edit Appointment Dialog */}
          {currentEditingAppointment && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Randevuyu Düzenle</DialogTitle>
                  <DialogDescription>Randevu bilgilerini güncelleyin.</DialogDescription>
                </DialogHeader>
                <EditAppointmentForm
                  initialData={currentEditingAppointment}
                  onUpdateAppointment={handleEditAppointment}
                  psychologists={mockPsychologists}
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
                  Bu randevu kaydı kalıcı olarak silinecektir. Bu işlemi geri alamazsınız.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => appointmentToDeleteId && handleDeleteAppointment(appointmentToDeleteId)}
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
