"use client";

import { useBilanco } from "@/hooks/use-bilanco";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Chart.js'i kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Basit Chart component'i
const SimpleChart = ({ type, data, options, height = 250 }: any) => {
  return (
    <div style={{ height, width: '100%' }}>
      <canvas id={`chart-${Math.random()}`}></canvas>
      <div className="text-center text-muted-foreground mt-4">
        Chart component yükleniyor...
      </div>
    </div>
  );
};

export default function BilancoPage() {
  const { toplamGelir, toplamGider, netBakiye, danisanGeliri, cocukGeliri, kitapGeliri, testGeliri, digerGeliri, giderKategorileri, aylikVeriler, loading, error } = useBilanco();

  // Çizgi grafiği için veri hazırla
  const lineChartData = useMemo(() => ({
    labels: (aylikVeriler || []).map(item => item.ay),
    datasets: [
      {
        label: 'Gelir',
        data: (aylikVeriler || []).map(item => item.gelir),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Gider',
        data: (aylikVeriler || []).map(item => item.gider),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Net Bakiye',
        data: (aylikVeriler || []).map(item => item.net),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  }), [aylikVeriler]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Aylık Gelir Trendi',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY',
              minimumFractionDigits: 0,
            }).format(value);
          }
        }
      }
    }
  };

  // Gelir kategorileri - Kitap Satışı her zaman gösterilecek
  const gelirKategorileri = useMemo(() => {
    const kategoriler = [
      { name: "Yetişkin Ödemeler", value: danisanGeliri, color: "#22c55e" },
      { name: "Çocuk Ödemeler", value: cocukGeliri, color: "#3b82f6" },
      { name: "Kitap Satışı", value: kitapGeliri, color: "#f59e0b" },
      { name: "Test Geliri", value: testGeliri, color: "#8b5cf6" },
      { name: "Diğer Gelirler", value: digerGeliri, color: "#ec4899" },
    ];
    
    // Kitap Satışı her zaman gösterilecek (değeri 0 olsa bile)
    return kategoriler;
  }, [danisanGeliri, cocukGeliri, kitapGeliri, testGeliri, digerGeliri]);

  // Gelir daire grafiği için veri hazırla
  const gelirDoughnutData = useMemo(() => ({
    labels: gelirKategorileri.map(kategori => kategori.name),
    datasets: [
      {
        data: gelirKategorileri.map(kategori => kategori.value),
        backgroundColor: gelirKategorileri.map(kategori => kategori.color),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }), [gelirKategorileri]);

  // Gider daire grafiği için veri hazırla
  const giderDoughnutData = useMemo(() => ({
    labels: giderKategorileri.map(kategori => kategori.name),
    datasets: [
      {
        data: giderKategorileri.map(kategori => kategori.value),
        backgroundColor: giderKategorileri.map(kategori => kategori.color),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  }), [giderKategorileri]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${new Intl.NumberFormat('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            }).format(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Hata: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Bilanço"
        description="Finansal durumun genel görünümü"
      />

      {/* Özet Kartları */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              }).format(toplamGelir)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tüm gelir kaynakları
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              }).format(toplamGider)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tüm harcamalar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Bakiye</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBakiye >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              }).format(netBakiye)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gelir - Gider
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafikler */}
      <Tabs defaultValue="gelir" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gelir">Gelir Dağılımı</TabsTrigger>
          <TabsTrigger value="gider">Gider Dağılımı</TabsTrigger>
          <TabsTrigger value="trend">Aylık Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="gelir" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Gelir Dağılımı - Liste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gelirKategorileri.map((kategori, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: kategori.color }}
                        />
                        <span className="font-medium">{kategori.name}</span>
                      </div>
                      <span className="font-bold">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        }).format(kategori.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Gelir Dağılımı - Grafik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: '300px' }}>
                  <Doughnut data={gelirDoughnutData} options={doughnutOptions} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gider" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Gider Dağılımı - Liste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {giderKategorileri.map((kategori, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: kategori.color }}
                        />
                        <span className="font-medium">{kategori.name}</span>
                      </div>
                      <span className="font-bold">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: 'TRY',
                        }).format(kategori.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Gider Dağılımı - Grafik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: '300px' }}>
                  <Doughnut data={giderDoughnutData} options={doughnutOptions} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Aylık Gelir Trendi
              </CardTitle>
            </CardHeader>
            <CardContent>
              
              <div style={{ height: '400px' }}>
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 