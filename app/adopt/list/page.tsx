"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { toE164 } from "@/lib/phone";
import { buildWaLink, matchingWishMessage } from "@/lib/click-to-chat";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";

export default function ListAdoptionPage() {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [matches, setMatches] = useState<
    { id: string; requester_name: string; requester_mobile: string; breed: string | null; species: string; species_other: string | null }[]
  >([]);
  const [form, setForm] = useState({
    species: "dog", species_other: "", breed: "", age: "", gender: "unknown",
    spayed_neutered: false, location: "", description: "",
    foster_name: "", foster_mobile: "", foster_email: "",
  });

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = input.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const urls: string[] = [];
    let failed = 0;
    let lastErr = "";
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `adoptions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        urls.push(data.publicUrl);
      } else {
        failed++;
        lastErr = upErr.message;
      }
    }
    if (urls.length > 0) setPhotos((prev) => [...prev, ...urls]);
    if (failed > 0) {
      setError(`${failed} photo${failed === 1 ? "" : "s"} failed to upload${lastErr ? ` (${lastErr})` : ""}. Please try again.`);
    }
    setUploading(false);
    input.value = ""; // allow re-selecting the same file after a failure
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.foster_name || !form.foster_mobile) { setError("Foster name and mobile are required"); return; }
    if (form.species === "other" && !form.species_other) { setError("Please specify the species"); return; }
    if (photos.length === 0) { setError("Please add at least one photo of the animal — adoption posts without a photo can't be shared."); return; }

    setSaving(true);
    const { error: insertErr } = await supabase.from("adoption_listings").insert({
      species: form.species,
      species_other: form.species === "other" ? form.species_other : null,
      breed: form.breed || null,
      age: form.age || null,
      gender: form.gender,
      spayed_neutered: form.spayed_neutered,
      location: form.location || null,
      description: form.description || null,
      photos: photos.length > 0 ? photos : [],
      foster_name: form.foster_name,
      foster_mobile: toE164(form.foster_mobile),
      foster_email: form.foster_email.trim() ? form.foster_email.trim().toLowerCase() : null,
    });
    setSaving(false);

    if (insertErr) { setError(insertErr.message); return; }

    // Notify the wishlist: find open requests for this species and surface them
    // so the foster can reach out to matching adopters.
    const { data: wishes } = await supabase
      .from("adoption_wishes")
      .select("id, requester_name, requester_mobile, breed, species, species_other")
      .eq("status", "open")
      .eq("species", form.species);

    if (wishes && wishes.length > 0) {
      setMatches(wishes as typeof matches);
      return; // show matches; foster continues from there
    }

    router.push("/foster/manage");
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/adopt" />

      <div className="max-w-lg mx-auto px-4 pb-12">
        <h1 className="font-heading text-3xl font-bold mb-2">Put Up for Adoption</h1>
        <p className="text-gray-500 mb-6">Fosters and community caretakers can list an animal for adoption here.</p>

        {matches.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="font-heading text-xl font-bold">Listing posted!</h2>
              <p className="text-gray-500 text-sm mt-1">
                {matches.length} {matches.length === 1 ? "person is" : "people are"} looking for a {form.species}. Reach out to let them know it&apos;s available.
              </p>
            </div>
            <div className="space-y-2 mb-5">
              {matches.map((m) => {
                const label = m.species === "other" ? m.species_other || "animal" : m.species;
                const url = typeof window !== "undefined" ? `${window.location.origin}/adopt` : "/adopt";
                const wa = buildWaLink(
                  m.requester_mobile,
                  matchingWishMessage(m.requester_name, `${form.breed ? form.breed + " " : ""}${label}`, url)
                );
                return (
                  <div key={m.id} className="flex items-center justify-between border rounded-xl p-3">
                    <div>
                      <p className="font-semibold text-sm">{m.requester_name}</p>
                      {m.breed && <p className="text-xs text-gray-500">Wants: {m.breed}</p>}
                    </div>
                    {wa && (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:brightness-110 transition">
                        Notify
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => router.push("/foster/manage")}
              className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition"
            >
              Continue to My Listings
            </button>
          </div>
        ) : (
          <>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Animal *</label>
            <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm">
              <option value="dog">🐕 Dog</option>
              <option value="cat">🐱 Cat</option>
              <option value="other">🐾 Other</option>
            </select>
          </div>
          {form.species === "other" && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Specify Species *</label>
              <input value={form.species_other} onChange={(e) => setForm({ ...form, species_other: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="e.g. Rabbit, Bird" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Breed</label>
              <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="e.g. Indie, Lab mix" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Age</label>
              <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="e.g. 2 years" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.spayed_neutered} onChange={(e) => setForm({ ...form, spayed_neutered: e.target.checked })} className="rounded accent-[#FF8C42]" />
                Spayed/Neutered
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="e.g. Banjara Hills, Hyderabad" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Photos *</label>
            <input type="file" accept="image/*" multiple onChange={handlePhotos} className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-orange/10 file:text-brand-orange file:font-semibold hover:file:bg-brand-orange/20 file:cursor-pointer" />
            {uploading && <p className="text-xs text-brand-orange mt-1 animate-pulse">Uploading…</p>}
            {photos.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {photos.map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-1">At least one clear photo is required. Max 5 photos.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="Tell us about the animal's personality, health, etc." />
          </div>
          <hr />
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Foster Name *</label>
            <input required value={form.foster_name} onChange={(e) => setForm({ ...form, foster_name: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Foster Mobile *</label>
            <input required value={form.foster_mobile} onChange={(e) => setForm({ ...form, foster_mobile: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Foster Email <span className="font-normal text-gray-400">(optional)</span></label>
            <input type="email" value={form.foster_email} onChange={(e) => setForm({ ...form, foster_email: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="you@example.com" />
            <p className="text-xs text-gray-400 mt-1">Used to log in to your foster dashboard without WhatsApp. Your one-time login code (OTP) will be emailed here, so please enter it correctly.</p>
          </div>
          <button type="submit" disabled={saving || uploading} className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50">
            {saving ? "Posting…" : uploading ? "Uploading photo…" : "Post Adoption Listing"}
          </button>
        </form>
          </>
        )}
      </div>
    </div>
  );
}
