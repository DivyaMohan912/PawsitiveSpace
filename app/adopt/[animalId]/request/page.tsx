"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { submitAdoptionRequest } from "./actions";

export default function RequestPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const listingId = params.animalId as string;
  const commitmentRef = searchParams.get("commitment");
  const router = useRouter();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !mobile.trim()) { setError("Name and mobile are required"); return; }

    setSaving(true);
    const res = await submitAdoptionRequest({
      listingId,
      commitmentRef: commitmentRef || null,
      name: name.trim(),
      mobile: mobile.trim(),
    });
    setSaving(false);

    if (!res.success) {
      setError(res.error || "Something went wrong");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="font-heading text-2xl font-bold mb-2">Adoption Request Submitted!</h1>
          <p className="text-gray-600 mb-4">The foster will review your request and contact you on your mobile number.</p>
          <p className="text-xs text-gray-400 mb-6">You can only have one active adoption request at a time. Once this is resolved, you can request again.</p>
          <Link href="/adopt" className="text-brand-orange font-bold hover:underline">← Back to Listings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <nav className="px-5 py-4 max-w-3xl mx-auto">
        <Link href="/" className="font-heading font-bold text-xl">🐾 PawsitiveSpace</Link>
      </nav>

      <div className="max-w-md mx-auto px-4 pb-12">
        <h1 className="font-heading text-2xl font-bold mb-2">Request Adoption</h1>
        <p className="text-gray-500 mb-6">Enter your details to request this adoption. The foster will see your name and mobile number.</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Your Mobile Number *</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 rounded-l-lg text-sm text-gray-500">+91</span>
              <input required value={mobile} onChange={(e) => setMobile(e.target.value)} className="flex-1 border rounded-r-lg px-3 py-2.5 text-sm" placeholder="9876543210" maxLength={10} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Only visible to the foster and admin. Not shown publicly.</p>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50">
            {saving ? "Submitting…" : "Submit Adoption Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
