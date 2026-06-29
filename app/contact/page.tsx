"use client";

import { useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import { submitContactForm } from "@/app/shared-actions";
import { orgWaLink } from "@/lib/click-to-chat";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.subject.trim() || !form.message.trim()) {
      setError("Name, subject and message are required.");
      return;
    }
    setError("");
    setSubmitting(true);

    const res = await submitContactForm(form);
    if (res.success) {
      setSubmitted(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <PublicNav current="/contact" />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">Message Sent!</h1>
          <p className="text-gray-500 mb-6">Thank you for reaching out. We&apos;ll get back to you as soon as possible.</p>
          <Link href="/" className="text-brand-orange font-bold hover:underline">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/contact" />

      <div className="max-w-2xl mx-auto px-4 pb-12">
        <h1 className="font-heading text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-8">Have questions about adoption, volunteering, or rescues? We&apos;d love to hear from you.</p>

        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-5 text-center">
            <p className="text-3xl mb-2">📍</p>
            <h3 className="font-bold text-sm mb-1">Location</h3>
            <p className="text-sm text-gray-500">Hyderabad, Telangana, India</p>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center">
            <p className="text-3xl mb-2">📱</p>
            <h3 className="font-bold text-sm mb-1">WhatsApp</h3>
            <a href={orgWaLink()} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-orange font-bold hover:underline">Tap to chat with us</a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              placeholder="Full name"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Mobile</label>
              <input
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Subject *</label>
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
            >
              <option value="">Select a topic</option>
              <option value="Adoption Inquiry">Adoption Inquiry</option>
              <option value="Volunteering">Volunteering</option>
              <option value="Rescue Help">Rescue Help</option>
              <option value="Fostering">Fostering</option>
              <option value="Feedback">Feedback</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              placeholder="Tell us how we can help…"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
