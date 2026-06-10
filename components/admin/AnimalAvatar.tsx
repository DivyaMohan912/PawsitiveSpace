"use client";

export default function AnimalAvatar({
  species,
  earTipped = false,
  size = 64,
}: {
  species: string;
  earTipped?: boolean;
  size?: number;
}) {
  if (species === "cat") return <CatAvatar size={size} earTipped={earTipped} />;
  if (species === "dog") return <DogAvatar size={size} />;
  return <OtherAvatar size={size} />;
}

function DogAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* head */}
      <circle cx="40" cy="44" r="26" fill="#D4A574" />
      {/* ears */}
      <ellipse cx="18" cy="32" rx="10" ry="16" fill="#C08850" transform="rotate(-15 18 32)" />
      <ellipse cx="62" cy="32" rx="10" ry="16" fill="#C08850" transform="rotate(15 62 32)" />
      {/* inner ears */}
      <ellipse cx="19" cy="33" rx="6" ry="10" fill="#E8B4B8" transform="rotate(-15 19 33)" />
      <ellipse cx="61" cy="33" rx="6" ry="10" fill="#E8B4B8" transform="rotate(15 61 33)" />
      {/* eyes */}
      <circle cx="32" cy="40" r="4" fill="#3D2B1F" />
      <circle cx="48" cy="40" r="4" fill="#3D2B1F" />
      <circle cx="33.5" cy="38.5" r="1.5" fill="white" />
      <circle cx="49.5" cy="38.5" r="1.5" fill="white" />
      {/* snout */}
      <ellipse cx="40" cy="50" rx="10" ry="7" fill="#E8D0B0" />
      {/* nose */}
      <ellipse cx="40" cy="48" rx="4" ry="3" fill="#3D2B1F" />
      {/* mouth */}
      <path d="M36 52 Q40 56 44 52" stroke="#3D2B1F" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* tongue */}
      <ellipse cx="40" cy="55" rx="3" ry="2" fill="#E8A0A8" />
    </svg>
  );
}

function CatAvatar({ size, earTipped }: { size: number; earTipped: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="44" r="26" fill="#C8C8D8" />
      <polygon points="22,28 16,6 32,22" fill="#C8C8D8" />
      <polygon points="58,28 64,6 48,22" fill="#C8C8D8" />
      <polygon points="23,26 19,12 30,22" fill="#E8B4B8" />
      <polygon points="57,26 61,12 50,22" fill="#E8B4B8" />
      {earTipped && <polygon points="64,6 61,12 67,10" fill="#FF8C42" />}
      <ellipse cx="33" cy="42" rx="3" ry="3.5" fill="#7CB87C" />
      <ellipse cx="47" cy="42" rx="3" ry="3.5" fill="#7CB87C" />
      <ellipse cx="33" cy="42" rx="1.2" ry="3.2" fill="#1A1A2E" />
      <ellipse cx="47" cy="42" rx="1.2" ry="3.2" fill="#1A1A2E" />
      <polygon points="38,49 42,49 40,52" fill="#E8A0A8" />
    </svg>
  );
}

function OtherAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="42" r="26" fill="#A8D8A8" />
      <circle cx="33" cy="38" r="3" fill="#3D2B1F" />
      <circle cx="47" cy="38" r="3" fill="#3D2B1F" />
      <path d="M35 48 Q40 53 45 48" stroke="#3D2B1F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <text x="40" y="22" textAnchor="middle" fontSize="14">🐾</text>
    </svg>
  );
}
