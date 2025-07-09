export default function SimpleTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Basit Test Sayfası</h1>
      <p>Bu sayfa çalışıyorsa, temel React ve Next.js kurulumu başarılı demektir.</p>
      
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <h2 className="font-semibold">CSV Veri Testi</h2>
        <p>CSV dosyalarınızın doğru yüklendiğini kontrol etmek için:</p>
        <ul className="list-disc list-inside mt-2">
          <li>/test-csv sayfasını ziyaret edin</li>
          <li>/finans/danisan-odemeleri sayfasını kontrol edin</li>
          <li>/finans/giderler sayfasını kontrol edin</li>
        </ul>
      </div>
    </div>
  )
} 