import { Header } from "@/components/header"
import HesapHareketleriPage from "@/components/hesap-hareketleri-page"

export default function HesapHareketleri() {
  return (
    <div className="flex flex-col min-h-screen">
      {" "}
      {/* min-h-screen ekleyerek içeriğin en az ekran yüksekliği kadar olmasını sağla */}
      <Header />
      <main className="flex-grow">
        {" "}
        {/* overflow-hidden kaldırıldı */}
        <HesapHareketleriPage />
      </main>
    </div>
  )
}
