export const SkillLevel = {
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced',
  Open: 'Open',
} as const;

export type SkillLevel = typeof SkillLevel[keyof typeof SkillLevel];

export type SkillLevelOption = {
  value: SkillLevel;
  label: string;
  description: string;
  rules: string[];
  icon: 'person.fill' | 'person.2.fill' | 'trophy.fill' | 'star.fill';
  color: string;
};
