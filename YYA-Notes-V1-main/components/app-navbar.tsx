"use client"

import React from "react"
import Link from "next/link"
import {
  BarChart3,
  FileText,
  Settings,
  Users,
  Activity,
  DollarSign,
  Target,
  Archive,
  UserCheck,
  LogOut,
  Menu,
  Calendar,
} from "lucide-react"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const menuData = [
  {
    title: "Finans",
    icon: DollarSign,
    color: "text-red-600",
    bgColor: "bg-red-50",
    hoverColor: "hover:bg-red-100",
    items: [
      { title: "Giderler", url: "/finans/giderler", icon: FileText, description: "Tüm gider kayıtlarını görüntüle" },
      {
        title: "Danışan Ödemeleri",
        url: "/finans/danisan-odemeleri",
        icon: DollarSign,
        description: "Danışan ödeme takibi",
      },
      {
        title: "Çocuk Danışan Ödemeleri",
        url: "/finans/cocuk-danisan-odemeleri",
        icon: Users,
        description: "Çocuk danışan ödemeleri",
      },
      {
        title: "Hesap Hareketleri",
        url: "/finans/hesap-hareketleri",
        icon: Activity,
        description: "Hesap hareket detayları",
      },
    ],
  },
  {
    title: "Seans",
    icon: Activity,
    color: "text-green-600",
    bgColor: "bg-green-50",
    hoverColor: "hover:bg-green-100",
    items: [
      {
        title: "Seans Planlama",
        url: "/seans/planlama",
        icon: Calendar,
        description: "Yeni seans planla ve düzenle",
      },
      {
        title: "Seans Listesi",
        url: "/seans/liste",
        icon: FileText,
        description: "Tüm seansları görüntüle",
      },
      {
        title: "Randevu Takvimi",
        url: "/seans/takvim",
        icon: Calendar,
        description: "Takvim görünümü",
      },
      {
        title: "Seans Notları",
        url: "/seans/notlar",
        icon: FileText,
        description: "Seans notları ve kayıtlar",
      },
    ],
  },
  {
    title: "Sekreterya",
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
    items: [
      {
        title: "Psikoloji Sohbetleri Kayıt Formu",
        url: "/sekreterya/psikoloji-sohbetleri",
        icon: FileText,
        description: "Sohbet kayıt formu",
      },
      {
        title: "Görüşme Hazırlık Formu",
        url: "/sekreterya/gorusme-hazirlik",
        icon: Settings,
        description: "Görüşme öncesi hazırlık",
      },
      {
        title: "Danışan Paylaşımı",
        url: "/sekreterya/danisan-paylasimi",
        icon: Users,
        description: "Danışan bilgi paylaşımı",
      },
      {
        title: "G00-Yetişkin Şablonu",
        url: "/sekreterya/g00-yetiskin",
        icon: Archive,
        description: "Yetişkin değerlendirme şablonu",
      },
      { title: "İlk Kayıt", url: "/sekreterya/ilk-kayit", icon: UserCheck, description: "Yeni danışan kaydı" },
      {
        title: "Görüşme Değerlendirme Formu",
        url: "/sekreterya/gorusme-degerlendirme",
        icon: Activity,
        description: "Görüşme sonrası değerlendirme",
      },
      {
        title: "Danışan İstatistikleri",
        url: "/sekreterya/danisan-istatistikleri",
        icon: BarChart3,
        description: "Danışan istatistik raporları",
      },
    ],
  },
]

// Mobile Menu Component
const MobileMenu = () => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menüyü aç</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="size-4" />
              </div>
              <div>
                <h2 className="font-semibold">Danışan Bilgi Sistemi</h2>
                <p className="text-xs text-muted-foreground">v2.1.0</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {menuData.map((section) => (
              <div key={section.title} className="space-y-2">
                <div className={`flex items-center gap-2 p-2 rounded-lg ${section.bgColor}`}>
                  <section.icon className={`size-4 ${section.color}`} />
                  <h3 className={`font-medium ${section.color}`}>{section.title}</h3>
                </div>
                <div className="ml-4 space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.title}
                      href={item.url}
                      className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="size-3.5 text-muted-foreground" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Test ve Şablonlar - Mobile Link */}
            <div className="space-y-2">
              <Link
                href="/test-sablonlar"
                className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Archive className="size-4 text-yellow-600" />
                <h3 className="font-medium text-yellow-600">Test ve Şablonlar</h3>
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ComponentType<any>; description?: string }
>(({ className, title, children, icon: Icon, description, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          {description && <p className="line-clamp-2 text-xs leading-snug text-muted-foreground ml-6">{description}</p>}
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
              <BarChart3 className="size-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold">Danışan Bilgi Sistemi</h1>
              <p className="text-xs text-muted-foreground">v2.1.0</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {menuData.map((section) => (
                <NavigationMenuItem key={section.title}>
                  <NavigationMenuTrigger className={`${section.hoverColor} transition-colors`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${section.bgColor}`}>
                        <section.icon className={`size-4 ${section.color}`} />
                      </div>
                      <span className={section.color}>{section.title}</span>
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {section.items.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.url}
                          icon={item.icon}
                          description={item.description}
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}

              {/* Test ve Şablonlar - Direkt Link */}
              <NavigationMenuItem>
                <Link
                  href="/test-sablonlar"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md"
                >
                  <div className="p-1 rounded bg-yellow-50">
                    <Archive className="size-4 text-yellow-600" />
                  </div>
                  <span className="text-yellow-600">Test ve Şablonlar</span>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu */}
            <MobileMenu />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Ahmet Yılmaz</p>
                    <p className="text-xs leading-none text-muted-foreground">Psikolog</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCheck className="mr-2 h-4 w-4" />
                  <span>Profil Ayarları</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Sistem Ayarları</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Güvenli Çıkış</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
