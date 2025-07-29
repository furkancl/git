"use client"

import { useState, useMemo, useEffect } from "react"
import { supabase } from "@/lib/supabase"
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
import { AddGorusmeHazirlikForm } from "@/components/add-gorusme-hazirlik-form"
import { EditGorusmeHazirlikForm } from "@/components/edit-gorusme-hazirlik-form"
import { Header } from "@/components/header"

// Define Appointment Type
interface GorusmeHazirlik {
  id: string
  client_id?: number
  client_name: string
  meeting_date: string // ISO string
  client_issues: string
  psychologist_notes: string
  psychologist_name: string
}

interface Client {
  id: number
  name: string
}

interface Psychologist {
  id: number
  name: string
}

export default function Page() {
  const [gorusmeler, setGorusmeler] = useState<GorusmeHazirlik[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  const [loading, setLoading] = useState(true)
  
  // Supabase'den danışan, psikolog ve görüşme hazırlık kayıtlarını çek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: clientData } = await supabase.from("clients").select("id, name")
      const { data: psychologistData } = await supabase.from("psychologists").select("id, name")
      const { data: hazirlikData } = await supabase
        .from("gorusme_hazirlik")
        .select("id, client_name, meeting_date, client_issues, psychologist_notes, psychologist_name")
      
      setClients(clientData || [])
      setPsychologists(psychologistData || [])
      setGorusmeler(hazirlikData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const [client_name_filter, setClientNameFilter] = useState("")
  const [psychologist_name_filter, setPsychologistNameFilter] = useState("all")
  const [appointmentDateRange, setAppointmentDateRange] = useState<DateRange | undefined>(undefined)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEditingGorusme, setCurrentEditingGorusme] = useState<GorusmeHazirlik | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [appointmentToDeleteId, setAppointmentToDeleteId] = useState<string | null>(null)

  const filteredGorusmeler = useMemo(() => {
    return gorusmeler.filter((kayit) => {
      const matchesClientName = kayit.client_name.toLowerCase().includes(client_name_filter.toLowerCase())
      const matchesPsychologistName =
        psychologist_name_filter === "all" ? true : kayit.psychologist_name === psychologist_name_filter

      const meetingDateTime = new Date(kayit.meeting_date)
      const matchesDateRange = appointmentDateRange?.from
        ? meetingDateTime >= appointmentDateRange.from &&
          (!appointmentDateRange.to || meetingDateTime <= appointmentDateRange.to)
        : true

      return matchesClientName && matchesPsychologistName && matchesDateRange
    })
  }, [gorusmeler, client_name_filter, psychologist_name_filter, appointmentDateRange])

  const handleAddGorusme = async (newGorusme: Omit<GorusmeHazirlik, "id">) => {
    const { data, error } = await supabase
      .from("gorusme_hazirlik")
      .insert([{
        client_name: newGorusme.client_name,
        meeting_date: newGorusme.meeting_date,
        client_issues: newGorusme.client_issues,
        psychologist_notes: newGorusme.psychologist_notes,
        psychologist_name: newGorusme.psychologist_name
      }])
      .select()
    
    if (!error && data && data[0]) {
      setGorusmeler((prev) => [...prev, data[0]])
      setIsAddDialogOpen(false)
    } else {
      console.error("Supabase ekleme hatası:", error)
      alert("Kayıt eklenirken hata oluştu: " + (error?.message || "Bilinmeyen hata"))
    }
  }

  const handleEditGorusme = async (updatedGorusme: GorusmeHazirlik) => {
    const { error } = await supabase
      .from("gorusme_hazirlik")
      .update({
        client_name: updatedGorusme.client_name,
        meeting_date: updatedGorusme.meeting_date,
        client_issues: updatedGorusme.client_issues,
        psychologist_notes: updatedGorusme.psychologist_notes,
        psychologist_name: updatedGorusme.psychologist_name,
      })
      .eq("id", updatedGorusme.id)
    
    if (!error) {
      setGorusmeler((prev) => prev.map((g) => (g.id === updatedGorusme.id ? updatedGorusme : g)))
      setIsEditDialogOpen(false)
      setCurrentEditingGorusme(null)
    } else {
      alert("Kayıt güncellenirken hata oluştu: " + error.message)
    }
  }

  const handleDeleteGorusme = async (id: string) => {
    const { error } = await supabase
      .from("gorusme_hazirlik")
      .delete()
      .eq("id", id)
    
    if (!error) {
      setGorusmeler((prev) => prev.filter((g) => g.id !== id))
      setIsDeleteDialogOpen(false)
      setAppointmentToDeleteId(null)
    } else {
      alert("Kayıt silinirken hata oluştu: " + error.message)
    }
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
                    id="client_name_filter"
                    placeholder="Danışan adına göre filtrele..."
                    value={client_name_filter}
                    onChange={(e) => setClientNameFilter(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="psychologistNameFilter" className="mb-1">
                    Psikolog Adı
                  </Label>
                  <Select value={psychologist_name_filter} onValueChange={setPsychologistNameFilter}>
                    <SelectTrigger id="psychologist_name_filter">
                      <SelectValue placeholder="Psikolog Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {psychologists.map((p) => (
                        <SelectItem key={p.id} value={p.name}>
                          {p.name}
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
              {(client_name_filter ||
                psychologist_name_filter !== "all" ||
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
              <CardTitle>Yaklaşan Görüşmeler ve Hazırlık Notları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Danışan Adı</TableHead>
                      <TableHead className="min-w-[180px]">Görüşme Günü</TableHead>
                      <TableHead className="min-w-[150px]">Psikolog</TableHead>
                      <TableHead className="min-w-[300px]">Danışanın Sıkıntıları / Görüşmek İstedikleri</TableHead>
                      <TableHead className="min-w-[300px]">Psikolog Notu</TableHead>
                      <TableHead className="min-w-[150px]">Aksiyonlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Yükleniyor...
                        </TableCell>
                      </TableRow>
                    ) : filteredGorusmeler.length > 0 ? (
                      filteredGorusmeler.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">{appointment.client_name}</TableCell>
                          <TableCell>
                            {format(new Date(appointment.meeting_date), "PPP HH:mm", { locale: tr })}
                          </TableCell>
                          <TableCell>{appointment.psychologist_name}</TableCell>
                          <TableCell className="whitespace-normal">{appointment.client_issues}</TableCell>
                          <TableCell className="whitespace-normal">{appointment.psychologist_notes}</TableCell>
                          <TableCell className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentEditingGorusme(appointment)
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

          {/* Görüşme Hazırlık Ekle Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni Görüşme Hazırlık Kaydı Ekle</DialogTitle>
                <DialogDescription>Yeni bir görüşme hazırlık kaydı oluşturun.</DialogDescription>
              </DialogHeader>
              <AddGorusmeHazirlikForm onAddGorusme={handleAddGorusme} psychologists={psychologists} clients={clients} />
            </DialogContent>
          </Dialog>

          {/* Görüşme Hazırlık Düzenle Dialog */}
          {currentEditingGorusme && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Görüşme Hazırlık Kaydını Düzenle</DialogTitle>
                  <DialogDescription>Görüşme hazırlık bilgilerini güncelleyin.</DialogDescription>
                </DialogHeader>
                <EditGorusmeHazirlikForm
                  initialData={currentEditingGorusme}
                  onUpdateGorusme={handleEditGorusme}
                  psychologists={psychologists}
                />
              </DialogContent>
            </Dialog>
          )}

          {/* Silme Onay Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu görüşme hazırlık kaydı kalıcı olarak silinecektir. Bu işlemi geri alamazsınız.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => appointmentToDeleteId && handleDeleteGorusme(appointmentToDeleteId)}
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