"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import AnimalAvatar from "@/components/admin/AnimalAvatar";

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
  foster_mobile: string;
  status: string;
  created_at: string;
}

export default function AnimalDetailPage() {
  const params = useParams();
  const id = params.animalId as string;
  const supabase = createBrowserClient();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    supabase
      .from("adoption_listings")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setListing(data as Listing | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <p className="text-brand-orange animate-pulse text-lg">Loading…</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <PublicNav current="/adopt" />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <p className="text-5xl mb-4">🐾</p>
          <h1 className="font-heading text-2xl font-bold mb-2">Listing Not Found</h1>
          <p className="text-gray-500 mb-6">This animal may have already been adopted or the link is invalid.</p>
          <Link href="/adopt" className="text-brand-orange font-bold hover:underline">← Browse all animals</Link>
        </div>
      </div>
    );
  }

  const displayName =
    listing.species === "other"
      ? listing.species_other ?? "Animal"
      : `${listing.breed ? listing.breed + " " : ""}${listing.species}`;

  const hasPhotos = listing.photos && listing.photos.length > 0;

  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/adopt" />

      <div className="max-w-3xl mx-auto px-4 pb-12">
        {/* Back link */}
        <Link href="/adopt" className="inline-flex items-center gap-1 text-sm text-brand-orange font-semibold hover:underline mb-4">
          ← Back to all animals
        </Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Photo gallery */}
          <div className="bg-gray-100">
            {hasPhotos ? (
              <div>
                <div className="flex items-center justify-center bg-gray-50 min-h-[280px] sm:min-h-[360px]">
                  <img
                    src={listing.photos[selectedPhoto]}
                    alt={displayName}
                    className="max-h-[400px] w-full object-contain"
                  />
                </div>
                {listing.photos.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {listing.photos.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedPhoto(i)}
                        className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                          i === selectedPhoto ? "border-brand-orange" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <AnimalAvatar species={listing.species} size={160} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold capitalize">{displayName}</h1>
                {listing.location && (
                  <p className="text-sm text-gray-500 mt-1">📍 {listing.location}</p>
                )}
              </div>
              <span className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
                listing.status === "open"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {listing.status === "open" ? "Available" : listing.status}
              </span>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase">Species</p>
                <p className="font-bold text-sm mt-1 capitalize">
                  {listing.species === "dog" ? "🐕 Dog" : listing.species === "cat" ? "🐱 Cat" : `🐾 ${listing.species_other || "Other"}`}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase">Age</p>
                <p className="font-bold text-sm mt-1">{listing.age || "Unknown"}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase">Gender</p>
                <p className="font-bold text-sm mt-1 capitalize">
                  {listing.gender === "male" ? "♂ Male" : listing.gender === "female" ? "♀ Female" : "Unknown"}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase">Spayed/Neutered</p>
                <p className="font-bold text-sm mt-1">
                  {listing.spayed_neutered ? "✅ Yes" : "❌ No"}
                </p>
              </div>
            </div>

            {/* Breed */}
            {listing.breed && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-1">Breed</h3>
                <p className="text-sm text-gray-600">{listing.breed}</p>
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-700 mb-1">About</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            {/* Foster info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-1">Foster Parent</h3>
              <p className="text-sm text-gray-600">{listing.foster_name}</p>
              <p className="text-xs text-gray-400 mt-1">Contact will be shared after adoption approval</p>
            </div>

            {/* Listed date */}
            <p className="text-xs text-gray-400 mb-6">
              Listed on {new Date(listing.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>

            {/* CTA */}
            {listing.status === "open" ? (
              <Link
                href={`/adopt/${listing.id}/commitment`}
                className="block w-full bg-brand-orange text-white font-bold py-3.5 rounded-xl text-center text-lg hover:brightness-110 transition"
              >
                Adopt This Animal →
              </Link>
            ) : (
              <div className="text-center py-3 bg-gray-100 rounded-xl text-gray-500 font-semibold">
                This animal is no longer available for adoption
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
