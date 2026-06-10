const IG_USER_ID = process.env.INSTAGRAM_USER_ID!;
const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!;
const GRAPH_API = "https://graph.facebook.com/v19.0";

export interface IGPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Publish a single-image post to Instagram via Graph API.
 * `imageUrl` must be a publicly accessible URL.
 */
export async function publishToInstagram(
  imageUrl: string,
  caption: string
): Promise<IGPostResult> {
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
    return { success: false, error: "Instagram credentials not configured" };
  }

  try {
    // Step 1: Create a media container
    const createRes = await fetch(`${GRAPH_API}/${IG_USER_ID}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: IG_ACCESS_TOKEN,
      }),
    });

    const createData = await createRes.json();
    if (!createRes.ok || createData.error) {
      return { success: false, error: createData.error?.message || "Failed to create media container" };
    }

    // Step 2: Publish the container
    const publishRes = await fetch(`${GRAPH_API}/${IG_USER_ID}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: createData.id,
        access_token: IG_ACCESS_TOKEN,
      }),
    });

    const publishData = await publishRes.json();
    if (!publishRes.ok || publishData.error) {
      return { success: false, error: publishData.error?.message || "Failed to publish post" };
    }

    return { success: true, postId: publishData.id };
  } catch (err: any) {
    console.error("[Instagram Publish Error]", err);
    return { success: false, error: err.message };
  }
}

/**
 * Build a formatted Instagram caption for an adoption listing.
 */
export function buildAdoptionCaption(listing: {
  species: string;
  species_other?: string | null;
  breed?: string | null;
  age?: string | null;
  gender?: string | null;
  spayed_neutered?: boolean;
  location?: string | null;
  description?: string | null;
  foster_name?: string;
}): string {
  const animal = listing.species === "other"
    ? listing.species_other || "Animal"
    : listing.species;

  const lines = [
    `🐾 *Adopt Me!* 🐾`,
    ``,
    `Meet this lovely ${animal}${listing.breed ? ` (${listing.breed})` : ""}!`,
    ``,
  ];

  if (listing.age) lines.push(`🎂 Age: ${listing.age}`);
  if (listing.gender) lines.push(`${listing.gender === "male" ? "♂️" : listing.gender === "female" ? "♀️" : "⚥"} Gender: ${listing.gender}`);
  if (listing.spayed_neutered) lines.push(`✂️ Spayed/Neutered`);
  if (listing.location) lines.push(`📍 Location: ${listing.location}`);
  if (listing.description) lines.push(`\n${listing.description}`);

  lines.push(``);
  lines.push(`🏠 Give this ${animal} a forever home!`);
  lines.push(`👉 Apply to adopt at www.pawsitivespace.in/adopt`);
  lines.push(``);
  lines.push(`#PawsitiveSpace #AdoptDontShop #AnimalRescue #Hyderabad #IndiaRescue #StrayAnimal #AdoptionIndia`);

  return lines.join("\n");
}

/**
 * Build a formatted Instagram caption for a rescue case.
 */
export function buildRescueCaption(rescue: {
  animal_name?: string | null;
  species: string;
  breed?: string | null;
  location?: string | null;
  health_notes?: string | null;
  case_notes?: string | null;
}): string {
  const animal = rescue.animal_name || rescue.species;

  const lines = [
    `🚨 *Rescue Alert* 🚨`,
    ``,
    `A ${animal}${rescue.breed ? ` (${rescue.breed})` : ""} needs help!`,
    ``,
  ];

  if (rescue.location) lines.push(`📍 Location: ${rescue.location}`);
  if (rescue.health_notes) lines.push(`🩺 Condition: ${rescue.health_notes}`);

  lines.push(``);
  lines.push(`If you can help, reach out to us!`);
  lines.push(`👉 Report & track rescues at www.pawsitivespace.in/rescues`);
  lines.push(``);
  lines.push(`#PawsitiveSpace #AnimalRescue #StrayAnimal #HelpAnimals #Hyderabad #IndiaRescue`);

  return lines.join("\n");
}
