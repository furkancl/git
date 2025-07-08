"use client"

import React from "react"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormBuilder } from "@/components/form-builder"
import { CalendarDays, Clock, User, Plus, ChevronLeft, ChevronRight } from "lucide-react"

const initialSeanslar = [
  {
    id: 1,
    tarih: "2024-01-20",
    saat: "14:00",
    danisan: "Ayşe Kaya",
    tip: "Bireysel Terapi",
    durum: "Onaylandı",
    sure: "50",
  },
  {
    id: 2,
    tarih: "2024-01-21",
    saat: "16:00",
    danisan: "Mehmet Demir",
    tip: "Çift Terapisi",
    durum: "Planlandı",
    sure: "60",
  },
  {
    id: 3,
    tarih: "2024-01-22",
    saat: "10:00",
    danisan: "Zeynep Yılmaz",
    tip: "MMPI Testi",
    durum: "Beklemede",
    sure: "45",
  },
  {
    id: 4,
    tarih: "2024-01-23",
    saat: "15:30",
    danisan: "Can Özkan",
    tip: "Bireysel Terapi",
    durum: "Onaylandı",
    sure: "50",
  },
]

const formFields = [
  {
    name: "danisan",
    label: "Danışan",
    type: "select" as const,
    options: ["Ayşe Kaya", "Mehmet Demir", "Zeynep Yılmaz", "Can Özkan", "Fatma Demir"],
    required: true,
  },
  { name: "tarih", label: "Tarih", type: "date" as const, required: true },
  { name: "saat", label: "Saat", type: "text" as const, required: true, placeholder: "14:00" },
  { name: "sure", label: "Süre (dakika)", type: "number" as const, required: true, placeholder: "50" },
  {
    name: "tip",
    label: "Seans Tipi",
    type: "select" as const,
    options: ["Bireysel Terapi", "Çift Terapisi", "Aile Terapisi", "Grup Terapisi", "MMPI Testi", "SCİD Testi"],
    required: true,
  },
  {
    name: "durum",
    label: "Durum",
    type: "select" as const,
    options: ["Planlandı", "Onaylandı", "Beklemede", "İptal Edildi"],
    required: true,
  },
]

export default function SeansTakvimPage() {
  const [seanslar, setSeanslar] = useState(initialSeanslar)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedDateSessions, setSelectedDateSessions] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Seçilen tarihteki seansları filtrele
  React.useEffect(() => {
    if (selectedDate) {
      const selectedDateStr = selectedDate.toISOString().split("T")[0]
      const sessionsForDate = seanslar.filter((seans) => seans.tarih === selectedDateStr)
      setSelectedDateSessions(sessionsForDate)
    }
  }, [selectedDate, seanslar])

  // Seans olan tarihleri belirle
  const seansOlanTarihler = seanslar.map((seans) => new Date(seans.tarih))

  const getDurumColor = (durum: string) => {
    switch (durum) {
      case "Onaylandı":
        return "bg-green-100 text-green-800 border-green-200"
      case "Planlandı":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Beklemede":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "İptal Edildi":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleAddSeans = (data: any) => {
    const newId = Math.max(...seanslar.map((item) => item.id)) + 1
    setSeanslar((prev) => [...prev, { ...data, id: newId }])
    setShowForm(false)
  }

  const handleDeleteSeans = (seansId: number) => {
    setSeanslar((prev) => prev.filter((seans) => seans.id !== seansId))
  }

  // Ay değiştirme fonksiyonları
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="Randevu Takvimi" description="Seansları takvim görünümünde yönetin">
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Randevu
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Takvim */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <CalendarDays className="h-5 w-5" />
                <span>Seans Takvimi</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[120px] text-center">
                  {currentMonth.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
                </span>
                <Button variant="outline" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border w-full"
              modifiers={{
                hasSession: seansOlanTarihler,
              }}
              modifiersStyles={{
                hasSession: {
                  backgroundColor: "rgb(59 130 246 / 0.1)",
                  color: "rgb(59 130 246)",
                  fontWeight: "bold",
                  border: "2px solid rgb(59 130 246 / 0.3)",
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Seçilen Günün Seansları */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="text-base">
                  {selectedDate ? selectedDate.toLocaleDateString("tr-TR") : "Tarih Seçin"}
                </span>
              </CardTitle>
              {selectedDateSessions.length > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {selectedDateSessions.length} seans
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedDateSessions.length > 0 ? (
              <div className="space-y-3">
                {selectedDateSessions
                  .sort((a, b) => a.saat.localeCompare(b.saat))
                  .map((seans) => (
                    <div
                      key={seans.id}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-sm ${getDurumColor(seans.durum)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <div>
                            <h4 className="font-medium text-sm">{seans.danisan}</h4>
                            <p className="text-xs opacity-75">{seans.tip}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSeans(seans.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          ×
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span className="font-medium">{seans.saat}</span>
                          <span className="opacity-75">({seans.sure} dk)</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {seans.durum}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Bu tarihte seans yok</p>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Seans Ekle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seans Ekleme Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Randevu Ekle</DialogTitle>
          </DialogHeader>
          <FormBuilder
            title=""
            fields={formFields}
            onSubmit={handleAddSeans}
            onCancel={() => setShowForm(false)}
            initialData={selectedDate ? { tarih: selectedDate.toISOString().split("T")[0] } : {}}
          />
        </DialogContent>
      </Dialog>
    </main>
  )
}
