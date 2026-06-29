"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { submitAdoptionCommitment } from "./actions";

/* ------------------------------------------------------------------ */
/*  Zod schema for Step 3                                             */
/* ------------------------------------------------------------------ */

const adopterSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  mobile_number: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  id_type: z.enum(["Aadhaar", "PAN", "Voter ID", "Passport", "Driving Licence"], { message: "Select an ID type" }),
  id_last4: z.string().regex(/^\d{4}$/, "Enter exactly 4 digits"),
  address: z.string().min(10, "Enter your full address"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type AdopterData = z.infer<typeof adopterSchema>;

/* ------------------------------------------------------------------ */
/*  Commitment items                                                  */
/* ------------------------------------------------------------------ */

const COMMITMENTS = [
  { icon: "⏰", title: "Time & Daily Care", desc: "I will provide fresh food, clean water, shelter, exercise, and daily attention to the animal." },
  { icon: "💰", title: "Financial Responsibility", desc: "I accept full financial responsibility for the animal's food, medical needs, grooming, and any emergency care." },
  { icon: "🏠", title: "Family & Belonging", desc: "I will treat this animal as a family member and provide a safe, loving home environment." },
  { icon: "🏥", title: "Veterinary Care", desc: "I will ensure regular vaccinations, deworming, sterilization (if not done), and immediate veterinary attention when sick or injured." },
  { icon: "⚖️", title: "Legal Accountability", desc: "I understand that animal cruelty and abandonment are punishable offenses under the Prevention of Cruelty to Animals Act 1960 and IPC sections 428/429." },
];

const CHECKBOXES = [
  "I commit to providing daily care including food, water, shelter, and exercise.",
  "I accept full financial responsibility for all the animal's needs.",
  "I commit to keeping this animal for its entire life — I will not abandon, rehome, or give away without PawsitiveSpace's written consent.",
  "I will never subject the animal to any form of ill-treatment, cruelty, or neglect.",
  "I will ensure regular veterinary check-ups, vaccinations, deworming, and immediate medical attention when needed.",
  "I agree to allow PawsitiveSpace volunteers to conduct follow-up home visits at 1 week, 1 month, and 3 months after adoption.",
  "I understand that animal abandonment and cruelty are punishable under the Prevention of Cruelty to Animals Act 1960 and IPC sections 428/429.",
  "I understand that if verified reports of abandonment or cruelty are filed against me, my profile will be flagged and I may be barred from future adoptions.",
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function CommitmentPage() {
  const params = useParams();
  const animalId = params.animalId as string;
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState<boolean[]>(new Array(8).fill(false));
  const [signature, setSignature] = useState("");
  const [finalAck, setFinalAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referenceId: string; animalName: string; chatLink: string | null } | null>(null);
  const [error, setError] = useState("");
  const [adoptionReason, setAdoptionReason] = useState("");

  const form = useForm<AdopterData>({
    resolver: zodResolver(adopterSchema),
    defaultValues: { full_name: "", mobile_number: "", id_type: undefined, id_last4: "", address: "", email: "" },
  });

  const allChecked = checks.every(Boolean);
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  async function handleSubmit() {
    const data = form.getValues();
    if (signature.toLowerCase().trim() !== data.full_name.toLowerCase().trim()) {
      setError("Signature must match your full name");
      return;
    }
    setError("");
    setSubmitting(true);

    const res = await submitAdoptionCommitment({
      animalId,
      fullName: data.full_name,
      mobile: data.mobile_number,
      idType: data.id_type,
      idLast4: data.id_last4,
      address: data.address,
      email: data.email || "",
      signatureName: signature,
      userAgent: navigator.userAgent,
      adoptionReason: adoptionReason.trim(),
    });

    if (res.success) {
      setResult({ referenceId: res.referenceId!, animalName: res.animalName!, chatLink: res.chatLink ?? null });
    } else {
      setError(res.error || "Submission failed. Please try again.");
    }
    setSubmitting(false);
  }

  // ---- Success screen ----
  if (result) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">Commitment Signed!</h1>
          <p className="text-gray-600 mb-4">Thank you for committing to adopt <strong>{result.animalName}</strong>.</p>
          <div className="bg-brand-orange/10 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 font-semibold uppercase">Reference Number</p>
            <p className="text-2xl font-mono font-bold text-brand-orange">{result.referenceId}</p>
          </div>
          <p className="text-sm text-gray-500 mb-4">Our team will contact you within 24 hours.</p>
          <p className="text-xs text-gray-400 bg-green-50 border border-green-200 rounded-lg p-3 mb-4">✅ Your adoption request has been sent to the foster. They will review it and reach out to you.</p>
          {result.chatLink && (
            <a href={result.chatLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3 rounded-lg text-center hover:brightness-110 transition mb-3">
              💬 Message us on WhatsApp
            </a>
          )}
          <Link href="/adopt" className="inline-block w-full bg-brand-orange text-white font-bold py-3 rounded-lg text-center hover:brightness-110 transition mb-3">
            Browse More Animals
          </Link>
          <Link href="/" className="text-brand-orange font-bold hover:underline text-sm">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <nav className="px-5 py-4 max-w-3xl mx-auto">
        <Link href="/" className="font-heading font-bold text-xl">🐾 PawsitiveSpace</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pb-12">
        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-8">
          {["Commitment", "Confirm", "Details", "Sign"].map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-2 rounded-full transition-colors ${i <= step ? "bg-brand-orange" : "bg-gray-200"}`} />
              <p className={`text-[10px] font-bold mt-1 text-center ${i <= step ? "text-brand-orange" : "text-gray-400"}`}>{label}</p>
            </div>
          ))}
        </div>

        {/* ---- Step 0: Commitment overview ---- */}
        {step === 0 && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-2">Adoption Commitment</h1>
            <p className="text-gray-500 mb-6">Before adopting, please review the responsibilities involved in caring for a rescue animal.</p>

            <div className="space-y-3 mb-6">
              {COMMITMENTS.map((c) => (
                <div key={c.title} className="bg-white rounded-xl p-4 flex gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm">{c.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning box */}
            <div className="bg-[#FCEAEA] border-2 border-[#F09595] rounded-xl p-4 mb-6">
              <p className="font-bold text-red-700 text-sm mb-1">⚠️ Consequences of Abandonment or Ill-Treatment</p>
              <p className="text-xs text-red-600">
                Abandoning or mistreating an adopted animal is a <strong>punishable offense</strong> under the Prevention of Cruelty to Animals Act 1960 
                and IPC sections 428/429. Your profile will be permanently flagged, and legal action may be taken. 
                PawsitiveSpace reserves the right to reclaim the animal at any time if neglect or cruelty is reported and verified.
              </p>
            </div>

            <button onClick={() => setStep(1)} className="w-full bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition">
              I Understand — Next →
            </button>
          </div>
        )}

        {/* ---- Step 1: Checkboxes ---- */}
        {step === 1 && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-2">Confirm Your Commitment</h1>
            <p className="text-gray-500 mb-6">Please check each box to confirm you understand and agree.</p>

            <div className="space-y-3 mb-6">
              {CHECKBOXES.map((text, i) => (
                <label key={i} className="flex gap-3 bg-white rounded-xl p-4 cursor-pointer hover:bg-orange-50/50 transition">
                  <input
                    type="checkbox"
                    checked={checks[i]}
                    onChange={() => {
                      const next = [...checks];
                      next[i] = !next[i];
                      setChecks(next);
                    }}
                    className="mt-0.5 w-5 h-5 rounded accent-[#FF8C42] shrink-0"
                  />
                  <span className="text-sm text-gray-700">{text}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 border rounded-lg py-3 font-semibold text-gray-600">← Back</button>
              <button onClick={() => setStep(2)} disabled={!allChecked}
                className="flex-1 bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
            {!allChecked && <p className="text-xs text-gray-400 text-center mt-2">Check all 8 boxes to continue</p>}
          </div>
        )}

        {/* ---- Step 2: Adopter details ---- */}
        {step === 2 && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-2">Your Details</h1>
            <p className="text-gray-500 mb-6">We need a few details to complete your adoption application.</p>

            <div className="bg-white rounded-2xl p-6 space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                <input {...form.register("full_name")} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="As on your ID" />
                {form.formState.errors.full_name && <p className="text-xs text-red-500 mt-1">{form.formState.errors.full_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 rounded-l-lg text-sm text-gray-500">+91</span>
                  <input {...form.register("mobile_number")} className="flex-1 border rounded-r-lg px-3 py-2.5 text-sm" placeholder="9876543210" maxLength={10} />
                </div>
                {form.formState.errors.mobile_number && <p className="text-xs text-red-500 mt-1">{form.formState.errors.mobile_number.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ID Type *</label>
                  <select {...form.register("id_type")} className="w-full border rounded-lg px-3 py-2.5 text-sm">
                    <option value="">Select…</option>
                    <option>Aadhaar</option>
                    <option>PAN</option>
                    <option>Voter ID</option>
                    <option>Passport</option>
                    <option>Driving Licence</option>
                  </select>
                  {form.formState.errors.id_type && <p className="text-xs text-red-500 mt-1">{form.formState.errors.id_type.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Last 4 Digits *</label>
                  <input {...form.register("id_last4")} className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="1234" maxLength={4} />
                  {form.formState.errors.id_last4 && <p className="text-xs text-red-500 mt-1">{form.formState.errors.id_last4.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Address *</label>
                <textarea {...form.register("address")} className="w-full border rounded-lg px-3 py-2.5 text-sm" rows={2} placeholder="House/flat no, street, area, city, pincode" />
                {form.formState.errors.address && <p className="text-xs text-red-500 mt-1">{form.formState.errors.address.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email (optional)</label>
                <input {...form.register("email")} type="email" className="w-full border rounded-lg px-3 py-2.5 text-sm" placeholder="you@email.com" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border rounded-lg py-3 font-semibold text-gray-600">← Back</button>
              <button onClick={async () => {
                const valid = await form.trigger();
                if (valid) setStep(3);
              }} className="flex-1 bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition">
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ---- Step 3: Declaration + Signature ---- */}
        {step === 3 && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-2">Declaration & Signature</h1>
            <p className="text-gray-500 mb-6">Review your declaration and sign below to complete.</p>

            <div className="bg-white rounded-2xl p-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-700 leading-relaxed">
                <p>
                  I, <strong>{form.getValues("full_name") || "___"}</strong>, holder of{" "}
                  <strong>{form.getValues("id_type") || "___"}</strong> ending in{" "}
                  <strong>{form.getValues("id_last4") || "____"}</strong>, residing at{" "}
                  <strong>{form.getValues("address") || "___"}</strong>, contactable at{" "}
                  <strong>+91 {form.getValues("mobile_number") || "___"}</strong>, hereby declare that:
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-1 text-xs text-gray-600">
                  <li>I have read and understood all adoption commitments listed above.</li>
                  <li>I agree to provide lifelong care, shelter, food, and veterinary attention to the adopted animal.</li>
                  <li>I will not abandon, rehome, or transfer the animal without written consent from PawsitiveSpace.</li>
                  <li>I consent to follow-up home visits at 1 week, 1 month, and 3 months post-adoption.</li>
                  <li>I understand that violations may result in legal action under applicable Indian laws.</li>
                </ul>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Why do you want to adopt? *</label>
                <textarea
                  value={adoptionReason}
                  onChange={(e) => setAdoptionReason(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm mb-1"
                  placeholder="Tell us why you'd like to adopt this animal, your experience with pets, your living situation, etc."
                />
                <p className="text-[10px] text-gray-400">This helps us match the right animal with the right home.</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Digital Signature — Type your full name *</label>
                <input
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 text-lg font-heading italic focus:border-brand-orange focus:outline-none"
                  placeholder={form.getValues("full_name") || "Your full name"}
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                <p className="text-[10px] text-gray-400 mt-1">Must match the name entered in Step 3 (case-insensitive)</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                <input value={today} disabled className="w-full border rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500" />
              </div>

              <label className="flex gap-3 cursor-pointer">
                <input type="checkbox" checked={finalAck} onChange={() => setFinalAck(!finalAck)} className="mt-0.5 w-5 h-5 rounded accent-[#FF8C42] shrink-0" />
                <span className="text-sm text-gray-700">
                  I confirm that all information provided is true and accurate, and I agree to the terms and conditions of this adoption commitment.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border rounded-lg py-3 font-semibold text-gray-600">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !finalAck || !signature.trim() || !adoptionReason.trim()}
                className="flex-1 bg-brand-orange text-white font-bold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Sign & Submit ✍️"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
