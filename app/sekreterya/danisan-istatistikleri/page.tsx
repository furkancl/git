import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CalendarCheck, UserCheck } from "lucide-react"

// Dummy veriler
const clients = [
  { id: 1, name: "Ayşe Yılmaz", active: true },
  { id: 2, name: "Mehmet Demir", active: false },
  { id: 3, name: "Zeynep Kaya", active: true },
  { id: 4, name: "Ali Can", active: true },
  { id: 5, name: "Elif Su", active: false },
]
const appointments = [
  { id: 1, clientId: 1 },
  { id: 2, clientId: 2 },
  { id: 3, clientId: 1 },
  { id: 4, clientId: 3 },
  { id: 5, clientId: 4 },
  { id: 6, clientId: 5 },
  { id: 7, clientId: 3 },
]

export default function DanisanIstatistikleriPage() {
  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.active).length
  const totalAppointments = appointments.length

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start p-6 md:p-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Danışan İstatistikleri</h1>
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="flex items-center gap-4 p-6">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalClients}</div>
                <div className="text-gray-600 dark:text-gray-300">Toplam Danışan</div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="flex items-center gap-4 p-6">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeClients}</div>
                <div className="text-gray-600 dark:text-gray-300">Aktif Danışan</div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="flex items-center gap-4 p-6">
              <CalendarCheck className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAppointments}</div>
                <div className="text-gray-600 dark:text-gray-300">Toplam Randevu</div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Danışan Tablosu */}
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Danışan Listesi</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Ad Soyad</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Durum</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{client.name}</td>
                    <td className="px-4 py-2">
                      {client.active ? (
                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded dark:bg-green-900 dark:text-green-200">Aktif</span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded dark:bg-gray-700 dark:text-gray-300">Pasif</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
