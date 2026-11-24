CREATE TABLE IF NOT EXISTS endorsement_proposals (
  id text PRIMARY KEY,
  request_id uuid NOT NULL UNIQUE REFERENCES endorsement_requests(id),
  requester_id text NOT NULL REFERENCES customers(id),
  policy_id text NOT NULL REFERENCES policies(id),
  status text NOT NULL CHECK (status IN ('DRAFT', 'PENDING_APPROVAL')),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS endorsement_proposals_owner_idx ON endorsement_proposals(requester_id, policy_id);
