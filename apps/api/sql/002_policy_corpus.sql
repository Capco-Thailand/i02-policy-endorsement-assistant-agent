CREATE TABLE IF NOT EXISTS policy_documents (
 document_id text NOT NULL,
 version text NOT NULL,
 policy_id text NOT NULL REFERENCES policies(id),
 product_id text NOT NULL,
 title text NOT NULL,
 is_current boolean NOT NULL DEFAULT false,
 PRIMARY KEY (document_id, version),
 UNIQUE (policy_id, version)
);
CREATE UNIQUE INDEX IF NOT EXISTS policy_documents_one_current_per_policy
 ON policy_documents(policy_id) WHERE is_current;
CREATE TABLE IF NOT EXISTS policy_sections (
 document_id text NOT NULL,
 version text NOT NULL,
 section_id text NOT NULL,
 topic text NOT NULL CHECK (topic IN ('status','dates','payment','beneficiaries')),
 excerpt text NOT NULL,
 fields jsonb NOT NULL,
 PRIMARY KEY (document_id, version, section_id),
 FOREIGN KEY (document_id, version) REFERENCES policy_documents(document_id, version)
);
