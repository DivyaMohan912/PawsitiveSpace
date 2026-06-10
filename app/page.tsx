"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import { createBrowserClient } from "@/lib/supabase";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import { loadHomeStats } from "./actions";
import { registerVolunteer } from "./shared-actions";

/* ------------------------------------------------------------------ */
/*  Inline SVG illustrations                                          */
/* ------------------------------------------------------------------ */

function DogIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ fontSize: "8rem", lineHeight: 1 }}>
      🐕
    </div>
  );
}

function CatIllustration({ className = "", earTipped = false }: { className?: string; earTipped?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body */}
      <ellipse cx="100" cy="140" rx="45" ry="40" fill="#B8B8C8" />
      {/* head */}
      <circle cx="100" cy="85" r="35" fill="#C8C8D8" />
      {/* ears */}
      <polygon points="72,55 60,25 85,48" fill="#C8C8D8" />
      <polygon points="128,55 140,25 115,48" fill="#C8C8D8" />
      {/* inner ears */}
      <polygon points="74,52 65,32 83,48" fill="#E8B4B8" />
      <polygon points="126,52 135,32 117,48" fill="#E8B4B8" />
      {/* ear tip (TNR indicator) */}
      {earTipped && <polygon points="140,25 135,32 145,30" fill="#FF8C42" />}
      {/* eyes */}
      <ellipse cx="88" cy="82" rx="5" ry="6" fill="#7CB87C" />
      <ellipse cx="112" cy="82" rx="5" ry="6" fill="#7CB87C" />
      <ellipse cx="88" cy="82" rx="2" ry="5.5" fill="#1A1A2E" />
      <ellipse cx="112" cy="82" rx="2" ry="5.5" fill="#1A1A2E" />
      {/* nose */}
      <polygon points="97,93 103,93 100,97" fill="#E8A0A8" />
      {/* whiskers */}
      <line x1="60" y1="90" x2="85" y2="92" stroke="#AAA" strokeWidth="1" />
      <line x1="60" y1="95" x2="85" y2="95" stroke="#AAA" strokeWidth="1" />
      <line x1="115" y1="92" x2="140" y2="90" stroke="#AAA" strokeWidth="1" />
      <line x1="115" y1="95" x2="140" y2="95" stroke="#AAA" strokeWidth="1" />
      {/* paws */}
      <ellipse cx="75" cy="175" rx="10" ry="7" fill="#C8C8D8" />
      <ellipse cx="125" cy="175" rx="10" ry="7" fill="#C8C8D8" />
      {/* tail */}
      <path d="M145 135 Q170 120 165 95 Q162 85 155 90" stroke="#B8B8C8" strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function TNRBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
      <svg viewBox="0 0 16 16" className="w-3 h-3"><circle cx="8" cy="8" r="6" fill="#25D366" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      TNR ✓
    </span>
  );
}

function PawIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 18c-2.2 0-4-1.3-4-3s1.8-3 4-3 4 1.3 4 3-1.8 3-4 3zm-5.5-5.5a2 2 0 100-4 2 2 0 000 4zm3-3.5a2 2 0 100-4 2 2 0 000 4zm5 0a2 2 0 100-4 2 2 0 000 4zm3 3.5a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

interface Listing {
  id: string;
  species: string;
  species_other: string | null;
  breed: string | null;
  age: string | null;
  gender: string | null;
  spayed_neutered: boolean;
  location: string | null;
  description: string | null;
  photos: string[];
  foster_name: string;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function Home() {
  const supabase = createBrowserClient();
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState({ rescued: 0, adopted: 0, tnr: 0, fosters: 0 });

  useEffect(() => {
    loadHomeStats().then(setStats);
    supabase
      .from("adoption_listings")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setListings((data ?? []) as Listing[]));
  }, []);

