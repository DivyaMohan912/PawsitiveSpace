import Link from "next/link";
import PublicNav from "@/components/PublicNav";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/about" />

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Hero */}
        <section className="text-center py-8">
          <span className="text-5xl">🐾</span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mt-3 mb-2">About PawsitiveSpace</h1>
          <p className="text-gray-500 text-lg">
            One home for Hyderabad&apos;s animal rescue community — so no request slips through the cracks.
          </p>
        </section>

        {/* The Problem */}
        <section className="mb-10">
          <h2 className="font-heading text-2xl font-bold mb-3">Why we built this</h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            Today, rescue and adoption requests are scattered across dozens of WhatsApp, Facebook, and
            Instagram groups. There&apos;s no single place to track a request or check whether it was ever
            completed. Volunteers struggle to find the details they need to act on a rescue, and fosters
            find it hard to keep track of the adoption requests they receive — or to filter out the right
            adopters.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5">
              <p className="text-2xl mb-2">📢</p>
              <h3 className="font-bold text-sm mb-1">Scattered requests</h3>
              <p className="text-xs text-gray-500">Posts spread across many groups with no shared record.</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <p className="text-2xl mb-2">✅</p>
              <h3 className="font-bold text-sm mb-1">No status tracking</h3>
              <p className="text-xs text-gray-500">Once a message scrolls away, no one knows if the animal was helped.</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <p className="text-2xl mb-2">🔎</p>
              <h3 className="font-bold text-sm mb-1">Hard to act</h3>
              <p className="text-xs text-gray-500">Volunteers lack quick access to rescue details; fosters can&apos;t easily vet adopters.</p>
            </div>
          </div>
        </section>

        {/* Our approach */}
        <section className="mb-10">
          <h2 className="font-heading text-2xl font-bold mb-3">Our approach</h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            PawsitiveSpace brings everything into one place. Every rescue and adoption request — no matter
            which group it started in — can be logged, tracked, and followed to completion. Volunteers see
            exactly what&apos;s needed and who&apos;s actively helping. Fosters get a simple dashboard to review
            adoption requests and choose the right home.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5">
              <p className="text-2xl mb-2">🚑</p>
              <h3 className="font-bold text-sm mb-1">Track every rescue</h3>
              <p className="text-xs text-gray-500">One record per request, with status from report to resolved.</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <p className="text-2xl mb-2">🏠</p>
              <h3 className="font-bold text-sm mb-1">Adoption made manageable</h3>
              <p className="text-xs text-gray-500">Fosters review, filter, and approve adopters in one dashboard.</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <p className="text-2xl mb-2">📍</p>
              <h3 className="font-bold text-sm mb-1">Sort by location</h3>
              <p className="text-xs text-gray-500">Requests and volunteers can be sorted by area, so people can help where they&apos;re currently active.</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <p className="text-2xl mb-2">🤝</p>
              <h3 className="font-bold text-sm mb-1">Recognise active volunteers</h3>
              <p className="text-xs text-gray-500">See who&apos;s showing up and helping, and reach them by area.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 sm:col-span-2">
              <p className="text-2xl mb-2">📋</p>
              <h3 className="font-bold text-sm mb-1">Shared visibility</h3>
              <p className="text-xs text-gray-500">Everyone works from the same source of truth, not a lost chat thread.</p>
            </div>
          </div>
        </section>

        {/* The Vision */}
        <section className="mb-10">
          <div className="bg-brand-orange/10 border-2 border-brand-orange/30 rounded-2xl p-6">
            <h2 className="font-heading text-2xl font-bold mb-3">Where we&apos;re headed</h2>
            <p className="text-gray-700 leading-relaxed">
              This is just the start. Our long-term aim is to grow a wider community — bringing together
              vets, lawyers, and law enforcement — to build a stronger support system for animals, and one
              day, a real voice and governance for them.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-gray-500 mb-4">Built with 🐾 in Hyderabad, India.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/report" className="bg-brand-orange text-white font-bold px-6 py-3 rounded-full hover:brightness-110 transition">
              Report an animal
            </Link>
            <Link href="/adopt" className="border-2 border-brand-orange text-brand-orange font-bold px-6 py-3 rounded-full hover:bg-brand-orange/10 transition">
              Adopt
            </Link>
            <Link href="/#volunteer" className="border-2 border-brand-orange/60 text-brand-orange font-bold px-6 py-3 rounded-full hover:bg-brand-orange/10 transition">
              🙋 Volunteer
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
