-- ============================================================
-- V14: Knowledge Base tables for AI interview reference data
-- ============================================================

-- 1. Industries (ngành nghề)
CREATE TABLE kb_industries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Role Templates (vị trí công việc)
CREATE TABLE kb_role_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id     UUID REFERENCES kb_industries(id) ON DELETE SET NULL,
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(200) NOT NULL UNIQUE,
    description     TEXT,
    typical_skills  JSONB DEFAULT '[]',
    typical_jd      TEXT,
    difficulty      VARCHAR(20) NOT NULL DEFAULT 'mid',
    locale          VARCHAR(10) NOT NULL DEFAULT 'vi',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kb_role_templates_industry ON kb_role_templates(industry_id);
CREATE INDEX idx_kb_role_templates_slug ON kb_role_templates(slug);
CREATE INDEX idx_kb_role_templates_difficulty ON kb_role_templates(difficulty);

-- 3. Questions (câu hỏi + sample answers + rubric)
CREATE TABLE kb_questions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_template_id  UUID REFERENCES kb_role_templates(id) ON DELETE SET NULL,
    category          VARCHAR(50) NOT NULL,
    topic             VARCHAR(200),
    difficulty        VARCHAR(20) NOT NULL DEFAULT 'mid',
    question_text     TEXT NOT NULL,
    follow_ups        JSONB DEFAULT '[]',
    sample_answers    JSONB DEFAULT '{}',
    scoring_rubric    JSONB DEFAULT '{}',
    tags              JSONB DEFAULT '[]',
    locale            VARCHAR(10) NOT NULL DEFAULT 'vi',
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kb_questions_role ON kb_questions(role_template_id);
CREATE INDEX idx_kb_questions_category ON kb_questions(category);
CREATE INDEX idx_kb_questions_difficulty ON kb_questions(difficulty);
CREATE INDEX idx_kb_questions_tags ON kb_questions USING GIN (tags);
CREATE INDEX idx_kb_questions_text ON kb_questions USING GIN (to_tsvector('simple', question_text));

-- 4. Scoring Rubrics (tiêu chí chấm điểm mặc định)
CREATE TABLE kb_scoring_rubrics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    weight_percent  INT NOT NULL DEFAULT 20,
    score_levels    JSONB DEFAULT '{}',
    locale          VARCHAR(10) NOT NULL DEFAULT 'vi',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Conversation Templates (mẫu trò chuyện)
CREATE TABLE kb_conversation_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(50) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    template_text   TEXT NOT NULL,
    locale          VARCHAR(10) NOT NULL DEFAULT 'vi',
    sort_order      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kb_conv_templates_type ON kb_conversation_templates(type);
CREATE INDEX idx_kb_conv_templates_locale ON kb_conversation_templates(locale);

-- 6. Import Jobs (tracking bulk import)
CREATE TABLE kb_import_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name       VARCHAR(500),
    import_type     VARCHAR(50) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_rows      INT DEFAULT 0,
    success_count   INT DEFAULT 0,
    error_count     INT DEFAULT 0,
    errors          JSONB DEFAULT '[]',
    imported_by     UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
