"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { FormBuilder } from "@/components/form-builder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Clock, Calendar } from "lucide-react"

const formFields = [
  { name: "tarih", label: "Sohbet Tarihi", type: "date" as const, required: true },
  { name: "saat", label: "Saat", type: "text" as const, required: true, placeholder: "14:30" },
  {
    name: "katilimci_tipi",
    label: "Katılımcı Tipi",
    type: "select" as const,
    options: ["Bireysel", "Çift", "Aile", "Grup"],
    required: true,
  },
  { name: "katilimci_adi", label: "Katılımcı Adı", type: "text" as const, required: true },
  { name: "yas", label: "Yaş", type: "number" as const, required: true },
  {
    name: "sohbet_konusu",
    label: "Ana Sohbet Konusu",
    type: "select" as const,
    options: [
      "Anksiyete ve Stres",
      "Depresyon",
      "İlişki Sorunları",
      "Aile İçi Problemler",
      "İş Stresi",
      "Öfke Yönetimi",
      "Özgüven Eksikliği",
      "Travma",
      "Diğer",
    ],
    required: true,
  },
  { name: "detaylar", label: "Sohbet Detayları", type: "textarea" as const, required: true },
  {
    name: "duygu_durumu",
    label: "Katılımcının Duygu Durumu",
    type: "select" as const,
    options: ["Çok İyi", "İyi", "Orta", "Kötü", "Çok Kötü"],
    required: true,
  },
  { name: "oneriler", label: "Öneriler ve Tavsiyeler", type: "textarea" as const },
  {
    name: "takip_gerekli",
    label: "Takip Gerekli mi?",
    type: "select" as const,
    options: ["Evet", "Hayır"],
    required: true,
  },
  { name: "sonraki_randevu", label: "Sonraki Randevu Tarihi", type: "date" as const },
  { name: "notlar", label: "Ek Notlar", type: "textarea" as const },
]

const recentSessions = [
  {
    id: 1,
    tarih: "2024-01-15",
    katilimci: "Ayşe K.",
    konu: "Anksiyete ve Stres",
    durum: "Tamamlandı",
    sure: "45 dk",
  },
  {
    id: 2,
    tarih: "2024-01-14",
    katilimci: "Mehmet D.",
    konu: "İlişki Sorunları",
    durum: "Tamamlandı",
    sure: "60 dk",
  },
  {
    id: 3,
    tarih: "2024-01-13",
    katilimci: "Zeynep Y.",
    konu: "Özgüven Eksikliği",
    durum: "Takip Gerekli",
    sure: "50 dk",
  },
]

export default function PsikolojiSohbetleriPage() {
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (data: any) => {
    console.log("Sohbet kaydı:", data)
    alert("Sohbet kaydı başarıyla oluşturuldu!")
    setShowForm(false)
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader
        title="Psikoloji Sohbetleri Kayıt Formu"
        description="Psikoloji sohbet seanslarını kaydedin ve takip edin"
      >
        <Button onClick={() => setShowForm(true)}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Yeni Sohbet Kaydı
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {showForm ? (
            <FormBuilder
              title="Psikoloji Sohbet Kayıt Formu"
              fields={formFields}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Son Sohbet Kayıtları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{session.katilimci}</h4>
                          <p className="text-sm text-muted-foreground">{session.konu}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{session.tarih}</span>
                            <Clock className="h-3 w-3 text-muted-foreground ml-2" />
                            <span className="text-xs text-muted-foreground">{session.sure}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={session.durum === "Tamamlandı" ? "default" : "secondary"}>{session.durum}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bu Ay İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Toplam Sohbet</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ortalama Süre</span>
                <span className="font-medium">52 dk</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Takip Gerekli</span>
                <span className="font-medium text-orange-600">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tamamlanan</span>
                <span className="font-medium text-green-600">21</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popüler Konular</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Anksiyete ve Stres</span>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">İlişki Sorunları</span>
                <Badge variant="secondary">6</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">İş Stresi</span>
                <Badge variant="secondary">4</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Özgüven Eksikliği</span>
                <Badge variant="secondary">3</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hatırlatmalar</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Her sohbet sonrası kayıt tutun</li>
                <li>• Duygu durumunu not edin</li>
                <li>• Takip gereken durumları işaretleyin</li>
                <li>• Gizlilik kurallarına uyun</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
