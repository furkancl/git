import { Header } from "@/components/header"

export default function GorusmeHazirlikPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Görüşme Hazırlık</h1>
          <p className="text-gray-600">Randevu öncesi hazırlıklar ve belgeler burada düzenlenecek.</p>
        </div>
      </main>
    </div>
  )
}