  return (
    <div className="min-h-screen">
      {/* ---- Navbar ---- */}
      <PublicNav current="/" />

      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-8 lg:mx-auto max-w-6xl bg-gradient-to-br from-brand-orange via-brand-amber to-brand-yellow px-6 sm:px-12 py-12 sm:py-16">
        <div className="relative z-10 max-w-lg">
          <span className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
            <PawIcon className="w-4 h-4" /> Hyderabad Animal Rescue
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Every paw<br />deserves a home
          </h1>
          <p className="text-white/80 mt-3 text-lg">Report · Rescue · Adopt · Return</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/report"
              className="inline-flex items-center gap-2 bg-white text-brand-orange font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              Report an animal <span aria-hidden>↗</span>
            </Link>
            <Link
              href="/adopt"
              className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              Adopt now
            </Link>
            <a
              href="#volunteer"
              className="inline-flex items-center gap-2 border-2 border-white/60 text-white font-bold px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              🙋 Volunteer
            </a>
          </div>
        </div>

        {/* Floating illustrations */}
        <div className="absolute right-4 sm:right-12 top-8 sm:top-6 flex items-end gap-0">
          <CatIllustration className="w-24 sm:w-32 animate-float-slow opacity-90" earTipped />
          <DogIllustration className="w-32 sm:w-44 animate-float -ml-4" />
        </div>
      </section>

      {/* ---- Stats Bar ---- */}
      <section className="mx-4 sm:mx-8 lg:mx-auto max-w-6xl -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
          {[
            { value: stats.rescued, label: "RESCUED", color: "text-brand-orange" },
            { value: stats.adopted, label: "ADOPTED", color: "text-green-600" },
            { value: stats.tnr, label: "TNR CATS", color: "text-brand-amber" },
            { value: stats.fosters, label: "FOSTERS", color: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="text-center py-6 px-4">
              <p className={`text-3xl sm:text-4xl font-heading font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs font-bold tracking-wider text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Adoptable Animals ---- */}
      <section id="adopt" className="max-w-6xl mx-auto px-5 mt-14 mb-10">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-6">
          Needs a home <span aria-hidden>🏠</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => (
            <Link
              key={l.id}
              href={`/adopt/${l.id}`}
              className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow group block"
            >
              <div className="flex justify-center py-4">
                {l.photos && l.photos.length > 0 ? (
                  <img src={l.photos[0]} alt="" className="w-40 h-40 rounded-xl object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <AnimalAvatar species={l.species} size={140} />
                )}
              </div>
              <h3 className="font-heading font-bold text-lg capitalize">
                {l.species === "other" ? l.species_other ?? "Animal" : l.species}
                {l.breed && <span className="text-gray-500 font-normal text-sm"> · {l.breed}</span>}
              </h3>
              <p className="text-sm text-gray-500">
                {l.age ?? "Age unknown"} · {l.gender ?? "?"} {l.spayed_neutered ? " · ✂️ Spayed/Neutered" : ""}
              </p>
              {l.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{l.description}</p>}
              <p className="text-xs text-gray-400 mt-2">Foster: {l.foster_name}</p>
              <div className="mt-3">
                <span className="inline-block bg-brand-orange text-white font-bold py-1.5 px-4 rounded-lg text-sm group-hover:brightness-110 transition">
                  View Details →
                </span>
              </div>
            </Link>
          ))}
          {listings.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 mb-3">No animals listed for adoption right now.</p>
              <Link href="/adopt/list" className="text-brand-orange font-bold hover:underline">Be the first to list one →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ---- Volunteer Registration ---- */}
      <section id="volunteer" className="max-w-6xl mx-auto px-5 mt-14 mb-10">
        <VolunteerRegistration />
      </section>

      {/* ---- Footer ---- */}
      <footer className="text-center text-xs text-gray-400 pb-8">
        © 2026 PawsitiveSpace · Hyderabad, India · Built with 🐾 ·{" "}
        <Link href="/contact" className="text-brand-orange hover:underline">Contact Us</Link>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Volunteer Registration Component                                  */
/* ------------------------------------------------------------------ */

function VolunteerRegistration() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", mobile: "", location: "", role: "rescuer",
    availability: "weekends", reason: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.mobile.trim() || !form.location.trim()) {
      setError("Name, mobile and location are required.");
      return;
    }
    setError("");
    setSubmitting(true);

    const res = await registerVolunteer(form);
    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || "Registration failed. Please try again.");
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="font-heading text-xl font-bold mb-1">Thank You! 🎉</h3>
        <p className="text-gray-600 text-sm">Your volunteer application has been received. Our team will reach out to you soon via WhatsApp.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold">
            Make a Difference 🙋
          </h2>
          <p className="text-gray-500 mt-1">Join our community of volunteers helping animals in Hyderabad.</p>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 bg-brand-orange text-white font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:brightness-110 transition"
          >
            Register as a Volunteer <span aria-hidden>↗</span>
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp Number *</label>
              <input
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Location / Area *</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              placeholder="e.g. Madhapur, Gachibowli, Secunderabad"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">I want to volunteer for *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
              >
                <option value="rescuer">🚑 Rescue — Help rescue animals in distress</option>
                <option value="foster">🏠 Foster — Provide temporary home for animals</option>
                <option value="transporter">🚗 Transport — Help transport animals</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Availability *</label>
              <select
                value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}
                className="w-full border rounded-lg px-3 py-2.5 text-sm"
              >
                <option value="weekdays">Weekdays only</option>
                <option value="weekends">Weekends only</option>
                <option value="both">Weekdays & Weekends</option>
                <option value="flexible">Flexible / On-call</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Why do you want to volunteer?</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3}
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
              placeholder="Tell us about your experience or motivation…"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 border rounded-lg py-3 font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50"
            >
              {submitting ? "Registering…" : "Register as Volunteer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
