// DB レコードの型定義（supabase/schema.sql に対応）

export const RELATION_TYPES = ['契約園', '連携園', 'その他'] as const;
export type RelationType = (typeof RELATION_TYPES)[number];

export const CANDIDATE_STATUSES = [
  '面談前',
  '選考中',
  '内定',
  '保留',
  '見送り',
] as const;
export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

export const PLACEMENT_STAGES = [
  '書類',
  '一次面接',
  '二次面接',
  '内定',
  '見送り',
] as const;
export type PlacementStage = (typeof PLACEMENT_STAGES)[number];

export const PLACEMENT_STATUSES = ['調整中', '確定', '完了'] as const;
export type PlacementStageStatus = (typeof PLACEMENT_STATUSES)[number];

export type Organization = {
  id: string;
  name: string;
  relation_type: RelationType;
  country: string | null;
  city: string | null;
  contact_person: string | null;
  contact_email: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  hiring_cycle: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Candidate = {
  id: string;
  name: string;
  status: CandidateStatus;
  hoikushi_exam_status: string | null;
  desired_region: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Placement = {
  id: string;
  candidate_id: string;
  organization_id: string;
  stage: PlacementStage;
  stage_status: PlacementStageStatus;
  next_action: string | null;
  next_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
