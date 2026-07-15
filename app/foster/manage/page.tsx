"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import MaskedPhone from "@/components/admin/MaskedPhone";
import { loadFosterData, completeAdoption as completeAdoptionAction, rejectRequest as rejectRequestAction, closeListing as closeListingAction, reopenListing as reopenListingAction, markWishFulfilled as markWishFulfilledAction } from "./actions";
import { sendOtp, verifyOtp } from "@/app/shared-actions";
import ShareToInstagram from "@/components/ShareToInstagram";
import { buildAdoptionCaption } from "@/lib/instagram";
import { buildWaLink } from "@/lib/click-to-chat";

interface Listing {
  id: string;
  species: string;
  species_other: string | null;
  breed: string | null;
  age: string | null;
  gender: string | null;
  status: string;
  foster_name: string;
  foster_mobile: string;
  photos: string[] | null;
  created_at: string;
}

interface Request {
  id: string;
  listing_id: string;
  requester_name: string;
  requester_mobile: string;
  status: string;
  created_at: string;
  adoption_reason: string | null;
}

interface Wish {
  id: string;
  species: string;
  species_other: string | null;
  breed: string | null;
  age_preference: string | null;
  location: string | null;
  notes: string | null;
  requester_name: string;
  requester_mobile: string;
  created_at: string;
}

