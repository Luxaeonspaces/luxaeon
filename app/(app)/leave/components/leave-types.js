export const LEAVE_TYPES = {
  EXAM: {
    label: "Exam Leave",
    maxDays: 10,
    requiresDocument: false,
  },

  COMPASSIONATE: {
    label: "Compassionate Leave",
    maxDays: 5,
    requiresDocument: false,
  },

  ANNUAL: {
    label: "Annual Leave",
    maxDays: 20,
    requiresDocument: false,
  },

  CASUAL: {
    label: "Casual Leave",
    maxDays: 5,
    requiresDocument: false,
  },

  SERIOUS_ILLNESS: {
    label: "Serious / Terminal Illness",
    maxDays: 13,
    requiresDocument: true,
  },

  SICK: {
    label: "Sick Leave",
    maxDays: 7,
    requiresDocument: true,
  },
};