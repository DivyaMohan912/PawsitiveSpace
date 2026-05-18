import Link from "next/link";
import PublicNav from "@/components/PublicNav";

export default function TNRPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav current="/tnr" />

      <div className="max-w-3xl mx-auto px-4 pb-12">
        <h1 className="font-heading text-3xl font-bold mb-4">TNR — Trap, Neuter, Return</h1>

        {/* Education banner */}
        <div className="bg-brand-orange/10 border-2 border-brand-orange/30 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🐱</span>
            <div>
              <p className="font-bold text-brand-orange text-lg">What is TNR?</p>
              <p className="text-gray-700 mt-1">
                <strong>Trap-Neuter-Return</strong> is a humane approach to managing community cat populations.
                Cats are humanely trapped, sterilized by a vet, ear-tipped (a small notch on the left ear), and returned to their colony.
              </p>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-heading font-bold text-lg mb-2">🔍 Spot an ear-tipped cat?</h3>
            <p className="text-sm text-gray-600">
              The notch on the left ear means this cat is <strong>already sterilized</strong>. 
              Please <strong>do not re-trap</strong> or take them to a vet — they are healthy community cats being managed by our TNR program.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-heading font-bold text-lg mb-2">📍 Colony near you?</h3>
            <p className="text-sm text-gray-600">
              If you notice a cat colony in your area that hasn&apos;t been TNR&apos;d, report it via WhatsApp or our 
              <Link href="/report" className="text-brand-orange font-bold hover:underline"> report form</Link>. 
              We&apos;ll send a volunteer to assess and schedule TNR.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-heading font-bold text-lg mb-2">🤝 Become a Colony Caretaker</h3>
            <p className="text-sm text-gray-600">
              Colony caretakers provide food, water, and monitor the health of community cats.
              It&apos;s the most impactful thing you can do for strays. Message us on WhatsApp to sign up.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-heading font-bold text-lg mb-2">💰 Sponsor a TNR</h3>
            <p className="text-sm text-gray-600">
              Each TNR surgery costs approximately ₹1,500–2,000. Your sponsorship directly prevents
              hundreds of kittens from being born into street life. Contact us to sponsor.
            </p>
          </div>
        </div>

        {/* Ear tip visual */}
        <div className="bg-white rounded-2xl p-6 text-center mb-8">
          <h3 className="font-heading font-bold text-lg mb-4">How to identify an ear-tipped cat</h3>
          <div className="inline-flex items-center gap-8">
            <div>
              <svg viewBox="0 0 100 100" width="80" height="80" fill="none">
                <circle cx="50" cy="55" r="30" fill="#C8C8D8" />
                <polygon points="25,35 15,5 40,28" fill="#C8C8D8" />
                <polygon points="75,35 85,5 60,28" fill="#C8C8D8" />
                <polygon points="27,32 20,12 37,28" fill="#E8B4B8" />
                <polygon points="73,32 80,12 63,28" fill="#E8B4B8" />
                <ellipse cx="40" cy="52" rx="4" ry="5" fill="#7CB87C" />
                <ellipse cx="60" cy="52" rx="4" ry="5" fill="#7CB87C" />
                <polygon points="47,60 53,60 50,64" fill="#E8A0A8" />
              </svg>
              <p className="text-xs text-gray-400 mt-1">Not ear-tipped</p>
            </div>
            <div className="text-3xl text-gray-300">→</div>
            <div>
              <svg viewBox="0 0 100 100" width="80" height="80" fill="none">
                <circle cx="50" cy="55" r="30" fill="#C8C8D8" />
                <polygon points="25,35 15,5 40,28" fill="#C8C8D8" />
                <polygon points="75,35 85,5 60,28" fill="#C8C8D8" />
                <polygon points="27,32 20,12 37,28" fill="#E8B4B8" />
                <polygon points="73,32 80,12 63,28" fill="#E8B4B8" />
                {/* ear tip */}
                <polygon points="85,5 80,12 90,10" fill="#FF8C42" />
                <ellipse cx="40" cy="52" rx="4" ry="5" fill="#7CB87C" />
                <ellipse cx="60" cy="52" rx="4" ry="5" fill="#7CB87C" />
                <polygon points="47,60 53,60 50,64" fill="#E8A0A8" />
              </svg>
              <p className="text-xs text-brand-orange font-bold mt-1">Ear-tipped ✓</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/report" className="inline-flex items-center gap-2 bg-brand-orange text-white font-bold px-6 py-3 rounded-full hover:brightness-110 transition">
            Report a cat colony for TNR
          </Link>
        </div>
      </div>
    </div>
  );
}
