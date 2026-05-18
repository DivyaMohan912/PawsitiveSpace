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
    <div
      className="flex items-center justify-center rounded-full bg-amber-50"
      style={{ width: size, height: size, fontSize: size * 0.6 }}
    >
      🐶
    </div>
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
