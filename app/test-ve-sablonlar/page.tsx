import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ClipboardList, Eye } from "lucide-react"

const tests = [
  {
    id: 1,
    name: "Beck Depresyon Ölçeği",
    description: "Bireydeki depresyon düzeyini ölçmek için kullanılan yaygın bir psikolojik test.",
  },
  {
    id: 2,
    name: "MMPI Kişilik Testi",
    description: "Kişilik yapısı ve psikopatolojiyi değerlendirmek için kullanılan kapsamlı bir test.",
  },
  {
    id: 3,
    name: "Çocuklar için Zeka Testi (WISC-R)",
    description: "Çocukların bilişsel yeteneklerini değerlendirmek için uygulanan standart test.",
  },
]

const templates = [
  {
    id: 1,
    name: "Seans Notu Şablonu",
    description: "Her seans sonrası hızlıca doldurulabilecek standart not şablonu.",
  },
  {
    id: 2,
    name: "Danışan Bilgi Formu",
    description: "Danışan kaydı sırasında kullanılan temel bilgi toplama formu.",
  },
]

export default function TestVeSablonlarPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start p-6 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Test ve Şablonlar</h1>
        {/* Testler */}
        <section className="w-full max-w-5xl mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-blue-500" /> Testler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <Card key={test.id} className="dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-xl">
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                  <FileText className="h-6 w-6 text-purple-500" />
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{test.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700 dark:text-gray-200 pb-4">
                  <p className="mb-4 text-sm">{test.description}</p>
                  <Button variant="outline" className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4" /> Görüntüle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        {/* Şablonlar */}
        <section className="w-full max-w-5xl">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-green-500" />Şablonlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-xl">
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                  <ClipboardList className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">{tpl.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700 dark:text-gray-200 pb-4">
                  <p className="mb-4 text-sm">{tpl.description}</p>
                  <Button variant="outline" className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4" /> Görüntüle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
} 