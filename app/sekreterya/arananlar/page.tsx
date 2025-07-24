"use client"

import { useState, useMemo } from "react"
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddCallerForm } from "@/components/add-caller-form"
import { EditCallerForm } from "@/components/edit-caller-form"
import { Header } from "@/components/header"

// Define Caller Type
interface Caller {
  id: string
  callerName: string
  contactMethod: "Telefon" | "E-posta" | "Web Sitesi" | "Tavsiye" | "Diğer"
  requestedPsychologist: string // "Fark Etmez" or a specific psychologist name
  issueSummary: string
  sessionType: "Bireysel" | "Çift" | "Aile" | "Çocuk" | "Grup" | "Diğer"
  contactDate: string // ISO string for consistent parsing
}

// Mock data for demonstration purposes
const initialCallers: Caller[] = [
  {
    id: "1",
    callerName: "Elif Demir",
    contactMethod: "Telefon",
    requestedPsychologist: "Dr. Elif Can",
    issueSummary: "Kaygı sorunları, panik atak eğilimi.",
    sessionType: "Bireysel",
    contactDate: "2025-07-20T10:30:00",
  },
  {
    id: "2",
    callerName: "Can Yılmaz",
    contactMethod: "Web Sitesi",
    requestedPsychologist: "Fark Etmez",
    issueSummary: "İlişki problemleri, iletişim zorlukları.",
    sessionType: "Çift",
    contactDate: "2025-07-21T14:00:00",
  },
  {
    id: "3",
    callerName: "Deniz Akın",
    contactMethod: "E-posta",
    requestedPsychologist: "Dr. Burak Aksoy",
    issueSummary: "Depresif ruh hali, motivasyon eksikliği.",
    sessionType: "Bireysel",
    contactDate: "2025-07-22T09:15:00",
  },
  {
    id: "4",
    callerName: "Aslı Kaya",
    contactMethod: "Tavsiye",
    requestedPsychologist: "Dr. Deniz Yılmaz",
    issueSummary: "Çocuklarda davranış sorunları.",
    sessionType: "Çocuk",
    contactDate: "2025-07-23T16:45:00",
  },
]

const mockPsychologists = ["Dr. Elif Can", "Dr. Burak Aksoy", "Dr. Deniz Yılmaz", "Fark Etmez"]
const contactMethods = ["Telefon", "E-posta", "Web Sitesi", "Tavsiye", "Diğer"]
const sessionTypes = ["Bireysel", "Çift", "Aile", "Çocuk", "Grup", "Diğer"]

export default function CallersPage() {
  const [callers, setCallers] = useState<Caller[]>(initialCallers)
  const [callerNameFilter, setCallerNameFilter] = useState("")
  const [psychologistFilter, setPsychologistFilter] = useState("all")
  const [contactMethodFilter, setContactMethodFilter] = useState("all")
  const [contactDateRange, setContactDateRange] = useState<DateRange | undefined>(undefined)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEditingCaller, setCurrentEditingCaller] = useState<Caller | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [callerToDeleteId, setCallerToDeleteId] = useState<string | null>(null)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [currentTransferringCaller, setCurrentTransferringCaller] = useState<Caller | null>(null)

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

  const handleAddCaller = (newCaller: Omit<Caller, "id">) => {
    const id = (callers.length > 0 ? Math.max(...callers.map((c) => Number.parseInt(c.id))) + 1 : 1).toString()
    setCallers((prev) => [...prev, { ...newCaller, id }])
    setIsAddDialogOpen(false)
  }

  const handleEditCaller = (updatedCaller: Caller) => {
    setCallers((prev) => prev.map((c) => (c.id === updatedCaller.id ? updatedCaller : c)))
    setIsEditDialogOpen(false)
    setCurrentEditingCaller(null)
  }

  const handleDeleteCaller = (id: string) => {
    setCallers((prev) => prev.filter((c) => c.id !== id))
    setIsDeleteDialogOpen(false)
    setCallerToDeleteId(null)
  }

  const handleTransferToInitialRegistration = (caller: Caller) => {
    setCurrentTransferringCaller(caller)
    setIsTransferDialogOpen(true)
  }

  const confirmTransfer = () => {
    if (currentTransferringCaller) {
      // Simulate transfer to "İlk Kayıt" page/system
      // In a real application, you would send this data to a backend
      // and then potentially redirect the user or update a different part of the app.
      console.log("Arayan bilgileri 'İlk Kayıt' sayfasına aktarıldı:", currentTransferringCaller)
      alert(
        `'${currentTransferringCaller.callerName}' adlı arayan bilgileri 'İlk Kayıt' sayfasına aktarıldı ve listeden kaldırıldı.`,
      )
      handleDeleteCaller(currentTransferringCaller.id) // Remove from callers list
      setIsTransferDialogOpen(false)
      setCurrentTransferringCaller(null)
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {/* Boşlukları kaldırmak için TableHead'ler arasına yorum satırı eklendi */}
                    <TableRow>
                      <TableHead className="min-w-[150px]">Danışan Adı</TableHead>{/* */}
                      <TableHead className="min-w-[150px]">İletişim Şekli</TableHead>{/* */}
                      <TableHead className="min-w-[150px]">İstenen Psikolog</TableHead>{/* */}
                      <TableHead className="min-w-[250px]">Sorun Detayı</TableHead>{/* */}
                      <TableHead className="min-w-[150px]">Görüşme Tipi</TableHead>{/* */}
                      <TableHead className="min-w-[180px]">Arama Tarihi</TableHead>{/* */}
                      <TableHead className="min-w-[200px]">Aksiyonlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCallers.length > 0 ? (
                      filteredCallers.map((caller) => (
                        <TableRow key={caller.id}>
                          <TableCell className="font-medium">{caller.callerName}</TableCell>{/* */}
                          <TableCell>{caller.contactMethod}</TableCell>{/* */}
                          <TableCell>{caller.requestedPsychologist}</TableCell>{/* */}
                          <TableCell className="whitespace-normal">{caller.issueSummary}</TableCell>{/* */}
                          <TableCell>{caller.sessionType}</TableCell>{/* */}
                          <TableCell>{format(new Date(caller.contactDate), "PPP HH:mm", { locale: tr })}</TableCell>{/* */}
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
                                setCallerToDeleteId(caller.id)
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
                <AlertDialogAction onClick={() => callerToDeleteId && handleDeleteCaller(callerToDeleteId)}>
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
                <AlertDialogDescription>
                  '{currentTransferringCaller?.callerName}' adlı arayanın bilgilerini ilk kayıt sayfasına aktarmak
                  istediğinizden emin misiniz? Bu işlemden sonra kayıt bu listeden kaldırılacaktır.
                  <br />
                  <br />
                  **Aktarılacak Bilgiler:**
                  <ul className="list-disc list-inside mt-2">
                    <li>**Arayan Adı:** {currentTransferringCaller?.callerName}</li>
                    <li>**İstenen Psikolog:** {currentTransferringCaller?.requestedPsychologist}</li>
                    <li>**Sorun Özeti:** {currentTransferringCaller?.issueSummary}</li>
                    <li>**Görüşme Tipi:** {currentTransferringCaller?.sessionType}</li>
                    <li>
                      **İletişim Tarihi:**{" "}
                      {currentTransferringCaller?.contactDate
                        ? format(new Date(currentTransferringCaller.contactDate), "PPP HH:mm", { locale: tr })
                        : "N/A"}
                    </li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
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