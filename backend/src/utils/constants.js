const LEAD_SOURCES = ["website", "referral", "social_media", "email", "phone"];
const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"];
const LEAD_PRIORITIES = ["low", "medium", "high"];

const DEAL_STAGES = [
  "qualification",
  "discovery",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

const DEAL_TRANSITIONS = {
  qualification: ["discovery", "lost"],
  discovery: ["proposal", "lost"],
  proposal: ["negotiation", "lost"],
  negotiation: ["won", "lost"],
  won: [],
  lost: [],
};

const ACTIVITY_TYPES = ["call", "email", "meeting", "demo", "reminder"];
const ACTIVITY_STATUSES = ["pending", "completed", "overdue"];

const ENTITY_TYPES = ["lead", "customer", "deal"];

export {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  DEAL_STAGES,
  DEAL_TRANSITIONS,
  ACTIVITY_TYPES,
  ACTIVITY_STATUSES,
  ENTITY_TYPES,
};
