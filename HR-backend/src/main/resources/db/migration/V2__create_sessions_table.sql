CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    state VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    target_role VARCHAR(255),
    difficulty VARCHAR(20) DEFAULT 'mid',
    mode VARCHAR(20) DEFAULT 'scored',
    livekit_room_name VARCHAR(255),
    cv_profile_id UUID,
    question_plan JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_state ON sessions(state);
