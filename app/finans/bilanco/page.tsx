"use client";

import { useBilanco } from "@/hooks/use-bilanco";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function BilancoPage() {
  const { toplamGelir, toplamGider, netBakiye, loading, error } = useBilanco();

  if (loading) {
    return (
      <main className="w-[85%] mx-auto px-4 py-6">
        <PageHeader title="Bilanço" description="Toplam gelir, gider ve net bakiyenizi özet olarak görüntüleyin." />
        <div className="flex items-center justify-center h-64">
          <span className="animate-spin mr-2">
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </span>
          <span className="ml-2">Veriler yükleniyor...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-[85%] mx-auto px-4 py-6">
        <PageHeader title="Bilanço" description="Toplam gelir, gider ve net bakiyenizi özet olarak görüntüleyin." />
        <div className="flex items-center justify-center h-64 text-red-600">
          Hata: {error}
        </div>
      </main>
    );
  }

  return (
    <main className="w-[85%] mx-auto px-4 py-6">
      <PageHeader title="Bilanço" description="Toplam gelir, gider ve net bakiyenizi özet olarak görüntüleyin." />
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {toplamGelir.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {toplamGider.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Bakiye</CardTitle>
            <DollarSign className={netBakiye >= 0 ? "h-4 w-4 text-green-600" : "h-4 w-4 text-red-600"} />
          </CardHeader>
          <CardContent>
            <div className={"text-2xl font-bold " + (netBakiye >= 0 ? "text-green-600" : "text-red-600") }>
              {netBakiye.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 