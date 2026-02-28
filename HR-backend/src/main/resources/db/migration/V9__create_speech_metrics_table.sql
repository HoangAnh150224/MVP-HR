CREATE TABLE speech_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id),
    turn_index INT NOT NULL,
    wpm DOUBLE PRECISION,
    filler_counts JSONB DEFAULT '{}',
    utterance_seconds DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_speech_metrics_session_id ON speech_metrics(session_id);
