import { Header } from "@/components/header"
import { KasaPage } from "@/components/kasa-page"

export default function Kasa() {
  return (
    <div className="flex flex-col min-h-screen">
      {" "}
      {/* min-h-screen ekleyerek içeriğin en az ekran yüksekliği kadar olmasını sağla */}
      <Header />
      <main className="flex-grow">
        {" "}
        {/* overflow-hidden kaldırıldı */}
        <KasaPage />
      </main>
    </div>
  )
}
