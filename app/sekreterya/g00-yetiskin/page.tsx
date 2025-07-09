"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { FormBuilder } from "@/components/form-builder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle } from "lucide-react"

const formSections = [
  {
    title: "Kişisel Bilgiler",
    fields: [
      { name: "ad_soyad", label: "Ad Soyad", type: "text" as const, required: true },
      { name: "dogum_tarihi", label: "Doğum Tarihi", type: "date" as const, required: true },
      { name: "cinsiyet", label: "Cinsiyet", type: "select" as const, options: ["Kadın", "Erkek"], required: true },
      {
        name: "medeni_durum",
        label: "Medeni Durum",
        type: "select" as const,
        options: ["Bekar", "Evli", "Boşanmış", "Dul"],
      },
      { name: "meslek", label: "Meslek", type: "text" as const },
      {
        name: "egitim_durumu",
        label: "Eğitim Durumu",
        type: "select" as const,
        options: ["İlkokul", "Ortaokul", "Lise", "Üniversite", "Yüksek Lisans", "Doktora"],
      },
    ],
  },
  {
    title: "Başvuru Bilgileri",
    fields: [
      { name: "basvuru_tarihi", label: "Başvuru Tarihi", type: "date" as const, required: true },
      { name: "sevk_eden", label: "Sevk Eden", type: "text" as const },
      { name: "ana_sikayet", label: "Ana Şikayet", type: "textarea" as const, required: true },
      { name: "sikayet_suresi", label: "Şikayet Süresi", type: "text" as const },
      { name: "onceki_tedaviler", label: "Önceki Tedaviler", type: "textarea" as const },
    ],
  },
  {
    title: "Psikiyatrik Öykü",
    fields: [
      { name: "psikiyatrik_tani", label: "Önceki Psikiyatrik Tanı", type: "textarea" as const },
      { name: "ilac_kullanimi", label: "İlaç Kullanımı", type: "textarea" as const },
      { name: "hastane_yatisi", label: "Hastane Yatışı", type: "select" as const, options: ["Evet", "Hayır"] },
      { name: "intihar_girisimi", label: "İntihar Girişimi", type: "select" as const, options: ["Evet", "Hayır"] },
      { name: "madde_kullanimi", label: "Madde Kullanımı", type: "select" as const, options: ["Evet", "Hayır"] },
    ],
  },
  {
    title: "Aile Öyküsü",
    fields: [
      { name: "aile_psikiyatrik_oykusu", label: "Ailede Psikiyatrik Öykü", type: "textarea" as const },
      { name: "aile_yapisi", label: "Aile Yapısı", type: "textarea" as const },
      { name: "cocukluk_travmalari", label: "Çocukluk Travmaları", type: "textarea" as const },
      { name: "aile_iliskileri", label: "Aile İlişkileri", type: "textarea" as const },
    ],
  },
  {
    title: "Sosyal ve Mesleki İşlevsellik",
    fields: [
      { name: "sosyal_iliskiler", label: "Sosyal İlişkiler", type: "textarea" as const },
      { name: "is_durumu", label: "İş Durumu", type: "textarea" as const },
      { name: "hobiler", label: "Hobiler ve İlgi Alanları", type: "textarea" as const },
      { name: "destek_sistemi", label: "Sosyal Destek Sistemi", type: "textarea" as const },
    ],
  },
  {
    title: "Mental Durum Muayenesi",
    fields: [
      { name: "gorunum_davranis", label: "Görünüm ve Davranış", type: "textarea" as const },
      { name: "konusma", label: "Konuşma", type: "textarea" as const },
      { name: "duygudurum", label: "Duygudurum", type: "textarea" as const },
      { name: "dusunce_icerigi", label: "Düşünce İçeriği", type: "textarea" as const },
      { name: "algi", label: "Algı", type: "textarea" as const },
      { name: "bilissel_islevler", label: "Bilişsel İşlevler", type: "textarea" as const },
    ],
  },
]

export default function G00YetiskinPage() {
  const [currentSection, setCurrentSection] = useState(0)
  const [formData, setFormData] = useState({})
  const [completedSections, setCompletedSections] = useState<number[]>([])

  const currentFields = formSections[currentSection].fields
  const progress = ((currentSection + 1) / formSections.length) * 100

  const handleSectionSubmit = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }))
    if (!completedSections.includes(currentSection)) {
      setCompletedSections((prev) => [...prev, currentSection])
    }

    if (currentSection < formSections.length - 1) {
      setCurrentSection((prev) => prev + 1)
    } else {
      console.log("G00 Yetişkin Şablonu tamamlandı:", { ...formData, ...data })
      alert("G00 Yetişkin Değerlendirme Şablonu başarıyla tamamlandı!")
    }
  }

  const goToSection = (sectionIndex: number) => {
    setCurrentSection(sectionIndex)
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="G00-Yetişkin Şablonu" description="Yetişkin psikiyatrik değerlendirme formu" />

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{formSections[currentSection].title}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Bölüm {currentSection + 1} / {formSections.length}
                </div>
              </div>
              <Progress value={progress} className="w-full" />
            </CardHeader>
            <CardContent>
              <FormBuilder title="" fields={currentFields} onSubmit={handleSectionSubmit} initialData={formData} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Form İlerlemesi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formSections.map((section, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      index === currentSection
                        ? "bg-primary/10 border border-primary/20"
                        : completedSections.includes(index)
                          ? "bg-green-50 border border-green-200"
                          : "hover:bg-muted/50"
                    }`}
                    onClick={() => goToSection(index)}
                  >
                    <div className="flex items-center space-x-2">
                      {completedSections.includes(index) ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : index === currentSection ? (
                        <Clock className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className="text-sm font-medium">{section.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Form Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Danışan:</span>
                <p className="text-sm text-muted-foreground">Yeni Değerlendirme</p>
              </div>
              <div>
                <span className="text-sm font-medium">Tarih:</span>
                <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("tr-TR")}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Değerlendiren:</span>
                <p className="text-sm text-muted-foreground">Dr. Ahmet Yılmaz</p>
              </div>
              <div>
                <span className="text-sm font-medium">Tamamlanma:</span>
                <p className="text-sm text-muted-foreground">%{Math.round(progress)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Önemli Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Tüm bölümleri eksiksiz doldurun</li>
                <li>• Objektif gözlemlerinizi kaydedin</li>
                <li>• Danışan ifadelerini not edin</li>
                <li>• Risk faktörlerini değerlendirin</li>
                <li>• Gizlilik kurallarına uyun</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
