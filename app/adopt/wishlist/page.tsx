"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";
import { toE164 } from "@/lib/phone";
import PublicNav from "@/components/PublicNav";

export default function WishlistPage() {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    species: "dog",
    species_other: "",
    breed: "",
    age_preference: "",
    location: "",
    notes: "",
    requester_name: "",
    requester_mobile: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.requester_name || !form.requester_mobile) {
      setError("Your name and mobile are required");
      return;
    }
    if (form.species === "other" && !form.species_other) {
      setError("Please specify the type of animal");
      return;
    }

    setSaving(true);
    const { error: insertErr } = await supabase.from("adoption_wishes").insert({
      species: form.species,
      species_other: form.species === "other" ? form.species_other : null,
      breed: form.breed || null,
      age_preference: form.age_preference || null,
      location: form.location || null,
      notes: form.notes || null,
      requester_name: form.requester_name,
      requester_mobile: toE164(form.requester_mobile),
    });
    setSaving(false);

    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/adopt" />

      <div className="max-w-lg mx-auto px-4 pb-12">
        <h1 className="font-heading text-3xl font-bold mb-2">Add to Your Wishlist</h1>
        <p className="text-gray-500 mb-6">
          Can&apos;t find what you&apos;re looking for? Tell us the type of animal you&apos;d like to adopt
          (e.g. a Labrador puppy or a guinea pig). Our fosters will see your wishlist and reach out if a match comes along.
        </p>

        {done ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-4xl mb-3">🐾</div>
            <h2 className="font-heading text-xl font-bold mb-2">Wishlist added!</h2>
            <p className="text-gray-500 mb-6">
              Your wishlist is now visible to our fosters. If a matching animal becomes available, they&apos;ll reach out to you directly.
            </p>
            <Link href="/adopt" className="inline-block bg-brand-orange text-white font-bold px-5 py-2.5 rounded-lg hover:brightness-110 transition">
              Browse available animals
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Type of Animal *</label>
                <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm">
                  <option value="dog">🐕 Dog</option>
                  <option value="cat">🐱 Cat</option>
                  <option value="other">🐾 Other</option>
                </select>
              </div>
              {form.species === "other" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Specify Animal *</label>
                  <input value={form.species_other} onChange={(e) => setForm({ ...form, species_other: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="e.g. Guinea pig, Rabbit, Bird" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Breed / Details</label>
                  <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="e.g. Labrador, Indie" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Age Preference</label>
                  <input value={form.age_preference} onChange={(e) => setForm({ ...form, age_preference: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="e.g. Puppy, Adult" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="e.g. Banjara Hills, Hyderabad" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="Tell us anything else about what you're looking for." />
              </div>
              <hr />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Your Name *</label>
                <input required value={form.requester_name} onChange={(e) => setForm({ ...form, requester_name: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Your Mobile *</label>
                <input required value={form.requester_mobile} onChange={(e) => setForm({ ...form, requester_mobile: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="+91 98765 43210" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50">
                {saving ? "Submitting…" : "Submit Wishlist"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
