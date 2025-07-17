import { Header } from "@/components/header"

export default function GorusmeDegerlendirmePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Görüşme Değerlendirme</h1>
          <p className="text-gray-600">Randevu sonrası değerlendirmeler ve geri bildirimler burada kaydedilecek.</p>
        </div>
      </main>
    </div>
  )
}
