import { Button } from "@/components/ui/button"
import { Calendar, Shield, Heart } from "lucide-react"

export function Hero() {
  return (
    <section id="home" className="bg-gradient-to-br from-emerald-50 to-teal-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Compassionate Care for Your
              <span className="text-emerald-600"> Mental Health</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Professional psychological services in a safe, supportive environment. I'm here to help you navigate
              life's challenges and discover your inner strength.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
              >
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-emerald-600 mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">Confidential</div>
                  <div className="text-sm text-gray-600">Safe space</div>
                </div>
              </div>
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-emerald-600 mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">Compassionate</div>
                  <div className="text-sm text-gray-600">Caring approach</div>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-emerald-600 mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">Flexible</div>
                  <div className="text-sm text-gray-600">Convenient scheduling</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <img
                src="/placeholder.svg?height=400&width=400"
                alt="Dr. Sarah Johnson in her office"
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-emerald-600 text-white p-6 rounded-xl shadow-lg">
              <div className="text-2xl font-bold">15+</div>
              <div className="text-sm">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
