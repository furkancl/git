import { Header } from "@/components/header"
import { GelirlerPage } from "@/components/gelirler-page"

export default function Gelirler() {
  return (
    <div className="flex flex-col min-h-screen">
      {" "}
      {/* min-h-screen ekleyerek içeriğin en az ekran yüksekliği kadar olmasını sağla */}
      <Header />
      <main className="flex-grow">
        {" "}
        {/* overflow-hidden kaldırıldı */}
        <GelirlerPage />
      </main>
    </div>
  )
}
