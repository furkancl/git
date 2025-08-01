"use client"

import { Header } from "@/components/header"
import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format, startOfWeek, addDays, isSameDay, setHours, setMinutes } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from 'sonner' // Sonner'dan toast'ı import edin!


import { supabase } from "@/lib/supabase"

// Tipler
type Client = {
  id: string;
  name: string;
};

// Psychologist tipini renk_kodu ile güncelliyoruz
type Psychologist = {
  id: string;
  name: string;
  renk_kodu?: string; // SupaBase'den gelecek yeni kolon
};

// Randevu verisinde psikolog bilgilerini de doğrudan alabilmek için
// `psychologist_id` yerine doğrudan `psychologist` objesini tutacak şekilde güncelliyoruz.
// Böylece nested select sorgusu ile çekilen verilere kolayca erişebiliriz.
type Appointment = {
  id: string;
  client_id: string;
  psychologist_id: string; // Bu hala veritabanı kaydı için gerekli
  appointment_date: string;
  hour: number;
  minute: number;
  duration: number;
  description: string;
  fee: number;
  psychologists: { // İlişkili psikolog bilgileri
    id: string;
    name: string;
    renk_kodu?: string; // Bu randevunun psikologunun renk kodu
  } | null; // null olabilir eğer ilişki bulunamazsa
};


const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

const durations = [60, 90]

const hours = Array.from({ length: 12 }, (_, i) => 9 + i) // 09:00-20:00
const minutes = [0, 15, 30, 45]

const timeSlots = [] as { hour: number; minute: number }[]
for (const h of hours) {
  for (const m of minutes) {
    // 20:00'dan sonraki 15 dakikalık slotları eklememek için kontrol
    if (h === 20 && m > 0) continue // 20:15, 20:30, 20:45 slotlarını eklemez
    timeSlots.push({ hour: h, minute: m })
  }
}

const SLOT_HEIGHT_PX = 24

// psychologistColors ve getPsychologistColorClasses fonksiyonları artık burada sabit kodlanmayacak.
// Renkler doğrudan psikolog verisi ile birlikte SupaBase'den gelecek.


