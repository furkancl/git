import { Header } from "@/components/header"
import { BilancoPage } from "@/components/bilanco-page"

export default function Bilanco() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <BilancoPage />
      </main>
    </div>
  )
}
