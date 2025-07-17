import { Header } from "@/components/header"
import { GiderlerPage } from "@/components/giderler-page"

export default function Giderler() {
  return (
    <div className="flex flex-col min-h-screen">
      {" "}
      {/* min-h-screen ekleyerek içeriğin en az ekran yüksekliği kadar olmasını sağla */}
      <Header />
      <main className="flex-grow">
        {" "}
        {/* overflow-hidden kaldırıldı */}
        <GiderlerPage />
      </main>
    </div>
  )
}
