"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import AnimalAvatar from "@/components/admin/AnimalAvatar";
import PublicNav from "@/components/PublicNav";
import ShareToInstagram from "@/components/ShareToInstagram";
import { buildAdoptionCaption } from "@/lib/instagram";

interface Listing {
  id: string;
  name: string | null;
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
  foster_mobile: string;
  status: string;
  created_at: string;
}

interface UserRole {
  role: "admin" | "foster" | null;
  email: string | null;
  volunteerMobile: string | null;
}

export default function AdoptPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream flex items-center justify-center"><p className="text-brand-orange animate-pulse">Loading…</p></div>}>
      <AdoptPage />
    </Suspense>
  );
}

function AdoptPage() {
  const supabase = createBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [species, setSpecies] = useState("all");
  const [user, setUser] = useState<UserRole>({ role: null, email: null, volunteerMobile: null });
  const justListed = searchParams.get("listed") === "true";

  useEffect(() => {
    checkUser();
    loadListings();
  }, [species]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setUser({ role: null, email: null, volunteerMobile: null });
      return;
    }

    const email = session.user.email ?? null;

    // Check if admin
    const { data: vol } = await supabase
      .from("volunteers")
      .select("role, whatsapp_number")
      .eq("email", email)
      .single();

    if (vol) {
      setUser({
        role: vol.role === "admin" ? "admin" : "foster",
        email,
        volunteerMobile: vol.whatsapp_number,
      });
    } else {
      setUser({ role: null, email, volunteerMobile: null });
    }
  }

  async function loadListings() {
    let q = supabase.from("adoption_listings").select("*").eq("status", "open").order("created_at", { ascending: false });
    if (species !== "all") q = q.eq("species", species);
    const { data } = await q;
    setListings((data ?? []) as Listing[]);
  }

  function canEdit(listing: Listing): boolean {
    if (user.role === "admin") return true;
    if (user.role === "foster" && user.volunteerMobile && listing.foster_mobile === user.volunteerMobile) return true;
    return false;
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/adopt" />

      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-heading text-3xl font-bold">Adopt a Furry Friend</h1>
          <div className="flex gap-2">
            {user.role && (
              <Link href="/foster/manage" className="border-2 border-brand-orange text-brand-orange font-bold px-4 py-2 rounded-lg text-sm hover:bg-brand-orange/10 transition">
                My Listings
              </Link>
            )}
            <Link href="/adopt/wishlist" className="border-2 border-brand-orange text-brand-orange font-bold px-4 py-2 rounded-lg text-sm hover:bg-brand-orange/10 transition">
              Add to Wishlist
            </Link>
            <Link href="/adopt/list" className="bg-brand-orange text-white font-bold px-4 py-2 rounded-lg text-sm hover:brightness-110 transition">
              + Post Adoption Request
            </Link>
          </div>
        </div>
        <p className="text-gray-500 mb-6">These animals are looking for their forever homes.</p>

        {/* Foster info banner */}
        {user.role && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-center gap-3">
            <span className="text-xl">👋</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-800">You&apos;re signed in as {user.role === "admin" ? "an admin" : "a foster"}</p>
              <p className="text-xs text-blue-600">You can <Link href="/adopt/list" className="underline font-bold">list animals for adoption</Link> and <Link href="/foster/manage" className="underline font-bold">manage your listings & requests</Link>.</p>
            </div>
          </div>
        )}

        {justListed && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">
            ✅ Your listing has been posted! It&apos;s now visible to potential adopters.
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {["all", "dog", "cat", "other"].map((s) => (
            <button key={s} onClick={() => setSpecies(s)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${species === s ? "bg-brand-orange text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              {s === "all" ? "All" : s === "dog" ? "🐕 Dogs" : s === "cat" ? "🐱 Cats" : "🐾 Other"}
            </button>
          ))}
        </div>

        {/* Listings grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl p-6 hover:shadow-lg transition group">
              <div className="flex justify-center py-4">
                {l.photos && l.photos.length > 0 ? (
                  <img src={l.photos[0]} alt="" className="w-40 h-40 rounded-xl object-cover" />
                ) : (
                  <AnimalAvatar species={l.species} size={140} />
                )}
              </div>
              <h3 className="font-heading font-bold text-lg capitalize">
                {l.name?.trim() || (l.species === "other" ? l.species_other ?? "Animal" : l.species)}
              </h3>
              <p className="text-xs text-gray-400 capitalize">
                {l.species === "other" ? l.species_other ?? "Animal" : l.species}
                {l.breed ? ` · ${l.breed}` : ""}
              </p>
              <p className="text-sm text-gray-500">
                {l.age ?? "Age unknown"} · {l.gender ?? "?"} {l.spayed_neutered ? " · ✂️ Spayed/Neutered" : ""}
              </p>
              {l.location && <p className="text-xs text-gray-400 mt-1">📍 {l.location}</p>}
              {l.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{l.description}</p>}
              <p className="text-xs text-gray-400 mt-2">Foster: {l.foster_name}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => router.push(`/adopt/${l.id}`)}
                  className="flex-1 bg-brand-orange text-white font-bold py-2 rounded-lg text-sm hover:brightness-110 transition"
                >
                  View Details →
                </button>
                {canEdit(l) && (
                  <>
                    <ShareToInstagram
                      imageUrl={l.photos && l.photos.length > 0 ? l.photos[0] : null}
                      caption={buildAdoptionCaption(l)}
                      size="sm"
                      role={user.role === "admin" ? "admin" : "foster"}
                      entityId={l.id}
                    />
                    <button
                      onClick={() => router.push(`/adopt/edit/${l.id}`)}
                      className="px-3 py-2 border-2 border-brand-orange text-brand-orange font-bold rounded-lg text-sm hover:bg-brand-orange/10 transition"
                    >
                      ✏️ Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {listings.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 mb-3">No animals listed for adoption right now.</p>
              <Link href="/adopt/list" className="text-brand-orange font-bold hover:underline">Be the first to list one →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
