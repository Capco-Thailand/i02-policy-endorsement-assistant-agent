ALTER TABLE policies ADD COLUMN IF NOT EXISTS product_terms jsonb;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS coverage_terms jsonb;
ALTER TABLE policies ADD COLUMN IF NOT EXISTS exclusion_terms jsonb;
ALTER TABLE policy_sections DROP CONSTRAINT IF EXISTS policy_sections_concept_check;
ALTER TABLE policy_sections ADD CONSTRAINT policy_sections_concept_check CHECK (concept IN ('status','dates','payment','beneficiaries','product','coverage','exclusions'));
