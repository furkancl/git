"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Save } from "lucide-react"

const mmpiSorular = [
  "Genellikle sabahları dinç uyanırım.",
  "Çoğu zaman keyifli ve mutluyum.",
  "Kolayca ağlarım.",
  "Sağlığım arkadaşlarımınki kadar iyidir.",
  "Çoğu insanın dürüst olduğuna inanırım.",
  "Bazen çok sinirli olurum.",
  "Ailem beni destekler.",
  "Hayatımdan memnunum.",
  "Bazen kendimi değersiz hissederim.",
  "Gelecek hakkında iyimserim.",
]

export default function MMPISablonuPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [danisan, setDanisan] = useState("")

  const progress = ((currentQuestion + 1) / mmpiSorular.length) * 100

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }))
  }

  const nextQuestion = () => {
    if (currentQuestion < mmpiSorular.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const saveTest = () => {
    console.log("MMPI Test Sonuçları:", { danisan, answers })
    alert("Test sonuçları kaydedildi!")
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="MMPI Test Şablonu" description="Minnesota Çok Yönlü Kişilik Envanteri" />

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Soru {currentQuestion + 1} / {mmpiSorular.length}
                </CardTitle>
                <div className="text-sm text-muted-foreground">%{Math.round(progress)} Tamamlandı</div>
              </div>
              <Progress value={progress} className="w-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg font-medium">{mmpiSorular[currentQuestion]}</div>

              <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswer} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dogru" id="dogru" />
                  <Label htmlFor="dogru">Doğru</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yanlis" id="yanlis" />
                  <Label htmlFor="yanlis">Yanlış</Label>
                </div>
              </RadioGroup>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Önceki
                </Button>

                {currentQuestion === mmpiSorular.length - 1 ? (
                  <Button onClick={saveTest}>
                    <Save className="h-4 w-4 mr-2" />
                    Testi Kaydet
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} disabled={!answers[currentQuestion]}>
                    Sonraki
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Danışan</Label>
                <p className="text-sm text-muted-foreground">Ayşe Kaya</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Test Tarihi</Label>
                <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("tr-TR")}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Süre</Label>
                <p className="text-sm text-muted-foreground">~45 dakika</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">İlerleme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tamamlanan</span>
                  <span>
                    {Object.keys(answers).length}/{mmpiSorular.length}
                  </span>
                </div>
                <Progress value={(Object.keys(answers).length / mmpiSorular.length) * 100} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Yönergeler</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Her soruyu dikkatli okuyun</li>
                <li>• Doğru veya Yanlış seçin</li>
                <li>• İlk düşüncenizi işaretleyin</li>
                <li>• Hiçbir soruyu boş bırakmayın</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
