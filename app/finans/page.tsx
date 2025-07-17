import { Header } from "@/components/header"
import { FinansPage } from "@/components/finans-page"

export default function Finans() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <FinansPage />
      </main>
    </div>
  )
}
