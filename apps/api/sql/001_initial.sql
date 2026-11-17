CREATE TABLE IF NOT EXISTS customers (
 id text PRIMARY KEY, account_id text NOT NULL UNIQUE, name text NOT NULL,
 password_hash bytea NOT NULL, salt bytea NOT NULL
);
CREATE TABLE IF NOT EXISTS policies (
 id text PRIMARY KEY, customer_id text NOT NULL REFERENCES customers(id),
 label text NOT NULL, status text NOT NULL CHECK (status IN ('ACTIVE','EXPIRED')),
 effective_date date NOT NULL, expiry_date date NOT NULL,
 payment_frequency text NOT NULL CHECK (payment_frequency IN ('MONTHLY','ANNUAL')),
 CHECK (expiry_date > effective_date), UNIQUE(id, customer_id)
);
CREATE TABLE IF NOT EXISTS beneficiaries (
 policy_id text NOT NULL REFERENCES policies(id), position integer NOT NULL CHECK (position >= 0),
 name text NOT NULL, allocation_percent numeric(5,2) NOT NULL CHECK (allocation_percent > 0 AND allocation_percent <= 100),
 PRIMARY KEY(policy_id, position)
);
CREATE TABLE IF NOT EXISTS sessions (
 token_digest text PRIMARY KEY, customer_id text NOT NULL REFERENCES customers(id),
 expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS endorsement_requests (
 id uuid PRIMARY KEY, requester_id text NOT NULL, policy_id text NOT NULL,
 created_at timestamptz NOT NULL, change_type text NOT NULL CHECK (change_type IN ('BENEFICIARY','ADDRESS','PAYMENT_FREQUENCY','ACCIDENTAL_DEATH_RIDER')),
 payload jsonb NOT NULL, FOREIGN KEY (policy_id, requester_id) REFERENCES policies(id, customer_id)
);
CREATE TABLE IF NOT EXISTS audit_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_id text NOT NULL REFERENCES customers(id),
 action text NOT NULL, at timestamptz NOT NULL
);
ALTER TABLE audit_events ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
