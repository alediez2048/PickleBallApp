export const SKILL_LEVELS = [
  {
    value: "Beginner",
    label: "Beginner",
    description: "New to pickleball or playing for less than 6 months",
    color: "beginner"
  },
  {
    value: "Intermediate",
    label: "Intermediate",
    description:
      "Comfortable with basic shots and rules, playing for 6 months to 2 years",
      color: "intermediate"
  },
  {
    value: "Advanced",
    label: "Advanced",
    description: "Experienced player with strong shot control and strategy",
    color: "advanced"
  },
  {
    value: "Open",
    label: "Open",
    description: "Competitive player with tournament experience",
    color: "open"
  },
];

export const SKILL_LEVELS_ALL = [
  {
    value: "all",
    label: "All Levels",
    description: "No skill level filter applied",
    color: "all"
  },
  ...SKILL_LEVELS,
];
