"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { FormBuilder } from "@/components/form-builder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, FileText } from "lucide-react"

const formFields = [
  { name: "danisan_adi", label: "Danışan Adı", type: "text" as const, required: true },
  { name: "gorusme_tarihi", label: "Görüşme Tarihi", type: "date" as const, required: true },
  { name: "gorusme_saati", label: "Görüşme Saati", type: "text" as const, required: true, placeholder: "14:30" },
  {
    name: "gorusme_tipi",
    label: "Görüşme Tipi",
    type: "select" as const,
    options: ["İlk Görüşme", "Takip Görüşmesi", "Değerlendirme", "Test Uygulaması"],
    required: true,
  },
  { name: "onceki_gorusme_ozeti", label: "Önceki Görüşme Özeti", type: "textarea" as const },
  { name: "hedefler", label: "Bu Görüşmenin Hedefleri", type: "textarea" as const, required: true },
  {
    name: "kullanilacak_yontemler",
    label: "Kullanılacak Yöntemler",
    type: "select" as const,
    options: [
      "Bilişsel Davranışçı Terapi",
      "Psikanalitik Terapi",
      "Hümanistik Yaklaşım",
      "Gestalt Terapi",
      "EMDR",
      "Şema Terapi",
      "Aile Terapisi",
    ],
  },
  { name: "gerekli_materyaller", label: "Gerekli Materyaller", type: "textarea" as const },
  { name: "ozel_notlar", label: "Özel Notlar", type: "textarea" as const },
  {
    name: "risk_degerlendirmesi",
    label: "Risk Değerlendirmesi",
    type: "select" as const,
    options: ["Düşük Risk", "Orta Risk", "Yüksek Risk"],
    required: true,
  },
  { name: "acil_durum_plani", label: "Acil Durum Planı", type: "textarea" as const },
]

const hazirlikListesi = [
  { id: 1, item: "Danışan dosyasını gözden geçir", completed: true },
  { id: 2, item: "Önceki seans notlarını oku", completed: true },
  { id: 3, item: "Görüşme odasını hazırla", completed: false },
  { id: 4, item: "Gerekli materyalleri kontrol et", completed: false },
  { id: 5, item: "Test formlarını hazırla", completed: false },
  { id: 6, item: "Randevu saatini teyit et", completed: true },
]

export default function GorusmeHazirlikPage() {
  const [showForm, setShowForm] = useState(false)
  const [checklist, setChecklist] = useState(hazirlikListesi)

  const toggleChecklistItem = (id: number) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const handleSubmit = (data: any) => {
    console.log("Görüşme hazırlık formu:", data)
    alert("Görüşme hazırlık formu kaydedildi!")
    setShowForm(false)
  }

  const completedItems = checklist.filter((item) => item.completed).length
  const completionPercentage = (completedItems / checklist.length) * 100

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="Görüşme Hazırlık Formu" description="Görüşme öncesi hazırlık sürecini yönetin">
        <Button onClick={() => setShowForm(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Yeni Hazırlık Formu
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {showForm ? (
            <FormBuilder
              title="Görüşme Hazırlık Formu"
              fields={formFields}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Bugünün Görüşmeleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Ayşe Kaya - İlk Görüşme</h4>
                      <span className="text-sm text-muted-foreground">14:00</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Anksiyete ve panik atak şikayetleri</p>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Hazırlık tamamlandı</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Mehmet Demir - Takip Görüşmesi</h4>
                      <span className="text-sm text-muted-foreground">16:00</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Depresyon tedavisi 3. seans</p>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-600">Hazırlık devam ediyor</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hazırlık Kontrol Listesi</CardTitle>
              <div className="text-sm text-muted-foreground">
                {completedItems}/{checklist.length} tamamlandı (%{Math.round(completionPercentage)})
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="rounded"
                    />
                    <span className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hızlı Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-32 p-2 border rounded-md resize-none"
                placeholder="Görüşme öncesi notlarınızı buraya yazabilirsiniz..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Önemli Hatırlatmalar</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Danışan dosyasını önceden inceleyin</li>
                <li>• Görüşme odasının uygun olduğundan emin olun</li>
                <li>• Gerekli test materyallerini hazırlayın</li>
                <li>• Acil durum prosedürlerini gözden geçirin</li>
                <li>• Randevu saatini teyit edin</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
