"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import PublicNav from "@/components/PublicNav";

export default function EditListingPage() {
  const supabase = createBrowserClient();
  const params = useParams();
  const router = useRouter();
  const listingId = params.listingId as string;

  const [form, setForm] = useState({
    species: "dog", species_other: "", breed: "", age: "", gender: "unknown",
    spayed_neutered: false, location: "", description: "",
    foster_name: "", foster_mobile: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.from("adoption_listings").select("*").eq("id", listingId).single().then(({ data }) => {
      if (data) {
        setForm({
          species: data.species, species_other: data.species_other ?? "",
          breed: data.breed ?? "", age: data.age ?? "", gender: data.gender ?? "unknown",
          spayed_neutered: data.spayed_neutered ?? false, location: data.location ?? "",
          description: data.description ?? "",
          foster_name: data.foster_name, foster_mobile: data.foster_mobile,
        });
        setPhotos(data.photos ?? []);
      }
      setLoaded(true);
    });
  }, [listingId]);

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `adoptions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from("photos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    setPhotos((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const { error: updateErr } = await supabase.from("adoption_listings").update({
      species: form.species,
      species_other: form.species === "other" ? form.species_other : null,
      breed: form.breed || null,
      age: form.age || null,
      gender: form.gender,
      spayed_neutered: form.spayed_neutered,
      location: form.location || null,
      description: form.description || null,
      photos: photos,
      foster_name: form.foster_name,
      foster_mobile: form.foster_mobile,
    }).eq("id", listingId);

    setSaving(false);
    if (updateErr) { setError(updateErr.message); return; }
    router.push("/foster/manage");
  }

  if (!loaded) {
    return <div className="min-h-screen bg-brand-cream flex items-center justify-center"><p className="text-brand-orange animate-pulse">Loading…</p></div>;
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/adopt" />

      <div className="max-w-lg mx-auto px-4 pb-12">
        <h1 className="font-heading text-3xl font-bold mb-2">Edit Listing</h1>
        <p className="text-gray-500 mb-6">Update the details for this adoption listing.</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Animal *</label>
            <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm">
              <option value="dog">🐕 Dog</option><option value="cat">🐱 Cat</option><option value="other">🐾 Other</option>
            </select>
          </div>
          {form.species === "other" && (
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Specify Species *</label>
              <input value={form.species_other} onChange={(e) => setForm({ ...form, species_other: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" /></div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Breed</label>
              <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Age</label>
              <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm">
                <option value="male">Male</option><option value="female">Female</option><option value="unknown">Unknown</option>
              </select></div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.spayed_neutered} onChange={(e) => setForm({ ...form, spayed_neutered: e.target.checked })} className="rounded accent-[#FF8C42]" />
                Spayed/Neutered
              </label>
            </div>
          </div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" /></div>

          {/* Photos */}
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
          </div>

          <div><label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2.5 text-sm" /></div>
          <hr />
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Foster Name *</label>
            <input required value={form.foster_name} onChange={(e) => setForm({ ...form, foster_name: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" /></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-1">Foster Mobile *</label>
            <input required value={form.foster_mobile} onChange={(e) => setForm({ ...form, foster_mobile: e.target.value })} className="w-full border rounded-lg px-3 py-2.5 text-sm" /></div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} className="flex-1 border rounded-lg py-3 font-semibold text-gray-600">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
