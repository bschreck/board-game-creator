"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Clock } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-8">
          Have a question or need help? We&apos;d love to hear from you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <Mail className="h-6 w-6 text-violet-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
            <p className="text-sm text-gray-500">support@boardcraft.com</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <Clock className="h-6 w-6 text-violet-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
            <p className="text-sm text-gray-500">Within 24 hours</p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-8 text-center">
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">
              Message Sent!
            </h3>
            <p className="text-sm text-emerald-700">
              Thanks for reaching out. We&apos;ll get back to you within 24
              hours.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
          >
            <h3 className="font-semibold text-gray-900 mb-2">
              Send us a message
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Name
                </label>
                <Input placeholder="Your name" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Email
                </label>
                <Input type="email" placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Subject
              </label>
              <Input placeholder="What can we help with?" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Message
              </label>
              <Textarea
                placeholder="Tell us more..."
                rows={5}
                required
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Send Message
            </Button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