export default function FosterManagePage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [verified, setVerified] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [saving, setSaving] = useState(false);
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [devCode, setDevCode] = useState("");

  const load = useCallback(async () => {
    if (!mobile) return;
    const data = await loadFosterData(mobile);
    setListings(data.listings as Listing[]);
    setRequests(data.requests as Request[]);
    setWishes((data.wishes ?? []) as Wish[]);
  }, [mobile]);

  useEffect(() => { if (verified) load(); }, [verified, load]);

  async function completeAdoption(requestId: string, listingId: string) {
    setSaving(true);
    await completeAdoptionAction(requestId, listingId);
    setSaving(false);
    load();
  }

  async function rejectRequest(requestId: string) {
    setSaving(true);
    await rejectRequestAction(requestId);
    setSaving(false);
    load();
  }

  async function closeListing(listingId: string) {
    setSaving(true);
    await closeListingAction(listingId);
    setSaving(false);
    load();
  }

  async function reopenListing(listingId: string) {
    setSaving(true);
    await reopenListingAction(listingId);
    setSaving(false);
    load();
  }

  async function markWishFulfilled(wishId: string) {
    setSaving(true);
    await markWishFulfilledAction(wishId);
    setSaving(false);
    load();
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <PublicNav current="/foster/manage" />
        <div className="flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
            <h1 className="font-heading text-xl font-bold mb-4">Foster Dashboard</h1>

            {!otpSent ? (
              <>
                <p className="text-sm text-gray-500 mb-4">Enter the mobile number or email you used when creating your listing. We&apos;ll send a one-time code to verify.</p>
                {otpError && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2 mb-3">{otpError}</p>}
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210 or you@email.com"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm mb-3"
                />
                <button
                  onClick={async () => {
                    if (!mobile.trim()) return;
                    setOtpLoading(true);
                    setOtpError("");
                    const res = await sendOtp(mobile.trim());
                    if (res.success) {
                      setOtpSent(true);
                      if ("devCode" in res && res.devCode) setDevCode(res.devCode);
                    } else {
                      setOtpError(("error" in res && res.error) || "Failed to send OTP");
                    }
                    setOtpLoading(false);
                  }}
                  disabled={otpLoading}
                  className="w-full bg-brand-orange text-white font-bold py-2.5 rounded-lg hover:brightness-110 disabled:opacity-50"
                >
                  {otpLoading ? "Sending OTP…" : "Send verification code"}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-1">Code sent to <strong>{mobile}</strong>.</p>
                <p className="text-xs text-gray-400 mb-4">Check your SMS or email inbox.</p>
                {devCode && (
                  <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-2 mb-3">
                    Dev mode (no SMS/email provider configured): your code is <strong className="font-mono">{devCode}</strong>
                  </p>
                )}
                {otpError && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2 mb-3">{otpError}</p>}
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm mb-3 text-center text-2xl tracking-[0.5em] font-mono"
                />
                <button
                  onClick={async () => {
                    if (otp.length !== 6) {
                      setOtpError("Enter the 6-digit OTP");
                      return;
                    }
                    setOtpLoading(true);
                    setOtpError("");
                    const res = await verifyOtp(mobile.trim(), otp);
                    if (res.success) {
                      setVerified(true);
                    } else {
                      setOtpError(res.error || "Verification failed");
                    }
                    setOtpLoading(false);
                  }}
                  disabled={otpLoading}
                  className="w-full bg-brand-orange text-white font-bold py-2.5 rounded-lg hover:brightness-110 disabled:opacity-50 mb-2"
                >
                  {otpLoading ? "Verifying…" : "Verify OTP"}
                </button>
                <button
                  onClick={() => { setOtpSent(false); setOtp(""); setOtpError(""); setDevCode(""); }}
                  className="w-full text-sm text-gray-500 hover:text-brand-orange"
                >
                  ← Change number
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/foster/manage" />

      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl font-bold">My Listings</h1>
          <div className="flex gap-2">
            <Link href="/adopt" className="border-2 border-brand-orange text-brand-orange font-bold px-4 py-2 rounded-lg text-sm hover:bg-brand-orange/10 transition">
              Browse All
            </Link>
            <Link href="/adopt/list" className="bg-brand-orange text-white font-bold px-4 py-2 rounded-lg text-sm hover:brightness-110 transition">
              + New Listing
            </Link>
          </div>
        </div>

        {/* Community wishlist — people looking for animals not yet listed */}
        {wishes.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🙋</span>
              <h2 className="font-heading text-lg font-bold">Community Wishlist</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              People looking for a specific animal that isn&apos;t listed yet. If you have a match, reach out to them directly.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {wishes.map((w) => {
                const label = w.species === "other" ? (w.species_other || "Other") : w.species;
                const wa = buildWaLink(
                  w.requester_mobile,
                  `Hi ${w.requester_name}, this is a PawsitiveSpace foster. I saw your request for a ${w.breed ? w.breed + " " : ""}${label} and may have a match for you.`
                );
                return (
                  <div key={w.id} className="bg-white rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <AnimalAvatar species={w.species === "cat" || w.species === "dog" ? w.species : "other"} size={32} />
                      <p className="font-bold text-sm capitalize">
                        {w.breed ? `${w.breed} ` : ""}{label}
                        {w.age_preference ? <span className="font-normal text-gray-500"> · {w.age_preference}</span> : null}
                      </p>
                    </div>
                    {w.location && <p className="text-xs text-gray-500">📍 {w.location}</p>}
                    {w.notes && <p className="text-sm text-gray-600 mt-1">{w.notes}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-xs text-gray-500">{w.requester_name}</p>
                        <MaskedPhone number={w.requester_mobile} />
                      </div>
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:brightness-110 transition"
                        >
                          Message
                        </a>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-gray-400">{new Date(w.created_at).toLocaleDateString()}</p>
                      <button
                        onClick={() => markWishFulfilled(w.id)}
                        disabled={saving}
                        className="text-xs font-semibold text-gray-400 hover:text-brand-orange disabled:opacity-50"
                      >
                        Mark fulfilled ✓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-400 mb-3">No listings found for this mobile number.</p>
            <Link href="/adopt/list" className="text-brand-orange font-bold hover:underline">Create a listing →</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {listings.map((l) => {
              const listingRequests = requests.filter((r) => r.listing_id === l.id);
              return (
                <div key={l.id} className="bg-white rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <AnimalAvatar species={l.species} size={72} />
                    <div className="flex-1">
                      <h3 className="font-bold capitalize">
                        {l.species === "other" ? l.species_other : l.species}
                        {l.breed && <span className="text-gray-500 font-normal"> · {l.breed}</span>}
                      </h3>
                      <p className="text-xs text-gray-400">{l.age} · {l.gender}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${l.status === "open" ? "bg-green-100 text-green-700" : l.status === "adopted" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                      {l.status}
                    </span>
                    {l.status === "open" && (
                      <>
                        <ShareToInstagram
                          imageUrl={l.photos && l.photos.length > 0 ? l.photos[0] : null}
                          caption={buildAdoptionCaption(l)}
                          role="foster"
                          entityId={l.id}
                        />
                        <button onClick={() => router.push(`/adopt/edit/${l.id}`)} className="text-xs text-brand-orange font-semibold hover:underline">
                          Edit
                        </button>
                        <button onClick={() => closeListing(l.id)} disabled={saving} className="text-xs text-red-500 font-semibold hover:underline">
                          Close
                        </button>
                      </>
                    )}
                    {(l.status === "closed" || l.status === "adopted") && (
                      <button onClick={() => reopenListing(l.id)} disabled={saving} className="text-xs text-green-600 font-semibold hover:underline">
                        🔄 Reopen
                      </button>
                    )}
                  </div>

                  {/* Requests for this listing */}
                  {listingRequests.length > 0 ? (
                    <div className="border-t pt-3 space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase">Adoption Requests ({listingRequests.length})</p>
                      {listingRequests.map((r) => (
                        <div key={r.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{r.requester_name}</p>
                            <p className="text-xs text-gray-500">{r.requester_mobile}</p>
                            <p className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                            {r.adoption_reason && (
                              <div className="mt-2 bg-blue-50 rounded-lg p-2">
                                <p className="text-[10px] font-bold text-blue-600 uppercase">Why they want to adopt</p>
                                <p className="text-xs text-gray-700 mt-0.5">{r.adoption_reason}</p>
                              </div>
                            )}
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === "pending" ? "bg-amber-100 text-amber-700" : r.status === "completed" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {r.status}
                          </span>
                          {r.status === "pending" && l.status === "open" && (
                            <div className="flex gap-1">
                              <button onClick={() => completeAdoption(r.id, l.id)} disabled={saving} className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded hover:bg-green-200">
                                ✓ Complete
                              </button>
                              <button onClick={() => rejectRequest(r.id)} disabled={saving} className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded hover:bg-red-200">
                                ✗ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 border-t pt-3">No adoption requests yet</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
