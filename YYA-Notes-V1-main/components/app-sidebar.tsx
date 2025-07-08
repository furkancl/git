"use client"

import React from "react"

import {
  BarChart3,
  ChevronDown,
  FileText,
  Settings,
  Users,
  Activity,
  DollarSign,
  Target,
  Archive,
  UserCheck,
  LogOut,
  CheckCircle,
  Heart,
} from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const menuData = [
  {
    title: "Finans",
    url: "#",
    icon: DollarSign,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    items: [
      { title: "Giderler", url: "#", icon: FileText },
      { title: "Danışan Ödemeleri", url: "#", icon: DollarSign },
      { title: "Çocuk Danışan Ödemeleri", url: "#", icon: Users },
      { title: "Hesap Hareketleri", url: "#", icon: Activity },
      { title: "Mali Raporlar", url: "#", icon: BarChart3 },
      { title: "Bütçe Takibi", url: "#", icon: Target },
    ],
  },
  {
    title: "Sekreterya",
    url: "#",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    items: [
      { title: "Psikoloji Sohbetleri Kayıt Formu", url: "#", icon: FileText },
      { title: "Görüşme Hazırlık Formu", url: "#", icon: Settings },
      { title: "Danışan Paylaşımı", url: "#", icon: Users },
      { title: "G00-Yetişkin Şablonu", url: "#", icon: Archive },
      { title: "İlk Kayıt", url: "#", icon: UserCheck },
      { title: "Görüşme Değerlendirme Formu", url: "#", icon: Activity },
      { title: "Danışan İstatistikleri", url: "#", icon: BarChart3 },
    ],
  },
  {
    title: "Test ve Şablonlar",
    url: "#",
    icon: Archive,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    items: [
      { title: "MMPI Şablonu", url: "#", icon: FileText },
      { title: "MMPI Çift Şablonu", url: "#", icon: Users },
      { title: "MMPI Cevaplar", url: "#", icon: CheckCircle },
      { title: "SCİD Şablonu", url: "#", icon: FileText },
      { title: "SCİD Çift Şablonu", url: "#", icon: Users },
      { title: "SCİD Cevaplar", url: "#", icon: CheckCircle },
      { title: "Şema Terapi Şablonu", url: "#", icon: FileText },
      { title: "Şema Terapi Çift", url: "#", icon: Users },
      { title: "Şema Terapi Cevaplar", url: "#", icon: CheckCircle },
      { title: "Yakın İlişkiler Şablonu", url: "#", icon: Heart },
      { title: "Yakın İlişkiler Cevaplar", url: "#", icon: CheckCircle },
    ],
  },
]

// Accordion Item Component
const AccordionMenuItem = React.memo(({ item, index }: { item: any; index: number }) => {
  const [isOpen, setIsOpen] = React.useState(index === 0) // İlk menü varsayılan olarak açık
  const { state } = useSidebar()

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/accordion">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={`
              w-full justify-between p-3 rounded-lg border transition-all duration-200
              ${item.borderColor} ${item.bgColor} hover:shadow-sm
              group-data-[state=open]/accordion:shadow-md
              group-data-[state=open]/accordion:${item.bgColor}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md ${item.bgColor} ${item.borderColor} border`}>
                <item.icon className={`size-4 ${item.color}`} />
              </div>
              {state === "expanded" && <span className={`font-medium ${item.color}`}>{item.title}</span>}
            </div>
            {state === "expanded" && (
              <ChevronDown
                className={`
                  size-4 transition-transform duration-300 ease-out ${item.color}
                  group-data-[state=open]/accordion:rotate-180
                `}
              />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="pt-2">
            <SidebarMenuSub className="ml-4 space-y-1">
              {item.items?.map((subItem: any, subIndex: number) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    className="
                      group/sub-item p-2 rounded-md transition-all duration-200
                      hover:bg-accent/50 hover:translate-x-1
                      data-[active=true]:bg-accent data-[active=true]:font-medium
                    "
                  >
                    <a href={subItem.url} className="flex items-center gap-2">
                      {subItem.icon && (
                        <subItem.icon className="size-3.5 text-muted-foreground group-hover/sub-item:text-foreground transition-colors" />
                      )}
                      <span className="text-sm">{subItem.title}</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </div>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
})

AccordionMenuItem.displayName = "AccordionMenuItem"

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/50 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="font-semibold group">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm group-hover:shadow-md transition-shadow">
                  <BarChart3 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Danışan Bilgi Sistemi</span>
                  <span className="truncate text-xs text-muted-foreground">v2.1.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider mb-2">
            Ana Menüler
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-2">
            {menuData.map((item, index) => (
              <AccordionMenuItem key={item.title} item={item} index={index} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent/50 transition-all duration-200 group">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-sidebar-accent to-sidebar-accent/80">
                      AY
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Ahmet Yılmaz</span>
                    <span className="truncate text-xs text-muted-foreground">Psikolog</span>
                  </div>
                  <ChevronDown className="ml-auto size-4 transition-transform group-hover:translate-y-0.5" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 animate-in slide-in-from-bottom-2 duration-200"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
                      <AvatarFallback className="rounded-lg">AY</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Ahmet Yılmaz</span>
                      <span className="truncate text-xs text-muted-foreground">ahmet@klinik.com</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <UserCheck className="mr-2 h-4 w-4" />
                  <span>Profil Ayarları</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Sistem Ayarları</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Güvenli Çıkış</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
