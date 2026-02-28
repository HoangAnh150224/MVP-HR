-- Add voice_agent_session_id column for new Gemini-based voice agent
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS voice_agent_session_id VARCHAR(255);
