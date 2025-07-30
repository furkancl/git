"use client";

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Users, PhoneCall } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Client {
  id: number
  name: string
  // diğer alanlar...
}

interface Caller {
  id: number
  caller_name: string
  contact_method: string
  // diğer alanlar...
}

export default function DanisanIstatistikleriPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [callers, setCallers] = useState<Caller[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: clientsData } = await supabase.from("clients").select("id, name")
      const { data: callersData } = await supabase.from("callers").select("id, caller_name, contact_method")
      setClients(clientsData || [])
      setCallers(callersData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start p-6 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Danışan İstatistikleri</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mb-10">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="flex items-center gap-4 p-6">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{clients.length}</div>
                <div className="text-gray-600 dark:text-gray-300">Toplam Danışan</div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="flex items-center gap-4 p-6">
              <PhoneCall className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{callers.length}</div>
                <div className="text-gray-600 dark:text-gray-300">Toplam Arayan</div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Arayanlar Tablosu */}
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Arayanlar Listesi</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Ad Soyad</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Bizi Nereden Buldu</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} className="text-center py-4">Yükleniyor...</td>
                  </tr>
                ) : callers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-4">Arayan kaydı yok.</td>
                  </tr>
                ) : (
                  callers.map((caller) => (
                    <tr key={caller.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{caller.caller_name}</td>
                      <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{caller.contact_method}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}