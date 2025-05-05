import { SkillLevel, SkillLevelOption } from './skillLevel.types';

export const SKILL_LEVELS: SkillLevelOption[] = [
  {
    value: SkillLevel.Beginner,
    label: "Beginner",
    description:
      "New to pickleball or played a few times. Learning basic rules and shots.",
    rules: [
      "Access to beginner-friendly games",
      "Matched with other beginners",
      "Instructional games available",
    ],
    icon: "person.fill",
    color: "#4CAF50",
  },
  {
    value: SkillLevel.Intermediate,
    label: "Intermediate",
    description:
      "Comfortable with basic shots and rules. Starting to develop strategy.",
    rules: [
      "Access to intermediate games",
      "Can join some advanced games",
      "Mixed skill level games available",
    ],
    icon: "person.2.fill",
    color: "#2196F3",
  },
  {
    value: SkillLevel.Advanced,
    label: "Advanced",
    description:
      "Experienced player with strong shots and strategy. Competitive play.",
    rules: [
      "Access to advanced games",
      "Competitive matches",
      "Tournament eligibility",
    ],
    icon: "trophy.fill",
    color: "#F44336",
  },
  {
    value: SkillLevel.Open,
    label: "Open",
    description:
      "Highly skilled player. Tournament experience. All shots and strategies mastered.",
    rules: [
      "Access to all game levels",
      "Priority for tournaments",
      "Can host competitive games",
    ],
    icon: "star.fill",
    color: "#9C27B0",
  },
];
