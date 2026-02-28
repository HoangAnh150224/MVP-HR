export interface CVProfile {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  yearsExperience: number;
  skills: string[];
  softSkills: string[];
  experiences: CVExperience[];
  education: CVEducation[];
  strengths: string[];
  gaps: string[];
}

export interface CVExperience {
  company: string;
  role: string;
  duration: string;
  highlights: string[];
}

export interface CVEducation {
  institution: string;
  degree: string;
  year: string;
}
