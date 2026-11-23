CREATE TABLE IF NOT EXISTS endorsement_rule_sources (
  id text PRIMARY KEY,
  rule_id text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  product_id text NOT NULL,
  change_type text NOT NULL CHECK (change_type IN ('BENEFICIARY','ADDRESS','PAYMENT_FREQUENCY','ACCIDENTAL_DEATH_RIDER')),
  effective_from date NOT NULL,
  effective_to date NOT NULL,
  title text NOT NULL,
  encoder_version text NOT NULL,
  CHECK (effective_from <= effective_to)
);
CREATE INDEX IF NOT EXISTS endorsement_rule_filter_idx ON endorsement_rule_sources(product_id,change_type,effective_from,effective_to,rule_id,version DESC);

CREATE TABLE IF NOT EXISTS endorsement_rule_sections (
  source_id text NOT NULL REFERENCES endorsement_rule_sources(id),
  section_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('RULE','GUIDANCE')),
  text text NOT NULL,
  value jsonb NOT NULL,
  embedding vector(8) NOT NULL,
  encoder_version text NOT NULL,
  PRIMARY KEY (source_id,section_id)
);
CREATE INDEX IF NOT EXISTS endorsement_rule_section_source_idx ON endorsement_rule_sections(source_id);
