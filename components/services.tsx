import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Heart, Users, Lightbulb, Clock, MapPin } from "lucide-react"

export function Services() {
  const services = [
    {
      icon: Brain,
      title: "Individual Therapy",
      description: "One-on-one sessions focused on your personal mental health goals and challenges.",
      duration: "50 minutes",
      price: "$150",
    },
    {
      icon: Users,
      title: "Couples Therapy",
      description: "Relationship counseling to improve communication and strengthen your bond.",
      duration: "60 minutes",
      price: "$200",
    },
    {
      icon: Heart,
      title: "Family Therapy",
      description: "Family-focused sessions to address dynamics and improve relationships.",
      duration: "60 minutes",
      price: "$180",
    },
    {
      icon: Lightbulb,
      title: "Group Therapy",
      description: "Small group sessions for shared experiences and peer support.",
      duration: "90 minutes",
      price: "$75",
    },
  ]

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Therapeutic Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive mental health services tailored to your individual needs and goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <service.icon className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration}
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">{service.price}</div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Insurance & Payment</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Accepted Insurance</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Blue Cross Blue Shield</li>
                    <li>• Aetna</li>
                    <li>• Cigna</li>
                    <li>• United Healthcare</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Options</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Insurance co-pay</li>
                    <li>• Self-pay</li>
                    <li>• HSA/FSA accepted</li>
                    <li>• Sliding scale available</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Office Hours</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>Monday - Thursday</span>
                  <span>9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday</span>
                  <span>9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center text-emerald-700">
                  <MapPin className="h-5 w-5 mr-2" />
                  <div>
                    <div className="font-semibold">Office Location</div>
                    <div className="text-sm">
                      123 Wellness Drive, Suite 200
                      <br />
                      San Francisco, CA 94102
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
