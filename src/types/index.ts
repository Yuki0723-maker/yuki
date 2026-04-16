export type DocumentType = 'renrakucho' | 'shidokeikaku' | 'hoikuNisshi' | 'kenkoukiroku';

export interface Child {
  id: string;
  name: string;
  kana: string;
  birthDate: string;
  group: string;
  parentName: string;
  parentContact: string;
  notes: string;
}

export interface RenrakuchoEntry {
  id: string;
  childId: string;
  date: string;
  temperature: string;
  appetite: 'good' | 'normal' | 'poor';
  sleep: string;
  condition: string;
  activities: string;
  parentMessage: string;
  teacherMessage: string;
  createdAt: string;
}

export interface ShidoKeikaku {
  id: string;
  type: 'monthly' | 'weekly' | 'daily';
  group: string;
  period: string;
  goals: string;
  activities: string;
  environment: string;
  evaluation: string;
  createdAt: string;
}

export interface HoikuNisshi {
  id: string;
  date: string;
  group: string;
  teacherName: string;
  attendance: number;
  weather: string;
  activities: string;
  childrenCondition: string;
  reflections: string;
  nextPlan: string;
  createdAt: string;
}

export interface KenkouKiroku {
  id: string;
  childId: string;
  date: string;
  height: string;
  weight: string;
  condition: string;
  specialNotes: string;
  createdAt: string;
}

export interface AppData {
  children: Child[];
  renrakucho: RenrakuchoEntry[];
  shidoKeikaku: ShidoKeikaku[];
  hoikuNisshi: HoikuNisshi[];
  kenkouKiroku: KenkouKiroku[];
}
