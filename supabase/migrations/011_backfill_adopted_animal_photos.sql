-- One-time backfill: copy the original pet name, breed, and photos from the
-- source adoption_listings onto the animals records that were created when a
-- public listing was adopted (before those fields were copied automatically).
--
-- Chain: adoptions -> adoption_commitments (adoption_id)
--                  -> adoption_requests   (commitment_id)
--                  -> adoption_listings   (listing_id)
--
-- Run in the Supabase SQL Editor.

-- 1. DIAGNOSTIC — see what each adopter selected (run this first to review).
--    Filter to a single person by uncommenting the WHERE clause.
SELECT
  ad.id                AS adoption_id,
  ad.adopter_name,
  ad.adopter_whatsapp,
  a.id                 AS animal_id,
  a.name               AS current_animal_name,
  a.photos             AS current_animal_photos,
  al.id                AS listing_id,
  al.name              AS listing_pet_name,
  al.species,
  al.breed             AS listing_breed,
  al.photos            AS listing_photos
FROM adoptions ad
JOIN animals a               ON a.id = ad.animal_id
JOIN adoption_commitments ac ON ac.adoption_id = ad.id
JOIN adoption_requests ar    ON ar.commitment_id = ac.id
JOIN adoption_listings al    ON al.id = ar.listing_id
-- WHERE ad.adopter_name ILIKE '%vikram%'
ORDER BY ad.created_at DESC;

-- 2. BACKFILL — copy name / breed / photos onto animals that are missing photos.
--    Only touches animals with no photos yet, so it's safe to re-run.
UPDATE animals a
SET
  photos = al.photos,
  name   = COALESCE(NULLIF(TRIM(al.name), ''), a.name),
  breed  = COALESCE(al.breed, a.breed)
FROM adoptions ad
JOIN adoption_commitments ac ON ac.adoption_id = ad.id
JOIN adoption_requests ar    ON ar.commitment_id = ac.id
JOIN adoption_listings al    ON al.id = ar.listing_id
WHERE ad.animal_id = a.id
  AND array_length(a.photos, 1) IS NULL
  AND al.photos IS NOT NULL
  AND array_length(al.photos, 1) IS NOT NULL;
