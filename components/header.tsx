import Link from "next/link"
import {
  ChevronDown,
  DollarSign,
  Users,
  FileText,
  TestTube,
  Menu,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  ReceiptText,
  Coins,
  CalendarCheck,
  ClipboardList,
  UserPlus,
  ClipboardCheck,
  ClipboardX,
  BarChart,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo ve Başlık - Yenilenmiş Tasarım */}
          <Link href="/" className="flex items-center space-x-3 py-2 group">
            <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                Danışan Bilgi Sistemi
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Finans Dropdown - Yenilenmiş Tasarım */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-1 text-red-600 hover:text-red-700 cursor-pointer">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">Finans</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-1">
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/finans/gelirler">
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    Gelirler
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/finans/giderler">
                    <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    Giderler
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/finans/kasa">
                    <Wallet className="h-4 w-4 text-blue-600" />
                    Kasa
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/finans/hesap-hareketleri">
                    <ReceiptText className="h-4 w-4 text-purple-600" />
                    Hesap Hareketleri
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/finans/bilanco">
                    <Coins className="h-4 w-4 text-orange-600" />
                    Bilanço
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Randevu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-1 text-green-600 hover:text-green-700 cursor-pointer">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Randevu</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-1">
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/randevu/planlama">
                    <CalendarCheck className="h-4 w-4 text-green-600" />
                    Randevu Planlama
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/randevu/notlar">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                    Randevu Notları
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/randevu/psikologlar">
                    <Users className="h-4 w-4 text-purple-600" />
                    Psikologlar
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sekreterya Dropdown - Yeni Eklendi */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Sekreterya</span>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-1">
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/sekreterya/ilk-kayit">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    İlk Kayıt
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/sekreterya/gorusme-hazirlik">
                    <ClipboardCheck className="h-4 w-4 text-green-600" />
                    Görüşme Hazırlık
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/sekreterya/gorusme-degerlendirme">
                    <ClipboardX className="h-4 w-4 text-red-600" />
                    Görüşme Değerlendirme
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/sekreterya/danisan-istatistikleri">
                    <BarChart className="h-4 w-4 text-purple-600" />
                    Danışan İstatistikleri
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Link href="/sekreterya/arananlar">
                    <Users className="h-4 w-4 text-orange-600" />
                    Arayanlar
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 cursor-pointer">
              <TestTube className="h-4 w-4" />
              <span className="text-sm font-medium">Test ve Şablonlar</span>
            </div>
          </nav>

          {/* Mobile Navigation (Hamburger Menu) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                <SheetHeader className="px-4 pt-6 pb-4 border-b">
                  <SheetTitle className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900">Danışan Bilgi Sistemi</h1>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-4">
                  {/* Finans Accordion - Mobil için Yenilenmiş Tasarım */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="finans">
                      <AccordionTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Finans</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <div className="flex flex-col gap-1 pl-4">
                          <Link
                            href="/finans/gelirler"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <ArrowUpCircle className="h-4 w-4 text-green-600" />
                            Gelirler
                          </Link>
                          <Link
                            href="/finans/giderler"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <ArrowDownCircle className="h-4 w-4 text-red-600" />
                            Giderler
                          </Link>
                          <Link
                            href="/finans/kasa"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Wallet className="h-4 w-4 text-blue-600" />
                            Kasa
                          </Link>
                          <Link
                            href="/finans/hesap-hareketleri"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <ReceiptText className="h-4 w-4 text-purple-600" />
                            Hesap Hareketleri
                          </Link>
                          <Link
                            href="/finans/bilanco"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Coins className="h-4 w-4 text-orange-600" />
                            Bilanço
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Randevu Accordion - Mobil için Yeni Eklendi */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="randevu">
                      <AccordionTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-md transition-colors">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Randevu</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <div className="flex flex-col gap-1 pl-4">
                          <Link
                            href="/randevu/planlama"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <CalendarCheck className="h-4 w-4 text-green-600" />
                            Randevu Planlama
                          </Link>
                          <Link
                            href="/randevu/notlar"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <ClipboardList className="h-4 w-4 text-blue-600" />
                            Randevu Notları
                          </Link>
                          <Link
                            href="/randevu/psikologlar"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Users className="h-4 w-4 text-purple-600" />
                            Psikologlar
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Sekreterya Accordion - Mobil için Yeni Eklendi */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="sekreterya">
                      <AccordionTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Sekreterya</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-0">
                        <div className="flex flex-col gap-1 pl-4">
                          <Link
                            href="/sekreterya/ilk-kayit"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <UserPlus className="h-4 w-4 text-blue-600" />
                            İlk Kayıt
                          </Link>
                          <Link
                            href="/sekreterya/gorusme-hazirlik"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <ClipboardCheck className="h-4 w-4 text-green-600" />
                            Görüşme Hazırlık
                          </Link>
                          <Link
                            href="/sekreterya/gorusme-degerlendirme"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <ClipboardX className="h-4 w-4 text-red-600" />
                            Görüşme Değerlendirme
                          </Link>
                          <Link
                            href="/sekreterya/danisan-istatistikleri"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <BarChart className="h-4 w-4 text-purple-600" />
                            Danışan İstatistikleri
                          </Link>
                          <Link
                            href="/sekreterya/arananlar"
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Users className="h-4 w-4 text-orange-600" />
                            Arayanlar
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Diğer Menü Öğeleri */}
                  <Link
                    href="#"
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                  >
                    <TestTube className="h-4 w-4" />
                    <span>Test ve Şablonlar</span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
