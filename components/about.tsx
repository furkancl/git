import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Award, Users, BookOpen } from "lucide-react"

export function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">About Dr. Sarah Johnson</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            With over 15 years of experience in clinical psychology, I am dedicated to helping individuals overcome
            challenges and achieve mental wellness.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img
              src="/placeholder.svg?height=500&width=400"
              alt="Dr. Sarah Johnson"
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">My Approach</h3>
            <p className="text-gray-600 leading-relaxed">
              I believe in creating a warm, non-judgmental environment where clients feel safe to explore their thoughts
              and emotions. My therapeutic approach combines evidence-based practices with compassionate care, tailored
              to each individual's unique needs.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether you're dealing with anxiety, depression, relationship issues, or life transitions, I'm here to
              support you on your journey toward healing and personal growth.
            </p>

            <div className="bg-emerald-50 p-6 rounded-xl">
              <h4 className="font-semibold text-emerald-800 mb-2">Specializations</h4>
              <ul className="text-emerald-700 space-y-1">
                <li>• Cognitive Behavioral Therapy (CBT)</li>
                <li>• Mindfulness-Based Interventions</li>
                <li>• Trauma-Informed Care</li>
                <li>• Family and Couples Therapy</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <GraduationCap className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
              <p className="text-sm text-gray-600">Ph.D. Clinical Psychology, Stanford University</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Award className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Licensed</h3>
              <p className="text-sm text-gray-600">California Board of Psychology License #12345</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <Users className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
              <p className="text-sm text-gray-600">15+ years helping individuals and families</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <BookOpen className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Research</h3>
              <p className="text-sm text-gray-600">Published researcher in anxiety and depression</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
