"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(4, "Subject must be at least 4 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(values: ContactFormValues) {
    await new Promise((r) => setTimeout(r, 400));
    toast.success(`Inquiry received from ${values.name}. Admissions will reply to ${values.email}.`);
    reset();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Contact Admissions & Registrar
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Have questions about enrollment, transcripts, or tuition? Reach out to our campus office.
        </p>
      </div>

      <div className="grid items-start gap-8 md:grid-cols-3">
        <div className="space-y-4">
          <Card interactive>
            <CardContent className="flex items-start gap-3 p-5">
              <MapPin className="mt-0.5 h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold">Campus Address</p>
                <p className="text-xs text-slate-500">Academic Building 1, Dhaka 1212</p>
              </div>
            </CardContent>
          </Card>
          <Card interactive>
            <CardContent className="flex items-start gap-3 p-5">
              <Mail className="mt-0.5 h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold">Registrar Email</p>
                <p className="text-xs text-slate-500">registrar@university.edu</p>
              </div>
            </CardContent>
          </Card>
          <Card interactive>
            <CardContent className="flex items-start gap-3 p-5">
              <Phone className="mt-0.5 h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold">Helpline</p>
                <p className="text-xs text-slate-500">+880 1700-000001</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Send an Inquiry</CardTitle>
            <CardDescription>All fields are validated before submission.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input placeholder="Ada Lovelace" {...register("name")} />
                  {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="ada@university.edu" {...register("email")} />
                  {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Fall 2026 Course Registration" {...register("subject")} />
                {errors.subject && <p className="text-xs text-rose-600">{errors.subject.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  rows={4}
                  placeholder="Write your question..."
                  {...register("message")}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                />
                {errors.message && <p className="text-xs text-rose-600">{errors.message.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                <Send className="h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
