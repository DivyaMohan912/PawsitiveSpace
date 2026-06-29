"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import { submitReport } from "./actions";

export default function ReportPage() {
  const supabase = createBrowserClient();
  const [form, setForm] = useState({
    species: "dog", location: "", description: "", urgency: "medium", reporter_name: "", reporter_whatsapp: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [caseId, setCaseId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `reports/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    setPhotos((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function shareLocation() {
    if (!navigator.geolocation) { setError("Geolocation is not supported by your browser"); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setForm((f) => ({ ...f, location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}${f.location ? " — " + f.location : ""}` }));
        setGeoLoading(false);
      },
      (err) => { setError("Location access denied. Please type the location manually."); setGeoLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await submitReport({
        species: form.species,
        location: form.location,
        description: form.description,
        urgency: form.urgency,
        reporter_name: form.reporter_name,
        reporter_whatsapp: form.reporter_whatsapp,
        photos,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      });

      if (!res.success) throw new Error(res.error);

      setCaseId(res.caseId!);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="font-heading text-2xl font-bold mb-2">Report Submitted!</h1>
          <p className="text-gray-600 mb-2">Your case ID is:</p>
          <p className="text-3xl font-mono font-bold text-brand-orange mb-4">{caseId}</p>
          <p className="text-sm text-gray-500 mb-6">Save this ID — you can track the status anytime on the case page. Our team will reach out by phone if needed.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="text-brand-orange font-bold hover:underline">← Home</Link>
            <Link href="/report" onClick={() => { setSubmitted(false); setForm({ species: "dog", location: "", description: "", urgency: "medium", reporter_name: "", reporter_whatsapp: "" }); }} className="text-brand-orange font-bold hover:underline">Report Another</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/report" />

      <div className="max-w-lg mx-auto px-4 pb-12">
        <h1 className="font-heading text-3xl font-bold mb-2">Report an Animal</h1>
        <p className="text-gray-500 mb-6">Spotted a stray or injured animal? Fill in the details below and our rescue team will respond.</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Species *</label>
            <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm">
              <option value="dog">🐕 Dog</option>
              <option value="cat">🐱 Cat</option>
              <option value="other">🐾 Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Location *</label>
            <div className="flex gap-2">
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Near Jubilee Hills Check Post, Hyderabad" className="flex-1 border rounded-lg px-3 py-2.5 text-sm" />
              <button type="button" onClick={shareLocation} disabled={geoLoading}
                className="shrink-0 border-2 border-brand-orange text-brand-orange font-bold px-3 py-2 rounded-lg text-sm hover:bg-brand-orange/10 transition disabled:opacity-50">
                {geoLoading ? "Locating…" : "📍 GPS"}
              </button>
            </div>
            {coords && <p className="text-[10px] text-green-600 mt-1">✓ GPS coordinates captured: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Photos</label>
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
            <p className="text-[10px] text-gray-400 mt-1">Upload photos of the animal to help rescuers identify it quickly.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description *</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the animal's condition — injuries, behavior, how many, etc." className="w-full border rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Urgency</label>
            <div className="flex gap-3">
              {[{ v: "high", l: "🔴 High", c: "border-red-400 bg-red-50" }, { v: "medium", l: "🟡 Medium", c: "border-amber-400 bg-amber-50" }, { v: "low", l: "🟢 Low", c: "border-green-400 bg-green-50" }].map((o) => (
                <button key={o.v} type="button" onClick={() => setForm({ ...form, urgency: o.v })}
                  className={`flex-1 border-2 rounded-lg py-2 text-sm font-semibold transition ${form.urgency === o.v ? o.c : "border-gray-200"}`}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <hr />
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
            <input value={form.reporter_name} onChange={(e) => setForm({ ...form, reporter_name: e.target.value })} placeholder="Optional" className="w-full border rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your WhatsApp Number *</label>
            <input required value={form.reporter_whatsapp} onChange={(e) => setForm({ ...form, reporter_whatsapp: e.target.value })} placeholder="+91 98765 43210" className="w-full border rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50">
            {saving ? "Submitting…" : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
