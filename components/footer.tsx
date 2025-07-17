import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h3 className="text-2xl font-bold text-emerald-400 mb-4">Dr. Sarah Johnson</h3>
            <p className="text-gray-300 mb-4">
              Licensed Clinical Psychologist dedicated to providing compassionate, evidence-based mental health care in
              a safe and supportive environment.
            </p>
            <div className="flex items-center text-emerald-400">
              <Heart className="h-4 w-4 mr-2" />
              <span className="text-sm">Caring for your mental wellness</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="#home" className="hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-emerald-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-emerald-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-emerald-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="#" className="hover:text-emerald-400 transition-colors">
                  Patient Forms
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-emerald-400 transition-colors">
                  Insurance Info
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-emerald-400 transition-colors">
                  Crisis Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Dr. Sarah Johnson, Licensed Clinical Psychologist. All rights reserved.</p>
          <p className="text-sm mt-2">License #12345 | California Board of Psychology</p>
        </div>
      </div>
    </footer>
  )
}
