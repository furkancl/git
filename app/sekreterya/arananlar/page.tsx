"use client"

import { AlertDialogTitle } from "@/components/ui/alert-dialog"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { PlusIcon, CalendarIcon, EditIcon, Trash2Icon, ArrowRightIcon } from "lucide-react"
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
import { AddCallerForm } from "@/components/add-caller-form"
import { EditCallerForm } from "@/components/edit-caller-form"
import { Header } from "@/components/header"
import { supabase } from "@/lib/supabase" // Supabase istemcisini içe aktar
import { toast } from "sonner"

// Arayan Tipini Tanımla - id'yi number olarak güncelledik
interface Caller {
  id: string
  callerName: string
  contactMethod: "Telefon" | "E-posta" | "Web Sitesi" | "Tavsiye" | "Diğer"
  requestedPsychologist: string // "Fark Etmez" veya belirli bir psikolog adı
  issueSummary: string
  sessionType: "Bireysel" | "Çift" | "Aile" | "Çocuk" | "Grup" | "Diğer"
  contactDate: string // Tutarlı ayrıştırma için ISO string
}

// Psikologlar, İletişim Yöntemleri ve Seans Tipleri için statik veriler
const mockPsychologists = ["Dr. Elif Can", "Dr. Burak Aksoy", "Dr. Deniz Yılmaz", "Fark Etmez"]
const contactMethods = ["Telefon", "E-posta", "Web Sitesi", "Tavsiye", "Diğer"]
const sessionTypes = ["Bireysel", "Çift", "Aile", "Çocuk", "Grup", "Diğer"]

