"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useTranslations } from "@/hooks/use-translations"
import { cn } from "@/lib/utils"

// Form validation schema
const contactFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^\+?[0-9\s-()]+$/, "Please enter a valid phone number"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  acceptPolicy: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy",
  }),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

export default function ContactPage() {
  const { t, isRTL } = useTranslations()
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
      acceptPolicy: false,
    },
  })

  async function onSubmit(data: ContactFormValues) {
    try {
      // TODO: Implement form submission
      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-afkar-purple-light to-afkar-purple rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-bold text-xl">Afkar</span>
          </Link>
        </div>
      </header>

      <main className="container px-4 py-16">
        {/* Contact Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">{t.contactTitle}</h1>
          <p className="text-muted-foreground">{t.contactSubtitle}</p>
        </div>

        {/* Contact Info Cards */}
        <div className={cn(
          "grid md:grid-cols-3 gap-8 mb-16",
          isRTL && "rtl"
        )}>
          {/* Email */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-sm text-muted-foreground mb-4">Our friendly team is here to help.</p>
            <a href="mailto:Hello@Afakar.Com" className="text-sm text-primary hover:underline">
              Hello@Afakar.Com
            </a>
          </div>

          {/* Office */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Office</h3>
            <p className="text-sm text-muted-foreground mb-4">Come say hello at our office HQ.</p>
            <p className="text-sm">
              King Abdullah Road, Al Ebtkar Tower,<br />
              Riyadh, 13254
            </p>
          </div>

          {/* Phone */}
          <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Phone</h3>
            <p className="text-sm text-muted-foreground mb-4">Mon-Fri from 8am to 5pm.</p>
            <a href="tel:966555299422" className="text-sm text-primary hover:underline">
              +966 555 299 422
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Get in touch</h2>
            <p className="text-muted-foreground">
              We&apos;d love to hear from you. Please fill out this form.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.firstName}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.firstName} isRTL={isRTL} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.lastName}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.lastName} isRTL={isRTL} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.email}</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder={t.emailPlaceholder} 
                        isRTL={isRTL} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.phone}</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="+966 5XX XXX XXXX" 
                        isRTL={isRTL} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.message}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t.messagePlaceholder}
                        className="min-h-[120px]"
                        isRTL={isRTL}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptPolicy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        You agree to our friendly{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                          privacy policy
                        </Link>
                        .
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg">
                Send message
              </Button>
            </form>
          </Form>
        </div>

        {/* CTA Section */}
        <div className="mt-32 bg-[#FFF000] rounded-xl p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">{t.ctaTitle}</h2>
            <Button variant="default" size="lg" asChild>
              <Link href="/signup">{t.signUpFree}</Link>
            </Button>
          </div>
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 left-0 w-32 h-32 border-2 border-black/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-40 h-40 border-2 border-black/10 rounded-full translate-x-1/4 translate-y-1/4" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-32">
        <div className="container px-4 py-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>{t.rights}</p>
            <nav className="flex gap-4">
              <Link href="/terms" className="hover:text-foreground">{t.terms}</Link>
              <Link href="/privacy" className="hover:text-foreground">{t.privacy}</Link>
              <Link href="/cookies" className="hover:text-foreground">{t.cookies}</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
} 