/**
 * Guidelines for Cursor AI when using the autonomous data manager
 */
export const CURSOR_AI_GUIDELINES = {
  WHEN_TO_USE: [
    "When information needs to persist across multiple user sessions",
    "For data that requires structured schema validation",
    "When managing collections of related information",
  ],

  WHEN_NOT_TO_USE: [
    "For one-time data lookups or transformations",
    "When simpler in-memory processing would suffice",
    "For extremely large datasets that would consume many tokens",
    "When user hasn't explicitly requested data persistence",
  ],

  BEST_PRACTICES: [
    "Always validate data against the collection schema before storing",
    "Use descriptive collection and field names",
    "Keep collection schemas minimal but complete",
  ],
};