export default function RandevuPlanlamaPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  // Appointment state'inin tipini güncelledik
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState(null as null | (typeof appointments)[0])
  const [isAddOrEditDialogOpen, setIsAddOrEditDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [newClientId, setNewClientId] = useState<string>("")
  const [newPsychologistId, setNewPsychologistId] = useState<string>("")
  const [newDate, setNewDate] = useState<Date | undefined>(undefined)
  const [newHour, setNewHour] = useState<string>("")
  const [newMinute, setNewMinute] = useState<string>("")
  const [newDuration, setNewDuration] = useState<string>("")
  const [newDescription, setNewDescription] = useState("")
  const [newFee, setNewFee] = useState<string>("")
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [hoveredAppointmentId, setHoveredAppointmentId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null)

  const currentWeekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    return days.map((_, i) => addDays(start, i))
  }, [])

  // Supabase'den verileri çekme
  useEffect(() => {
    const fetchData = async () => {
      // Danışanları çek
      const { data: clientsData, error: clientsError } = await supabase.from("clients").select("id, name");
      if (clientsError) console.error("Danışanlar çekilirken hata:", clientsError.message);
      setClients(clientsData || []);

      // Psikologları çekerken renk_kodu'nu da select ediyoruz
      const { data: psychsData, error: psychsError } = await supabase.from("psychologists").select("id, name, renk_kodu");
      if (psychsError) console.error("Psikologlar çekilirken hata:", psychsError.message);
      setPsychologists(psychsData || []);

      // Randevuları çekerken ilişkili psikolog bilgilerini de (ad ve renk_kodu) çekiyoruz
      const { data: apptsData, error: apptsError } = await supabase
        .from("appointments")
        .select("*, psychologists(id, name, renk_kodu)"); // 'psikologlar' tablosundaki 'ad' ve 'renk_kodu' kolonlarını çek

      if (apptsError) console.error("Randevular çekilirken hata:", apptsError.message);
      setAppointments((apptsData || []).map(a => ({ ...a, appointment_date: a.appointment_date })));
    }
    fetchData();
  }, []); // Bağımlılık dizisi boş kalmalı, sadece başlangıçta çekmeli

  useEffect(() => {
    if (selectedAppointment && isEditing) {
      setNewClientId(selectedAppointment.client_id)
      setNewPsychologistId(selectedAppointment.psychologist_id)
      setNewDate(new Date(selectedAppointment.appointment_date))
      setNewHour(selectedAppointment.hour.toString())
      setNewMinute(selectedAppointment.minute.toString())
      setNewDuration(selectedAppointment.duration.toString())
      setNewDescription(selectedAppointment.description)
      setNewFee(selectedAppointment.fee?.toString() || "")
      setIsAddOrEditDialogOpen(true)
    } else if (!selectedAppointment && !isEditing) {
      setNewClientId("")
      setNewPsychologistId("")
      setNewDate(undefined)
      setNewHour("")
      setNewMinute("")
      setNewDuration("")
      setNewDescription("")
      setNewFee("")
    }
  }, [selectedAppointment, isEditing]); // Bağımlılıklara dikkat edin

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) {
      toast.error("Silinecek randevu bulunamadı");
      setShowDeleteConfirm(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentToDelete.id);

      if (error) throw error;

      // Update local state
      setAppointments(prev => prev.filter(a => a.id !== appointmentToDelete.id));
      
      // Close the dialog and reset state
      setShowDeleteConfirm(false);
      setAppointmentToDelete(null);
      
      // Show success message
      toast.success("Randevu başarıyla silindi");
    } catch (error) {
      console.error("Randevu silinirken hata:", error);
      toast.error("Randevu silinirken bir hata oluştu");
    }
  };

  const handleSaveAppointment = async () => {
    if (
      !newClientId ||
      !newPsychologistId ||
      !newDate ||
      newDuration.length === 0 ||
      newDescription.trim().length === 0 ||
      newFee.length === 0
    ) {
      toast.error("Gerekli Alanlar Eksik!", {
        description: "Lütfen randevu bilgilerinin tümünü doldurun.",
        duration: 3000,
      });
      return;
    }

    const selectedHour = Number(newHour);
    const selectedMinute = Number(newMinute);
    const fee = Number(newFee);

    if (selectedHour > 18 || (selectedHour === 18 && selectedMinute > 30)) {
      toast.warning("Geçersiz Randevu Saati!", {
        description: "En son 18:30'da başlayan bir randevu oluşturabilirsiniz. Lütfen daha erken bir saat seçin.",
        duration: 5000,
      });
      return;
    }

    try {
      if (isEditing && selectedAppointment) {
        // Güncelleme
        const { error } = await supabase
          .from("appointments")
          .update({
            client_id: newClientId,
            psychologist_id: newPsychologistId,
            appointment_date: newDate.toISOString(),
            hour: selectedHour,
            minute: selectedMinute,
            duration: Number(newDuration),
            description: newDescription,
            fee: fee,
          })
          .eq("id", selectedAppointment.id)
        if (error) throw error

        // Yeniden fetch - burada da psikolog bilgilerini çekmeyi unutmayın
        const { data: apptsData } = await supabase.from("appointments").select("*, psychologists(id, name, renk_kodu)")
        setAppointments((apptsData || []).map(a => ({ ...a, appointment_date: a.appointment_date })))
        setSelectedAppointment(null)
        setIsEditing(false)

        // Toast mesajı için güvenli client name alma
        const clientName = clients.find(c => c.id === newClientId)?.name;
        toast.success("Randevu Başarıyla Güncellendi!", {
          description: clientName
            ? `${clientName} için randevu güncellendi.`
            : "Randevu başarıyla güncellendi.",
        });
      } else {
        // Yeni ekleme
        const { error } = await supabase
          .from("appointments")
          .insert({
            client_id: newClientId,
            psychologist_id: newPsychologistId,
            appointment_date: newDate.toISOString(),
            hour: selectedHour,
            minute: selectedMinute,
            duration: Number(newDuration),
            description: newDescription,
            fee: fee,
          })
        if (error) throw error
        // Yeniden fetch - burada da psikolog bilgilerini çekmeyi unutmayın
        const { data: apptsData } = await supabase.from("appointments").select("*, psychologists(id, name, renk_kodu)")
        setAppointments((apptsData || []).map(a => ({ ...a, appointment_date: a.appointment_date })))
        setSelectedAppointment(null)

        // Toast mesajı için güvenli client name alma
        const clientName = clients.find(c => c.id === newClientId)?.name;
        toast.success("Yeni Randevu Eklendi!", {
          description: clientName
            ? `${clientName} için yeni bir randevu oluşturuldu.`
            : "Randevu başarıyla oluşturuldu.",
        });
      }
    } catch (err: any) {
      toast.error("Hata!", { description: err.message })
    } finally {
      setIsAddOrEditDialogOpen(false); // Kaydetme işleminden sonra dialogu kapat
    }
  }

  const confirmDeleteAppointment = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const handleDragStart = (id: string) => setDraggedId(id)
  const handleDrop = async (targetDate: Date, hour: number, minute: number) => {
    if (draggedId == null) return

    if (hour > 18 || (hour === 18 && minute > 30)) {
      toast.warning("Randevu Taşınamaz!", {
        description: "18:30'dan sonra başlayan randevu oluşturulamaz veya taşınamaz.",
        duration: 5000,
      });
      setDraggedId(null);
      return;
    }

    // Yeni randevu tarihini ve saatini doğru bir şekilde oluştur
    const newAppointmentDate = setMinutes(setHours(targetDate, hour), minute);

    // Supabase'de güncelle
    await supabase.from("appointments").update({
      appointment_date: newAppointmentDate.toISOString(),
      hour,
      minute,
    }).eq("id", draggedId)

    // Yeniden fetch - burada da psikolog bilgilerini çekmeyi unutmayın
    const { data: apptsData } = await supabase.from("appointments").select("*, psychologists(id, name, renk_kodu)")
    setAppointments((apptsData || []).map(a => ({ ...a, appointment_date: a.appointment_date })))

    // BAŞARI MESAJI: Randevu taşındı - güvenli client name alma
    const movedAppt = appointments.find(appt => appt.id === draggedId);
    if (movedAppt) {
      const clientName = clients.find(c => c.id === movedAppt.client_id)?.name;
      toast.success("Randevu Taşındı!", {
        description: clientName
          ? `${clientName} randevusu başarıyla yeni saate/güne taşındı.`
          : "Randevu başarıyla taşındı.",
      });
    }
    setDraggedId(null);
  };

  const getEndTime = (hour: number, minute: number, duration: number) => {
    const start = new Date(0, 0, 0, hour, minute)
    const end = new Date(start.getTime() + duration * 60000)
    return { hour: end.getHours(), minute: end.getMinutes() }
  }

  // Renk yönetimi artık direkt randevu objesinden yapılacak
  const getAppointmentBackgroundColor = (appointment: Appointment) => {
    return appointment.psychologists?.renk_kodu || "#CCCCCC"; // Varsayılan gri renk
  };


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start p-6 md:p-8">
        <div className="w-full max-w-6xl mb-8">
          <div className="backdrop-blur-xl bg-white/30 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-2">
                  Randevu Planlama
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Haftalık randevu takvimi ve yönetimi
                </p>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 border-0 text-lg font-semibold"
                onClick={() => {
                  setIsAddOrEditDialogOpen(true)
                  setIsEditing(false)
                  setNewDate(currentWeekDays[0])
                }}
              >
                + Randevu Planla
              </Button>
            </div>
          </div>
        </div>

        {/* Haftalık Randevu Tablosu */}
        <div className="overflow-x-auto w-full max-w-6xl backdrop-blur-xl bg-white/40 dark:bg-slate-800/40 border border-white/30 dark:border-slate-700/30 rounded-3xl shadow-2xl">
          <table className="min-w-full">
            <colgroup>
              <col style={{ width: "60px" }} />
              {days.map((_, i) => (
                <col key={i} style={{ width: "120px", minWidth: "120px", maxWidth: "120px" }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="sticky top-0 left-0 z-20 backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-b border-r border-white/30 dark:border-slate-600/30 h-12 w-15 rounded-tl-3xl" />
                {currentWeekDays.map((date, i) => (
                  <th
                    key={i}
                    className={cn(
                      "sticky top-0 z-20 backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 border-b border-white/30 dark:border-slate-600/30 text-sm font-bold text-slate-700 dark:text-slate-200 h-12 px-3 text-center transition-all duration-200",
                      i === days.length - 1 && "rounded-tr-3xl"
                    )}
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-100">{days[i]}</div>
                    <div className="font-normal text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {format(date, "dd MMM", { locale: tr })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, slotIdx) => {
                const displayTime = slot.minute === 0 || slot.minute === 30
                const isMajorHour = slot.minute === 0

                return (
                  <tr key={slotIdx}>
                    <td
                      className={`sticky left-0 z-10 bg-gray-50 border-b border-r border-gray-100 h-6 text-xs text-gray-500 font-semibold text-center dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 ${isMajorHour ? "border-t border-gray-200 dark:border-gray-600" : ""}`}
                      style={{ width: 60, minWidth: 60, maxWidth: 60 }}
                    >
                      {displayTime && `${slot.hour}:${slot.minute.toString().padStart(2, "0")}`}
                    </td>
                    {currentWeekDays.map((currentDayDate, dayIdx) => {
                      const currentSlotStartInMinutes = slot.hour * 60 + slot.minute
                      const currentSlotEndInMinutes = currentSlotStartInMinutes + 15

                      const overlappingAppts = appointments.filter((appt) => {
                        if (!isSameDay(new Date(appt.appointment_date), currentDayDate)) return false
                        const apptStartTimeInMinutes = appt.hour * 60 + appt.minute
                        const apptEndTimeInMinutes = apptStartTimeInMinutes + appt.duration
                        return (
                          apptStartTimeInMinutes < currentSlotEndInMinutes &&
                          apptEndTimeInMinutes > currentSlotStartInMinutes
                        )
                      })

                      const appointmentsStartingInSlot = overlappingAppts
                        .filter((appt) => {
                          const apptStartTimeInMinutes = appt.hour * 60 + appt.minute
                          return apptStartTimeInMinutes === currentSlotStartInMinutes
                        })
                        // psikolog ID'sine göre sıralayarak çakışmalarda tutarlı bir görünüm sağlarız
                        .sort((a, b) => String(a.psychologist_id).localeCompare(String(b.psychologist_id)))

                      const clickableAppointment =
                        appointmentsStartingInSlot.length > 0
                          ? appointmentsStartingInSlot[0]
                          : overlappingAppts.length > 0
                            ? overlappingAppts.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))[0]
                            : null

                      let tdHoverClasses = ""
                      if (hoveredAppointmentId !== null) {
                        const hoveredAppt = appointments.find((a) => a.id === hoveredAppointmentId)
                        if (hoveredAppt && isSameDay(new Date(hoveredAppt.appointment_date), currentDayDate)) {
                          const apptStartTimeInMinutes = hoveredAppt.hour * 60 + hoveredAppt.minute
                          const apptEndTimeInMinutes = apptStartTimeInMinutes + hoveredAppt.duration

                          if (
                            apptStartTimeInMinutes < currentSlotEndInMinutes &&
                            apptEndTimeInMinutes > currentSlotStartInMinutes
                          ) {
                            // Hover rengini direkt psikologun renk_kodu'ndan alıyoruz
                            const hoverColor = hoveredAppt.psychologists?.renk_kodu || '#CCCCCC'; // Varsayılan gri
                            // CSS değişkeni olarak kullanmak için veya Tailwind'in dinamik sınıflarını oluşturmak için daha ileri bir entegrasyon gerekebilir.
                            // Şimdilik burayı direkt stil olarak ayarlayacağız veya Tailwind'in saf renk sınıflarına haritalayacağız.
                            // Eğer Tailwind JIT modundaysanız, dinamik renk kodlarını doğrudan style içinde kullanabilirsiniz.
                            // Örneğin, bg-[${hoverColor}] gibi, ama bu her zaman en iyi pratik değildir.
                            // Direkt style ataması daha güvenlidir.
                          }
                        }
                      }

                      return (
                        <td
                          key={`${dayIdx}-${slotIdx}`}
                          className={cn(
                            `relative z-0 p-0 align-top h-6 border-b border-white/20 dark:border-slate-600/20 text-center align-middle transition-all duration-300`,
                            // Eğer bu slotta bir randevu varsa, randevu kutusundaki aynı efektleri ekle
                            overlappingAppts.length > 0 ? "cursor-pointer hover:shadow-2xl hover:scale-105 hover:z-50" : "hover:bg-white/20 dark:hover:bg-slate-700/20"
                          )}
                          onDragOver={(e) => draggedId && e.preventDefault()}
                          onDrop={() => handleDrop(currentDayDate, slot.hour, slot.minute)}
                          style={{ width: 120, minWidth: 120, maxWidth: 120 }}
                          onClick={() => {
                            if (clickableAppointment) {
                              setSelectedAppointment(clickableAppointment)
                            }
                          }}
                          onMouseEnter={() => {
                            // Eğer bu slotta bir randevu varsa, o randevuyu hover et
                            if (overlappingAppts.length > 0) {
                              setHoveredAppointmentId(overlappingAppts[0].id)
                            }
                          }}
                          onMouseLeave={() => {
                            // Hover'dan çıkınca hover'i temizle
                            if (overlappingAppts.length > 0) {
                              setHoveredAppointmentId(null)
                            }
                          }}
                          // Eğer bu slotta randevu varsa, drag işlemlerini ekle
                          draggable={overlappingAppts.length > 0}
                          onDragStart={() => {
                            if (overlappingAppts.length > 0) {
                              handleDragStart(overlappingAppts[0].id)
                            }
                          }}
                          onDragEnd={() => {
                            if (overlappingAppts.length > 0) {
                              setDraggedId(null)
                            }
                          }}
                        >
                          {appointmentsStartingInSlot.map((appt, apptIndex) => {
                            const client = clients.find((c) => c.id === appt.client_id)
                            // Psikolog bilgisi zaten 'appt.psychologists' içinde mevcut
                            const psychologist = appt.psychologists;

                            const apptHeight = (appt.duration / 15) * SLOT_HEIGHT_PX
                            const offset = apptIndex * 15
                            const currentZIndex = appt.id === hoveredAppointmentId ? 999 : 100 + apptIndex
                            // Renk kodunu direkt psikolog objesinden alıyoruz
                            const backgroundColor = getAppointmentBackgroundColor(appt);
                            const endTime = getEndTime(appt.hour, appt.minute, appt.duration)

                            return (
                              <div
                                key={appt.id}
                                className={`absolute rounded-2xl py-2 text-xs font-medium cursor-pointer flex justify-center transition-all duration-300 select-none flex-col px-2 backdrop-blur-sm border border-white/30 shadow-xl items-stretch gap-y-1 ${
                                  hoveredAppointmentId === appt.id ? 'shadow-2xl scale-105 z-50' : 'hover:shadow-2xl hover:scale-105'
                                }`}
                                style={{
                                  top: 0,
                                  height: `${apptHeight}px`,
                                  width: `calc(100% - ${offset}px)`,
                                  left: `${offset}px`,
                                  zIndex: currentZIndex,
                                  overflow: "hidden",
                                  backgroundColor: backgroundColor, // Renk direkt buraya atanıyor
                                  color: '#FFFFFF', // Randevu metin rengini okunurluk için beyaz yapıyoruz
                                  borderColor: backgroundColor, // Kenarlık rengini de arka plan rengiyle aynı yapabiliriz
                                }}
                                draggable
                                onDragStart={() => handleDragStart(appt.id)}
                                onDragEnd={() => setDraggedId(null)}
                                onMouseEnter={() => setHoveredAppointmentId(appt.id)}
                                onMouseLeave={() => setHoveredAppointmentId(null)}
                                onClick={(e) => {
                                  e.stopPropagation() // Tablo hücresinin tıklama olayını engelle
                                  setSelectedAppointment(appt)
                                }}
                              >
                                {/* Client Name */}
                                <div className="truncate font-semibold text-sm">{client?.name}</div>
                                {/* Psychologist Name (eğer varsa) */}
                                {psychologist?.name && (
                                  <div className="truncate text-[12px] italic">{psychologist.name}</div>
                                )}
                                {/* Açıklama */}
                                <div className="truncate text-[10px]">{appt.description}</div>
                                {/* Saat Bilgisi */}
                                <div className="text-[10px] text-gray-200 dark:text-gray-300">
                                  {appt.hour}:{appt.minute.toString().padStart(2, "0")} -{" "}
                                  {`${endTime.hour}:${endTime.minute.toString().padStart(2, "0")}`}
                                </div>
                              </div>
                            )
                          })}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Randevu Detay Modal */}
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="dark:bg-gray-800 rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">Randevu Detayı</DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-2 text-gray-700 dark:text-gray-200">
                <div>
                  <b>Danışan:</b> {clients.find((c) => c.id === selectedAppointment.client_id)?.name}
                </div>
                <div>
                  {/* Detay modalında psikolog adı için artık doğrudan selectedAppointment.psychologists.name kullanabiliriz */}
                  <b>Psikolog:</b> {selectedAppointment.psychologists?.name}
                </div>
                <div>
                  <b>Tarih:</b> {format(new Date(selectedAppointment.appointment_date), "dd MMMM yyyy EEEE", { locale: tr })}
                </div>
                <div>
                  <b>Saat:</b> {selectedAppointment.hour}:{selectedAppointment.minute.toString().padStart(2, "0")}
                </div>
                <div>
                  <b>Süre:</b> {selectedAppointment.duration} dk
                </div>
                <div>
                  <b>Ücret:</b> {selectedAppointment.fee} ₺
                </div>
                <div>
                  <b>Açıklama:</b> {selectedAppointment.description}
                </div>
              </div>
            )}
            <DialogFooter className="flex justify-between items-center">
              {" "}
              {/* Butonları yaymak için */}
              <Button
                variant="outline"
                onClick={() => setSelectedAppointment(null)}
                className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Kapat
              </Button>
              <div className="flex gap-2">
                {" "}
                {/* Düzenle ve Sil butonlarını gruplamak için */}
                <Button
                  onClick={() => {
                    setIsEditing(true)
                    setIsAddOrEditDialogOpen(true)
                  }}
                  className="dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg"
                >
                  Düzenle
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedAppointment) {
                      setAppointmentToDelete(selectedAppointment);
                      setShowDeleteConfirm(true);
                    } else {
                      toast.error("Lütfen silinecek bir randevu seçin");
                    }
                  }}
                  className="rounded-lg"
                >
                  Sil
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Randevu Ekle/Düzenle Modal */}
        <Dialog
          open={isAddOrEditDialogOpen}
          onOpenChange={(open) => {
            setIsAddOrEditDialogOpen(open)
            if (!open) {
              setIsEditing(false)
              setSelectedAppointment(null)
            }
          }}
        >
          <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 border-0 shadow-2xl rounded-3xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {isEditing ? "Randevu Düzenle" : "Yeni Randevu Planla"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="client" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Danışan
                </label>
                <Select value={newClientId} onValueChange={setNewClientId}>
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Danışan seç" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="psychologist" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Psikolog
                </label>
                <Select value={newPsychologistId} onValueChange={setNewPsychologistId}>
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Psikolog seç" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {psychologists.map((psychologist) => (
                      <SelectItem key={psychologist.id} value={psychologist.id.toString()}>
                        {psychologist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="date" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Tarih
                </label>
                <Select
                  value={newDate ? format(newDate, "yyyy-MM-dd") : ""}
                  onValueChange={(val) => setNewDate(new Date(val))}
                >
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Gün seç" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {currentWeekDays.map((date, idx) => (
                      <SelectItem key={idx} value={format(date, "yyyy-MM-dd")}>
                        {days[idx]} - {format(date, "dd MMM", { locale: tr })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="hour" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Saat
                </label>
                <Select value={newHour} onValueChange={setNewHour}>
                  <SelectTrigger className="col-span-2 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Saat" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()} disabled={hour > 18}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newMinute} onValueChange={setNewMinute}>
                  <SelectTrigger className="col-span-1 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder=":00" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {minutes.map((min) => (
                      <SelectItem
                        key={min}
                        value={min.toString()}
                        // En son 18:30'a randevu koyulabilsin. Yani 18:45'ten itibaren engelleyeceğiz.
                        disabled={Number(newHour) === 18 && min > 30}
                      >
                        {min.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="duration" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Süre (dk)
                </label>
                <Select value={newDuration} onValueChange={setNewDuration}>
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="Süre seç" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:text-gray-100 rounded-lg">
                    {durations.map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d} dk
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="fee" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Randevu Ücreti (₺)
                </label>
                <input
                  id="fee"
                  type="number"
                  value={newFee}
                  onChange={e => setNewFee(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg px-2 py-1 border border-gray-300"
                  placeholder="Ücret"
                  min={0}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right font-medium text-gray-700 dark:text-gray-200">
                  Açıklama
                </label>
                <Textarea
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg"
                  placeholder="Randevu açıklaması"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddOrEditDialogOpen(false)}
                className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                İptal
              </Button>
              <Button onClick={handleSaveAppointment} className="dark:bg-blue-700 dark:hover:bg-blue-800 rounded-lg">
                {isEditing ? "Kaydet" : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Diyaloğu */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 border-0 shadow-2xl rounded-3xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Randevuyu Sil
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700 dark:text-gray-200">Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
              {appointmentToDelete && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {clients.find(c => c.id === appointmentToDelete.client_id)?.name || 'Bilinmeyen Danışan'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {`${String(appointmentToDelete.hour).padStart(2, '0')}:${String(appointmentToDelete.minute).padStart(2, '0')} - ${getEndTime(appointmentToDelete.hour, appointmentToDelete.minute, appointmentToDelete.duration).hour}:${String(getEndTime(appointmentToDelete.hour, appointmentToDelete.minute, appointmentToDelete.duration).minute).padStart(2, '0')}`}
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
                onClick={handleDeleteAppointment}
                className="bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Diyaloğu */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 border-0 shadow-2xl rounded-3xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Randevuyu Sil
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700 dark:text-gray-200">Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
              {appointmentToDelete && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {clients.find(c => c.id === appointmentToDelete.client_id)?.name || 'Bilinmeyen Danışan'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {`${String(appointmentToDelete.hour).padStart(2, '0')}:${String(appointmentToDelete.minute).padStart(2, '0')} - ${getEndTime(appointmentToDelete.hour, appointmentToDelete.minute, appointmentToDelete.duration).hour}:${String(getEndTime(appointmentToDelete.hour, appointmentToDelete.minute, appointmentToDelete.duration).minute).padStart(2, '0')}`}
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
                onClick={handleDeleteAppointment}
                className="bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}