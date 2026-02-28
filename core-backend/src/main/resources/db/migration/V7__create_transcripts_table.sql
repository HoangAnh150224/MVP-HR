CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id),
    turn_index INTEGER NOT NULL,
    speaker VARCHAR(10) NOT NULL CHECK (speaker IN ('ai','user')),
    text TEXT NOT NULL,
    timestamp_ms BIGINT,
    is_final BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transcripts_session ON transcripts(session_id, turn_index);
