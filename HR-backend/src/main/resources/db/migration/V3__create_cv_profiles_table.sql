CREATE TABLE cv_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_id UUID REFERENCES sessions(id),
    parse_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    profile_data JSONB,
    original_filename VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cv_profiles_user_id ON cv_profiles(user_id);
CREATE INDEX idx_cv_profiles_session_id ON cv_profiles(session_id);
