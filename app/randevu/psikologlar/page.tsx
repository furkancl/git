"use client"; // Bu satır, useEffect ve useState gibi hook'ları kullanmak için ZORUNLUDUR!

import { Header } from "@/components/header";
import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Trash2, UserPlus, Search, CalendarIcon, Loader2, Users, CalendarCheck, DollarSign } from "lucide-react"; // Mail ve Phone ikonları kaldırıldı
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { tr } from "date-fns/locale"; // Türkçe lokalizasyon için
import type { DateRange } from "react-day-picker";
import { supabase } from "@/lib/supabase"; // Supabase import'u

// Supabase tablolarınıza uygun olarak tipleri güncelliyoruz
// Psychologist tipinden email ve phone kaldırıldı
type Psychologist = {
  id: string; // Supabase UUID'leri string olur
  name: string;
  created_at?: string; // Supabase'den gelecek
};

type Appointment = {
  id: string; // Supabase UUID'leri string olur
  psychologist_id: string; // Foreign Key de UUID
  appointment_date: string; // Supabase'den string olarak gelir, Date objesine çevireceğiz
  description: string;
  created_at?: string; // Supabase'den gelecek
};

// Sabit seans ücreti (örnek olarak)
const SESSION_FEE = 500; // TL

export default function PsychologistsPage() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Randevuları da Supabase'den çekeceğiz
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState<Psychologist | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Yükleme durumu
  const [error, setError] = useState<string | null>(null); // Hata durumu
  const [isSaving, setIsSaving] = useState(false); // Kaydetme sırasında yükleme
  const [isDeleting, setIsDeleting] = useState(false); // Silme sırasında yükleme
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [psychologistToDelete, setPsychologistToDelete] = useState<Psychologist | null>(null);

  // Form state - sadece name kaldı
  const [formName, setFormName] = useState("");

  // Tarih aralığı filtresi
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Verileri Supabase'den çekmek için fonksiyon
  const fetchPsychologistsAndAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Psikologları çek
      const { data: psychData, error: psychError } = await supabase
        .from("psychologists")
        .select("id, name, created_at"); // Sadece var olan sütunları seçiyoruz
      if (psychError) throw psychError;
      setPsychologists(psychData || []);

      // Randevuları çek
      const { data: apptData, error: apptError } = await supabase
        .from("appointments")
        .select("*");
      if (apptError) throw apptError;
      setAppointments(apptData || []);

    } catch (err: any) {
      console.error("Veri çekme hatası:", err.message);
      setError("Veriler yüklenirken bir hata oluştu: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bileşen yüklendiğinde verileri çek
  useEffect(() => {
    fetchPsychologistsAndAppointments();
  }, [fetchPsychologistsAndAppointments]);

  // Tarih aralığına göre filtrelenmiş randevular
  const filteredAppointmentsByDate = useMemo(() => {
    if (appointments.length === 0) return [];
    if (!dateRange?.from) {
      // Randevu tarihlerini Date objesine çevirerek döndür (görüntüleme için)
      return appointments.map(appt => ({
        ...appt,
        date: new Date(appt.appointment_date)
      }));
    }

    const start = startOfDay(dateRange.from);
    const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

    return appointments
      .filter((appt) => {
        const apptDate = new Date(appt.appointment_date); // Supabase'den gelen string tarihi Date objesine çevir
        return isWithinInterval(apptDate, { start, end });
      })
      .map(appt => ({ // Randevu objelerine `date` alanını ekle (kendi yapınız için)
        ...appt,
        date: new Date(appt.appointment_date)
      }));
  }, [appointments, dateRange]);

  // Filtreli psikolog listesi (arama terimine göre)
  const filteredPsychologists = useMemo(() => {
    if (!searchTerm) return psychologists;
    return psychologists.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [psychologists, searchTerm]);

  // Seçili psikoloğun son randevusu (tarih filtresine göre)
  const lastAppointment = useMemo(() => {
    if (!selectedPsychologist) return null;
    const psychAppointments = filteredAppointmentsByDate.filter((a) => a.psychologist_id === selectedPsychologist.id);
    if (psychAppointments.length === 0) return null;
    // `date` alanı zaten Date objesi olduğu için doğrudan sıralayabiliriz
    return psychAppointments.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  }, [selectedPsychologist, filteredAppointmentsByDate]);

  // Seçili psikoloğun bir sonraki randevusu (tarih filtresine göre)
  const nextAppointment = useMemo(() => {
    if (!selectedPsychologist) return null;
    const now = new Date();
    const psychAppointments = filteredAppointmentsByDate.filter(
      (a) => a.psychologist_id === selectedPsychologist.id && a.date > now,
    );
    if (psychAppointments.length === 0) return null;
    // `date` alanı zaten Date objesi olduğu için doğrudan sıralayabiliriz
    return psychAppointments.sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  }, [selectedPsychologist, filteredAppointmentsByDate]);

  // Seçili psikoloğun danışanları (tarih filtresine göre)
  const filteredClients = useMemo(() => {
    if (!selectedPsychologist) return [];
    const psychAppointments = filteredAppointmentsByDate.filter((a) => a.psychologist_id === selectedPsychologist.id);
    // Gerçek danışan verisi olmadığı için dummy olarak appointment description kullanabiliriz
    // Ya da randevu tablonuzda 'client_name' gibi bir alan varsa onu kullanın.
    const clientNames = psychAppointments.map((appt) => appt.description || `Randevu ID: ${appt.id}`);
    const uniqueClients = Array.from(new Set(clientNames)); // Tekrar eden isimleri kaldır
    return uniqueClients;
  }, [selectedPsychologist, filteredAppointmentsByDate]);

  // Toplam randevu sayısı ve gelir (tarih filtresine göre)
  const totalAppointmentsCount = useMemo(() => filteredAppointmentsByDate.length, [filteredAppointmentsByDate]);
  const totalIncome = useMemo(() => totalAppointmentsCount * SESSION_FEE, [totalAppointmentsCount]);

  // Her psikolog için seans sayısı ve gelir (tarih filtresine göre)
  const psychologistStats = useMemo(() => {
    const stats: { [key: string]: { appointmentCount: number; income: number } } = {}; // id artık string
    psychologists.forEach((psych) => {
      const psychAppointments = filteredAppointmentsByDate.filter((appt) => appt.psychologist_id === psych.id);
      stats[psych.id] = {
        appointmentCount: psychAppointments.length,
        income: psychAppointments.length * SESSION_FEE,
      };
    });
    return stats;
  }, [psychologists, filteredAppointmentsByDate]);

  // Modal açıldığında formu doldur
  useEffect(() => {
    if (isEditing && selectedPsychologist) {
      setFormName(selectedPsychologist.name);
    } else {
      setFormName("");
    }
  }, [isEditing, selectedPsychologist]);

  // Ekle/düzenle işlemi
  const handleSave = async () => {
    if (!formName.trim()) { // Sadece name kontrolü
      toast.error("Gerekli Alanlar Eksik!", {
        description: "Lütfen Ad Soyad alanını doldurun.",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && selectedPsychologist) {
        // Psikolog güncelleme - sadece name güncelleniyor
        const { data, error } = await supabase
          .from("psychologists")
          .update({ name: formName })
          .eq("id", selectedPsychologist.id)
          .select("id, name, created_at") // Sadece var olan sütunları seçiyoruz
          .single();
        if (error) throw error;

        // State'i güncellenen veriyle senkronize et
        setPsychologists((prev) =>
          prev.map((p) => (p.id === selectedPsychologist.id ? (data as Psychologist) : p))
        );
        setSelectedPsychologist(data as Psychologist); // Seçili psikoloğu güncel data ile tazele
        
        toast.success("Psikolog Başarıyla Güncellendi!", {
          description: `${formName} bilgileri güncellendi.`,
          duration: 3000,
        });
      } else {
        // Yeni psikolog ekleme - sadece name ekleniyor
        const { data, error } = await supabase
          .from("psychologists")
          .insert({ name: formName })
          .select("id, name, created_at") // Sadece var olan sütunları seçiyoruz
          .single();
        if (error) throw error;

        setPsychologists((prev) => [...prev, (data as Psychologist)]);
        
        toast.success("Yeni Psikolog Eklendi!", {
          description: `${formName} sisteme başarıyla eklendi.`,
          duration: 3000,
        });
      }
      setIsAddModalOpen(false);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Kaydetme hatası:", err.message);
      toast.error("Hata!", { 
        description: "Kaydetme sırasında bir hata oluştu: " + err.message,
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Silme onaylama işlemi
  const confirmDeletePsychologist = (psychologist: Psychologist) => {
    setPsychologistToDelete(psychologist);
    setShowDeleteConfirm(true);
  };

  // Silme işlemi
  const handleDeletePsychologist = async () => {
    if (!psychologistToDelete) {
      toast.error("Silinecek psikolog bulunamadı");
      setShowDeleteConfirm(false);
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("psychologists")
        .delete()
        .eq("id", psychologistToDelete.id);
      if (error) throw error;

      // Update local state
      setPsychologists((prev) => prev.filter((p) => p.id !== psychologistToDelete.id));
      
      // Seçili psikolog silinirse seçimi sıfırla
      if (selectedPsychologist?.id === psychologistToDelete.id) {
        setSelectedPsychologist(null);
      }
      
      // Close the dialog and reset state
      setShowDeleteConfirm(false);
      setPsychologistToDelete(null);
      
      // Show success message
      toast.success("Psikolog Başarıyla Silindi!", {
        description: `${psychologistToDelete.name} sistemden kaldırıldı.`,
        duration: 3000,
      });
    } catch (err: any) {
      console.error("Silme hatası:", err.message);
      toast.error("Hata!", { 
        description: "Silme sırasında bir hata oluştu: " + err.message,
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">Veriler yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <p className="text-red-500 text-xl font-semibold">Hata oluştu!</p>
        <p className="mt-2 text-slate-700 dark:text-slate-300">{error}</p>
        <Button onClick={fetchPsychologistsAndAppointments} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main className="flex flex-col md:flex-row gap-8 p-6 md:p-8 max-w-7xl mx-auto">
        {/* Sol Panel: Psikolog Listesi */}
        <div className="w-full md:w-80 flex-shrink-0">
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-blue-500/10 dark:shadow-slate-900/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Psikologlar
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  onClick={() => {
                    setIsAddModalOpen(true);
                    setIsEditing(false);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Arama Kutusu */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Psikolog ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 focus:bg-white dark:focus:bg-slate-700 transition-all duration-300 rounded-xl"
                />
              </div>

              <ScrollArea className="h-[400px] md:h-[calc(100vh-300px)]">
                <div className="space-y-2">
                  {filteredPsychologists.length === 0 ? (
                    <p className="text-center text-slate-400 py-8">Psikolog bulunamadı.</p>
                  ) : (
                    filteredPsychologists.map((psych) => (
                      <div
                        key={psych.id}
                        onClick={() => {
                          if (selectedPsychologist?.id === psych.id) {
                            setSelectedPsychologist(null);
                          } else {
                            setSelectedPsychologist(psych);
                          }
                        }}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedPsychologist?.id === psych.id
                            ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/30 shadow-lg"
                            : "bg-white/40 dark:bg-slate-700/40 hover:bg-white/60 dark:hover:bg-slate-700/60 border border-slate-200/30 dark:border-slate-600/30 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-slate-800 dark:text-slate-100 mb-2">
                              {psych.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Panel: Detaylar */}
        <div className="flex-1">
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/80 border-0 shadow-2xl shadow-blue-500/10 dark:shadow-slate-900/20 h-full">
            <CardHeader className="pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  {selectedPsychologist ? selectedPsychologist.name : "Genel İstatistikler"}
                </CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 hover:bg-white dark:hover:bg-slate-700 rounded-xl"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange?.from
                        ? dateRange.to
                          ? `${format(dateRange.from, "dd MMM", { locale: tr })} - ${format(
                              dateRange.to,
                              "dd MMM",
                              { locale: tr },
                            )}`
                          : format(dateRange.from, "dd MMM yyyy", { locale: tr })
                        : "Tarih Aralığı Seç"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {selectedPsychologist ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Sol: Genel Bilgiler */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/60 to-blue-50/60 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-200/30 dark:border-slate-600/30">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Psikolog Bilgileri
                      </h3>
                      <div className="space-y-3">
                        {/* Sadece isim gösteriliyor, email/phone yok */}
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                          {/* İkonlar kaldırıldı */}
                          <span>{selectedPsychologist.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                          <CalendarCheck className="h-5 w-5 text-gray-500" />
                          <span>Kayıt Tarihi: {new Date(selectedPsychologist.created_at || '').toLocaleDateString("tr-TR")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsEditing(true);
                            setIsAddModalOpen(true);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirmDeletePsychologist(selectedPsychologist)}
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl"
                          disabled={isDeleting} // Silme sırasında butonu devre dışı bırak
                        >
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                          {isDeleting ? "Siliniyor..." : "Sil"}
                        </Button>
                      </div>
                    </div>

                    {/* Danışanlar */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-white/60 to-green-50/60 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-200/30 dark:border-slate-600/30">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Danışanlar ({filteredClients.length})
                      </h3>
                      {filteredClients.length === 0 ? (
                        <p className="text-slate-400">Bu tarih aralığında danışan bulunamadı.</p>
                      ) : (
                        <div className="space-y-2">
                          {filteredClients.slice(0, 5).map((client, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              {client}
                            </div>
                          ))}
                          {filteredClients.length > 5 && (
                            <p className="text-xs text-slate-400 mt-2">+{filteredClients.length - 5} daha...</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sağ: Randevular ve İstatistikler */}
                  <div className="space-y-6">
                    {/* İstatistik Kartları */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-200/30 dark:border-blue-800/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Toplam Seans</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {psychologistStats[selectedPsychologist.id]?.appointmentCount || 0}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-200/30 dark:border-green-800/30">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Toplam Gelir</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {(psychologistStats[selectedPsychologist.id]?.income || 0).toLocaleString()} ₺
                        </p>
                      </div>
                    </div>

                    {/* Randevu Kartları */}
                    <div className="space-y-4">
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-white/60 to-purple-50/60 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-200/30 dark:border-slate-600/30">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Son Randevu</h4>
                        {lastAppointment ? (
                          <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">Tarih:</span> {new Date(lastAppointment.appointment_date).toLocaleDateString("tr-TR")}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">Açıklama:</span> {lastAppointment.description}
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">Bu tarih aralığında son randevu bulunamadı.</p>
                        )}
                      </div>

                      <div className="p-6 rounded-2xl bg-gradient-to-br from-white/60 to-orange-50/60 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-200/30 dark:border-slate-600/30">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Sonraki Randevu</h4>
                        {nextAppointment ? (
                          <div className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">Tarih:</span> {new Date(nextAppointment.appointment_date).toLocaleDateString("tr-TR")}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium">Açıklama:</span> {nextAppointment.description}
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-400 text-sm">Bu tarih aralığında sonraki randevu bulunamadı.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-12 py-8">
                  {/* Genel İstatistikler */}
                  <div className="text-center space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        Genel İstatistikler
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400">
                        Tüm psikologların ve randevuların performans özeti
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-600/10 to-indigo-600/10 border-2 border-blue-200/30 dark:border-blue-800/30 shadow-xl backdrop-blur-sm">
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Toplam Randevu</p>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                          {totalAppointmentsCount}
                        </p>
                      </div>

                      <div className="p-8 rounded-3xl bg-gradient-to-br from-green-500/10 via-green-600/10 to-emerald-600/10 border-2 border-green-200/30 dark:border-green-800/30 shadow-xl backdrop-blur-sm">
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Toplam Gelir</p>
                        <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                          {totalIncome.toLocaleString()} ₺
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Psikolog Bazında İstatistikler */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                        Psikolog Değerlemesi
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400">
                        Her psikologun tarih aralığına göre seans ve gelir istatistikleri
                      </p>
                    </div>

                    <div className="grid gap-4 max-w-4xl mx-auto">
                      {psychologists.map((psych) => (
                        <div
                          key={psych.id}
                          className="p-6 rounded-2xl bg-gradient-to-r from-white/60 to-slate-50/60 dark:from-slate-700/60 dark:to-slate-800/60 border border-slate-200/30 dark:border-slate-600/30 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {psych.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                                  {psych.name}
                                </h4>
                                {/* Email/Phone burada gösterilmiyor */}
                              </div>
                            </div>

                            <div className="flex gap-6 text-sm">
                              <div className="text-center">
                                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                                  <Users className="h-4 w-4" />
                                  {psychologistStats[psych.id]?.appointmentCount || 0} Seans
                                </div>
                                <div className="text-center mt-1">
                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                                        {(psychologistStats[psych.id]?.income || 0).toLocaleString()} ₺
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Toplam Gelir</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-slate-400 dark:text-slate-500">
                      Detaylı bilgi için sol panelden bir psikolog seçin
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ekle/Düzenle Modalı */}
        <Dialog
          open={isAddModalOpen}
          onOpenChange={(open) => {
            setIsAddModalOpen(open);
            // Modal kapandığında eğer düzenleme modunda değilsek seçimi sıfırla
            if (!open && !isEditing) setSelectedPsychologist(null);
          }}
        >
          <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 border-0 shadow-2xl rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                {isEditing ? "Psikoloğu Düzenle" : "Yeni Psikolog Ekle"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Ad Soyad
                </label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 focus:bg-white dark:focus:bg-slate-700 rounded-xl"
                  placeholder="Dr. Ahmet Yılmaz"
                />
              </div>

              {/* Email ve Telefon giriş alanları kaldırıldı */}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="bg-white/60 dark:bg-slate-700/60 border-slate-200/50 dark:border-slate-600/50 hover:bg-white dark:hover:bg-slate-700 rounded-xl"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !formName.trim()} // Sadece formName kontrolü
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isEditing ? (isSaving ? "Kaydediliyor..." : "Kaydet") : (isSaving ? "Ekleniyor..." : "Ekle")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Diyaloğu */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 border-0 shadow-2xl rounded-3xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Psikoloğu Sil
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700 dark:text-gray-200">Bu psikoloğu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
              {psychologistToDelete && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {psychologistToDelete.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    Kayıt Tarihi: {new Date(psychologistToDelete.created_at || '').toLocaleDateString("tr-TR")}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                İptal
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeletePsychologist}
                className="bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}