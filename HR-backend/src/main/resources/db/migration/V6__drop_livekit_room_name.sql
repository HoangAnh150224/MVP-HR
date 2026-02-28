-- Remove legacy LiveKit room name column (replaced by voice_agent_session_id in V5)
ALTER TABLE sessions DROP COLUMN IF EXISTS livekit_room_name;
