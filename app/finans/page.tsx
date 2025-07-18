import { Header } from "@/components/header"
import HesapHareketleriPage from "@/components/hesap-hareketleri-page"

export default function Finans() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HesapHareketleriPage />
      </main>
    </div>
  )
}
