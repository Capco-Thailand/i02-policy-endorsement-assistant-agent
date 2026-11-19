CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS policy_documents (
  id text PRIMARY KEY,
  policy_id text NOT NULL REFERENCES policies(id),
  product_id text NOT NULL,
  version text NOT NULL,
  title text NOT NULL,
  encoder_version text NOT NULL,
  facts_snapshot jsonb,
  UNIQUE (policy_id, version),
  UNIQUE (policy_id, id)
);
ALTER TABLE policy_documents ADD COLUMN IF NOT EXISTS facts_snapshot jsonb;

CREATE TABLE IF NOT EXISTS policy_document_selection (
  policy_id text PRIMARY KEY REFERENCES policies(id),
  document_id text NOT NULL,
  FOREIGN KEY (policy_id, document_id) REFERENCES policy_documents(policy_id, id)
);

CREATE TABLE IF NOT EXISTS policy_sections (
  document_id text NOT NULL REFERENCES policy_documents(id),
  section_id text NOT NULL,
  concept text NOT NULL CHECK (concept IN ('status', 'dates', 'payment', 'beneficiaries')),
  excerpt text NOT NULL,
  fact_value jsonb NOT NULL,
  embedding vector(8) NOT NULL,
  encoder_version text NOT NULL DEFAULT 'policy-concepts-v1',
  PRIMARY KEY (document_id, section_id)
);
ALTER TABLE policy_sections ADD COLUMN IF NOT EXISTS encoder_version text NOT NULL DEFAULT 'policy-concepts-v1';

CREATE INDEX IF NOT EXISTS policy_sections_document_id_idx ON policy_sections(document_id);
