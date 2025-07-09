"use client"

import { PageHeader } from "@/components/page-header"
import { FormBuilder } from "@/components/form-builder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formFields = [
  { name: "ad_soyad", label: "Ad Soyad", type: "text" as const, required: true },
  { name: "tc_no", label: "TC Kimlik No", type: "text" as const, required: true },
  { name: "dogum_tarihi", label: "Doğum Tarihi", type: "date" as const, required: true },
  { name: "cinsiyet", label: "Cinsiyet", type: "select" as const, options: ["Kadın", "Erkek"], required: true },
  { name: "telefon", label: "Telefon", type: "text" as const, required: true },
  { name: "email", label: "E-posta", type: "text" as const },
  { name: "adres", label: "Adres", type: "textarea" as const, required: true },
  { name: "meslek", label: "Meslek", type: "text" as const },
  {
    name: "egitim_durumu",
    label: "Eğitim Durumu",
    type: "select" as const,
    options: ["İlkokul", "Ortaokul", "Lise", "Üniversite", "Yüksek Lisans", "Doktora"],
  },
  {
    name: "medeni_durum",
    label: "Medeni Durum",
    type: "select" as const,
    options: ["Bekar", "Evli", "Boşanmış", "Dul"],
  },
  { name: "acil_durum_kisi", label: "Acil Durum Kişisi", type: "text" as const, required: true },
  { name: "acil_durum_telefon", label: "Acil Durum Telefonu", type: "text" as const, required: true },
  { name: "sikayet", label: "Ana Şikayet", type: "textarea" as const, required: true },
  { name: "gecmis_tedavi", label: "Geçmiş Psikolojik Tedavi", type: "select" as const, options: ["Evet", "Hayır"] },
  { name: "ilac_kullanimi", label: "İlaç Kullanımı", type: "select" as const, options: ["Evet", "Hayır"] },
  { name: "kronik_hastalik", label: "Kronik Hastalık", type: "select" as const, options: ["Evet", "Hayır"] },
]

export default function IlkKayitPage() {
  const handleSubmit = (data: any) => {
    console.log("Yeni danışan kaydı:", data)
    alert("Danışan kaydı başarıyla oluşturuldu!")
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="İlk Kayıt" description="Yeni danışan kaydı oluşturun" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FormBuilder title="Danışan Bilgileri" fields={formFields} onSubmit={handleSubmit} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kayıt Süreci</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Kişisel Bilgiler</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span className="text-sm text-muted-foreground">İletişim Bilgileri</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span className="text-sm text-muted-foreground">Sağlık Bilgileri</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-muted rounded-full"></div>
                <span className="text-sm text-muted-foreground">Onay</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Önemli Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Tüm zorunlu alanları doldurunuz</li>
                <li>• TC Kimlik No doğru girilmelidir</li>
                <li>• Acil durum bilgileri mutlaka alınmalıdır</li>
                <li>• KVKK onayı alınmalıdır</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
