"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import MaskedPhone from "@/components/admin/MaskedPhone";
import { loadFosterData, completeAdoption as completeAdoptionAction, rejectRequest as rejectRequestAction, closeListing as closeListingAction, reopenListing as reopenListingAction, markWishFulfilled as markWishFulfilledAction, verifyFosterGoogle } from "./actions";
import { createBrowserClient } from "@/lib/supabase";
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
  const supabase = createBrowserClient();
  const [mobile, setMobile] = useState("");
  const [verified, setVerified] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [saving, setSaving] = useState(false);
  // Google sign-in login state
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(false);

  async function handleGoogleLogin() {
    if (mobile.length !== 10) { setAuthError("Enter your 10-digit mobile number first"); return; }
    setAuthError("");
    if (typeof window !== "undefined") localStorage.setItem("foster_login_mobile", mobile);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/foster/manage`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) setAuthError(error.message);
  }

  // After returning from Google, associate the signed-in email with the mobile
  // number the foster entered, then unlock the dashboard.
  useEffect(() => {
    (async () => {
      const savedMobile = typeof window !== "undefined" ? localStorage.getItem("foster_login_mobile") : null;
      if (!savedMobile) return;

      let { data: { session } } = await supabase.auth.getSession();
      if (!session && typeof window !== "undefined" && window.location.hash) {
        const hp = new URLSearchParams(window.location.hash.substring(1));
        const at = hp.get("access_token");
        const rt = hp.get("refresh_token");
        if (at && rt) {
          const { data } = await supabase.auth.setSession({ access_token: at, refresh_token: rt });
          session = data.session;
        }
      }

      const email = session?.user?.email;
      if (!email) return;

      setChecking(true);
      const res = await verifyFosterGoogle(`+91${savedMobile}`, email);
      localStorage.removeItem("foster_login_mobile");
      if (res.success) {
        setMobile(savedMobile);
        setVerified(true);
      } else {
        setAuthError(res.error || "Could not verify your account.");
      }
      setChecking(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

            {checking ? (
              <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Signing you in…</p>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">Enter the mobile number you used when creating your listing, then sign in with Google. Your Google account gets linked to that number so you can log in without WhatsApp next time.</p>
                {authError && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2 mb-3">{authError}</p>}

                <label className="block text-sm font-bold text-gray-700 mb-1">Mobile number *</label>
                <div className="flex items-stretch mb-4">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-gray-50 text-sm text-gray-600 font-medium select-none">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="98765 43210"
                    className="w-full border rounded-r-lg px-3 py-2.5 text-sm tracking-wide"
                  />
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white text-gray-700 font-bold py-2.5 rounded-lg hover:bg-gray-50 transition"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
                  </svg>
                  Continue with Google
                </button>

                <p className="text-xs text-gray-400 mt-3">First time? Your Google email will be linked to this number for future logins.</p>
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
                    {l.photos && l.photos.length > 0 ? (
                      <img
                        src={l.photos[0]}
                        alt={l.species === "other" ? l.species_other || "animal" : l.species}
                        className="rounded-xl object-cover flex-shrink-0"
                        style={{ width: 72, height: 72 }}
                      />
                    ) : (
                      <AnimalAvatar species={l.species} size={72} />
                    )}
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
