ALTER TABLE endorsement_proposals DROP CONSTRAINT IF EXISTS endorsement_proposals_status_check;
ALTER TABLE endorsement_proposals ADD CONSTRAINT endorsement_proposals_status_check CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'));
ALTER TABLE endorsement_proposals ADD COLUMN IF NOT EXISTS decided_at timestamptz;