export default function CallersPage() {
  const [callers, setCallers] = useState<Caller[]>([]) // Boş dizi ile başlat
  const [loading, setLoading] = useState(true) // Yükleme durumu eklendi
  const [error, setError] = useState<string | null>(null) // Hata durumu eklendi

  const [callerNameFilter, setCallerNameFilter] = useState("")
  const [psychologistFilter, setPsychologistFilter] = useState("all")
  const [contactMethodFilter, setContactMethodFilter] = useState("all")
  const [contactDateRange, setContactDateRange] = useState<DateRange | undefined>(undefined)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEditingCaller, setCurrentEditingCaller] = useState<Caller | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [callerToDeleteId, setCallerToDeleteId] = useState<number | null>(null) // number olarak değiştirildi
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [currentTransferringCaller, setCurrentTransferringCaller] = useState<Caller | null>(null)

  // Supabase'den arayanları getirme fonksiyonu
  const fetchCallers = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from("callers").select("*").order("contact_date", { ascending: false })

    if (error) {
      console.error("Arayanlar getirilirken hata oluştu:", error)
      setError("Arayanlar yüklenirken bir hata oluştu.")
      setCallers([])
    } else {
      // Supabase'den gelen snake_case veriyi Caller arayüzüne uygun camelCase'e dönüştür
      const mappedData: Caller[] = data.map((item: any) => ({
        id: item.id,
        callerName: item.caller_name,
        contactMethod: item.contact_method,
        requestedPsychologist: item.requested_psychologist,
        issueSummary: item.issue_summary,
        sessionType: item.session_type,
        contactDate: item.contact_date, // Supabase ISO string döndürür
      }))
      setCallers(mappedData)
    }
    setLoading(false)
  }, [])

  // Bileşen yüklendiğinde verileri getir
  useEffect(() => {
    fetchCallers()
  }, [fetchCallers])

  const filteredCallers = useMemo(() => {
    return callers.filter((caller) => {
      const matchesCallerName = caller.callerName.toLowerCase().includes(callerNameFilter.toLowerCase())
      const matchesPsychologist =
        psychologistFilter === "all" ? true : caller.requestedPsychologist === psychologistFilter
      const matchesContactMethod = contactMethodFilter === "all" ? true : caller.contactMethod === contactMethodFilter

      const contactDateTime = new Date(caller.contactDate)
      const matchesDateRange = contactDateRange?.from
        ? contactDateTime >= contactDateRange.from && (!contactDateRange.to || contactDateTime <= contactDateRange.to)
        : true

      return matchesCallerName && matchesPsychologist && matchesContactMethod && matchesDateRange
    })
  }, [callers, callerNameFilter, psychologistFilter, contactMethodFilter, contactDateRange])

  const handleAddCaller = async (newCaller: Omit<Caller, "id">) => {
    const { data, error } = await supabase.from("callers").insert({
      caller_name: newCaller.callerName,
      contact_method: newCaller.contactMethod,
      requested_psychologist: newCaller.requestedPsychologist,
      issue_summary: newCaller.issueSummary,
      session_type: newCaller.sessionType,
      contact_date: new Date(newCaller.contactDate).toISOString(), // ISO string olduğundan emin ol
    })

    if (error) {
      toast.error("Arayan eklenirken hata oluştu!", {
        description: error.message || "Arayan eklenirken bir hata oluştu.",
        duration: 4000,
      })
    } else {
      toast.success("Arayan başarıyla eklendi!", {
        description: newCaller.callerName + " kaydı eklendi.",
      })
      fetchCallers() // Listeyi güncellemek için verileri yeniden getir
      setIsAddDialogOpen(false)
    }
  }

  const handleEditCaller = async (updatedCaller: Caller) => {
    const { data, error } = await supabase
      .from("callers")
      .update({
        caller_name: updatedCaller.callerName,
        contact_method: updatedCaller.contactMethod,
        requested_psychologist: updatedCaller.requestedPsychologist,
        issue_summary: updatedCaller.issueSummary,
        session_type: updatedCaller.sessionType,
        contact_date: new Date(updatedCaller.contactDate).toISOString(), // ISO string olduğundan emin ol
      })
      .eq("id", updatedCaller.id)

    if (error) {
      toast.error("Arayan güncellenirken hata oluştu!", {
        description: error.message || "Arayan güncellenirken bir hata oluştu.",
        duration: 4000,
      })
    } else {
      toast.success("Arayan başarıyla güncellendi!", {
        description: updatedCaller.callerName + " kaydı güncellendi.",
      })
      fetchCallers() // Listeyi güncellemek için verileri yeniden getir
      setIsEditDialogOpen(false)
      setCurrentEditingCaller(null)
    }
  }

  const handleDeleteCaller = async (id: number) => {
    // id'yi number olarak değiştirdik
    const { error } = await supabase.from("callers").delete().eq("id", id)

    if (error) {
      toast.error("Arayan silinirken hata oluştu!", {
        description: error.message || "Arayan silinirken bir hata oluştu.",
        duration: 4000,
      })
    } else {
      toast.info("Arayan başarıyla silindi!", {
        description: "Kayıt silindi.",
      })
      fetchCallers() // Listeyi güncellemek için verileri yeniden getir
      setIsDeleteDialogOpen(false)
      setCallerToDeleteId(null)
    }
  }

  const handleTransferToInitialRegistration = (caller: Caller) => {
    setCurrentTransferringCaller(caller)
    setIsTransferDialogOpen(true)
  }

  const confirmTransfer = async () => {
    if (currentTransferringCaller) {
      // 1. Arayanı 'clients' tablosuna ekle
      const { error: insertError } = await supabase.from("clients").insert({
        name: currentTransferringCaller.callerName,
        phone: "", // Arayan kaydında telefon yoksa boş bırak
        email: "", // Arayan kaydında e-posta yoksa boş bırak
        psychologist_id:
          currentTransferringCaller.requestedPsychologist && currentTransferringCaller.requestedPsychologist !== "Fark Etmez"
            ? null // Burada psikolog id eşlemesi yapılabilir, şimdilik null
            : null,
        registration_date: currentTransferringCaller.contactDate,
      })
      // 2. Başarılıysa arayanı sil
      if (insertError) {
        toast.error("Arayan aktarılırken hata oluştu!", {
          description: insertError.message || "Arayan aktarılırken bir hata oluştu.",
          duration: 4000,
        })
        return
      }
      const { error: deleteError } = await supabase.from("callers").delete().eq("id", currentTransferringCaller.id)
      if (deleteError) {
        toast.error("Arayan aktarılırken ve silinirken hata oluştu!", {
          description: deleteError.message || "Arayan aktarılırken ve silinirken bir hata oluştu.",
          duration: 4000,
        })
      } else {
        toast.success("Arayan aktarıldı!", {
          description: `'${currentTransferringCaller.callerName}' adlı arayan bilgileri 'İlk Kayıt' sayfasına aktarıldı ve listeden kaldırıldı.`,
        })
        fetchCallers() // Listeyi güncellemek için verileri yeniden getir
        setIsTransferDialogOpen(false)
        setCurrentTransferringCaller(null)
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col items-start justify-start p-4 md:p-8 gap-6">
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-center md:text-left">Arayanlar Sayfası</h1>
            <Button className="w-full md:w-auto" onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Yeni Arayan Ekle
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filtreler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="callerNameFilter" className="mb-1">
                    Arayan Adı
                  </Label>
                  <Input
                    id="callerNameFilter"
                    placeholder="Arayan adına göre filtrele..."
                    value={callerNameFilter}
                    onChange={(e) => setCallerNameFilter(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="psychologistFilter" className="mb-1">
                    İstenen Psikolog
                  </Label>
                  <Select value={psychologistFilter} onValueChange={setPsychologistFilter}>
                    <SelectTrigger id="psychologistFilter">
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
                  <Label htmlFor="contactMethodFilter" className="mb-1">
                    İletişim Şekli
                  </Label>
                  <Select value={contactMethodFilter} onValueChange={setContactMethodFilter}>
                    <SelectTrigger id="contactMethodFilter">
                      <SelectValue placeholder="İletişim Şekli Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {contactMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="lg:col-span-1 sm:col-span-2">
                  <Label htmlFor="contactDateRange" className="mb-1">
                    Arama Tarih Aralığı
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="contactDateRange"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !contactDateRange?.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contactDateRange?.from ? (
                          contactDateRange.to ? (
                            <>
                              {format(contactDateRange.from, "PPP", { locale: tr })} -{" "}
                              {format(contactDateRange.to, "PPP", { locale: tr })}
                            </>
                          ) : (
                            format(contactDateRange.from, "PPP", { locale: tr })
                          )
                        ) : (
                          <span>Tarih Aralığı Seçin</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={contactDateRange}
                        onSelect={setContactDateRange}
                        numberOfMonths={2}
                        initialFocus
                        locale={tr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {(callerNameFilter ||
                psychologistFilter !== "all" ||
                contactMethodFilter !== "all" ||
                contactDateRange?.from ||
                contactDateRange?.to) && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCallerNameFilter("")
                      setPsychologistFilter("all")
                      setContactMethodFilter("all")
                      setContactDateRange(undefined)
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
              <CardTitle>Arayan Kayıtları</CardTitle>
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
                        <TableHead className="min-w-[150px]">İletişim Şekli</TableHead>
                        <TableHead className="min-w-[150px]">İstenen Psikolog</TableHead>
                        <TableHead className="min-w-[250px]">Sorun Detayı</TableHead>
                        <TableHead className="min-w-[150px]">Görüşme Tipi</TableHead>
                        <TableHead className="min-w-[180px]">Arama Tarihi</TableHead>
                        <TableHead className="min-w-[200px]">Aksiyonlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCallers.length > 0 ? (
                        filteredCallers.map((caller) => (
                          <TableRow key={caller.id}>
                            <TableCell className="font-medium">{caller.callerName}</TableCell>
                            <TableCell>{caller.contactMethod}</TableCell>
                            <TableCell>{caller.requestedPsychologist}</TableCell>
                            <TableCell className="whitespace-normal">{caller.issueSummary}</TableCell>
                            <TableCell>{caller.sessionType}</TableCell>
                            <TableCell>{format(new Date(caller.contactDate), "PPP HH:mm", { locale: tr })}</TableCell>
                            <TableCell className="flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCurrentEditingCaller(caller)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <EditIcon className="h-4 w-4 mr-1" /> Düzenle
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setCallerToDeleteId(Number(caller.id))
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2Icon className="h-4 w-4 mr-1" /> Sil
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleTransferToInitialRegistration(caller)}
                              >
                                <ArrowRightIcon className="h-4 w-4 mr-1" /> İlk Kayıta Aktar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Gösterilecek arayan kaydı bulunamadı.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Caller Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni Arayan Ekle</DialogTitle>
                <DialogDescription>Yeni bir arayan kaydı oluşturun.</DialogDescription>
              </DialogHeader>
              <AddCallerForm
                onAddCaller={handleAddCaller}
                psychologists={mockPsychologists}
                contactMethods={contactMethods}
                sessionTypes={sessionTypes}
              />
            </DialogContent>
          </Dialog>

          {/* Edit Caller Dialog */}
          {currentEditingCaller && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Arayanı Düzenle</DialogTitle>
                  <DialogDescription>Arayan bilgilerini güncelleyin.</DialogDescription>
                </DialogHeader>
                <EditCallerForm
                  initialData={currentEditingCaller}
                  onUpdateCaller={handleEditCaller}
                  psychologists={mockPsychologists}
                  contactMethods={contactMethods}
                  sessionTypes={sessionTypes}
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
                  Bu arayan kaydı kalıcı olarak silinecektir. Bu işlemi geri alamazsınız.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={() => callerToDeleteId !== null && handleDeleteCaller(callerToDeleteId)}>
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Transfer to Initial Registration Dialog */}
          <AlertDialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Arayanı İlk Kayıta Aktar</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogDescription asChild>
                <div>
                  '{currentTransferringCaller?.callerName}' adlı arayanın bilgilerini ilk kayıt sayfasına aktarmak
                  istediğinizden emin misiniz? Bu işlemden sonra kayıt bu listeden kaldırılacaktır.
                  <br />
                  <br />
                  <strong>Aktarılan Bilgiler:</strong>
                  <ul className="list-disc list-inside mt-2">
                    <li><strong>Arayan Adı:</strong> {currentTransferringCaller?.callerName}</li>
                    <li><strong>İstenen Psikolog:</strong> {currentTransferringCaller?.requestedPsychologist}</li>
                    <li><strong>Sorun Özeti:</strong> {currentTransferringCaller?.issueSummary}</li>
                    <li><strong>Görüşme Tipi:</strong> {currentTransferringCaller?.sessionType}</li>
                    <li>
                      <strong>İletişim Tarihi:</strong>{" "}
                      {currentTransferringCaller?.contactDate
                        ? format(new Date(currentTransferringCaller.contactDate), "PPP HH:mm", { locale: tr })
                        : "N/A"}
                    </li>
                  </ul>
                </div>
              </AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={confirmTransfer}>Onayla ve Aktar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  )
}
