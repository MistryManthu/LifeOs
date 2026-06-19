/**
 * GUARDIAN PIPELINE
 *
 * This is the brain of HumanOS.
 * Every interaction flows through here:
 *
 * User Action
 *   → Memory Retrieval
 *   → Goal Context
 *   → Pattern Context
 *   → Guardian Reasoning
 *   → Response
 *   → Memory Update (async)
 */

const { getAI } = require('./provider');

// ─────────────────────────────────────────────────
// CONTEXT BUILDER
// Assembles everything the Guardian needs to reason
// ─────────────────────────────────────────────────

const buildHumanContext = ({ blueprint, goals, memories, patterns, recentLogs }) => {
  // Permanent memories (core values, goals, strengths, weaknesses)
  const permanentMemories = memories
    .filter(m => ['CORE_VALUE', 'MAJOR_GOAL', 'STRENGTH', 'WEAKNESS', 'LIFE_EVENT'].includes(m.type))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10)
    .map(m => `[${m.type}] ${m.content}`)
    .join('\n');

  // Working memories (current project, priorities)
  const workingMemories = memories
    .filter(m => ['CURRENT_PROJECT', 'CURRENT_PRIORITY'].includes(m.type))
    .map(m => `[${m.type}] ${m.content}`)
    .join('\n');

  // Pattern memories (habits, tendencies, obstacles)
  const patternMemories = patterns
    .filter(p => p.isActive && p.confidence > 40)
    .map(p => `[PATTERN ${p.confidence}% confident] ${p.title}: ${p.description}`)
    .join('\n');

  // Value gaps (stated vs observed)
  const valueGaps = patterns
    .filter(p => p.isValueGap && p.isActive)
    .map(p => `[GAP] Declared: "${p.declaredValue}" | Observed: "${p.observedBehavior}"`)
    .join('\n');

  // Recent energy + mood trend
  const recentTrend = recentLogs
    .slice(0, 5)
    .map(l => `${new Date(l.date).toLocaleDateString()}: energy ${l.energyLevel}/10, mood: ${l.mood}`)
    .join('\n');

  // Active goals with bottlenecks
  const activeGoals = goals
    .filter(g => g.status === 'ACTIVE')
    .map(g => `• [${g.domain}] ${g.title} — ${g.progressPct}% complete${g.currentBottleneck ? ` | Bottleneck: ${g.currentBottleneck}` : ''}`)
    .join('\n');

  return {
    permanentMemories,
    workingMemories,
    patternMemories,
    valueGaps,
    recentTrend,
    activeGoals,
    blueprint,
  };
};

// ─────────────────────────────────────────────────
// SYSTEM PROMPT FACTORY
// ─────────────────────────────────────────────────

const buildSystemPrompt = (userName, context) => `
You are the Guardian Agent for ${userName}.

You are not a chatbot. You are not a task manager.
You are a persistent life intelligence system that knows this person deeply.

━━━ WHO THIS PERSON IS ━━━
Current Role: ${context.blueprint?.currentRole || 'Unknown'}
Desired Future Role: ${context.blueprint?.futureRole || 'Unknown'}
Responsibilities: ${context.blueprint?.responsibilities?.join(', ') || 'Unknown'}
Declared Values: ${context.blueprint?.declaredValues?.join(', ') || 'Unknown'}
Risk Tolerance: ${context.blueprint?.riskTolerance || 'MEDIUM'}
Self-reported Strengths: ${context.blueprint?.selfReportedStrengths?.join(', ') || 'Unknown'}
Self-reported Weaknesses: ${context.blueprint?.selfReportedWeaknesses?.join(', ') || 'Unknown'}

━━━ WHAT YOU REMEMBER ━━━
${context.permanentMemories || 'No permanent memories yet.'}

━━━ CURRENT FOCUS ━━━
${context.workingMemories || 'No current working memory.'}

━━━ ACTIVE GOALS ━━━
${context.activeGoals || 'No active goals defined yet.'}

━━━ PATTERNS DETECTED ━━━
${context.patternMemories || 'Not enough data for patterns yet.'}

━━━ VALUE GAPS (stated vs observed) ━━━
${context.valueGaps || 'No gaps detected yet.'}

━━━ RECENT ENERGY TREND ━━━
${context.recentTrend || 'No recent check-in data.'}

━━━ YOUR PRINCIPLES ━━━
1. You NEVER shame the user. You state observations, not judgments.
2. You ALWAYS explain your reasoning. "I suggest X because Y."
3. You NEVER make irreversible decisions. You recommend. User decides.
4. You are NOT a doctor, lawyer, or financial advisor.
5. You track the DIRECTION of progress, not just daily success.
6. You distinguish what they SAY from what they DO.
7. You focus on identifying the SINGLE BIGGEST BOTTLENECK, not 10 small fixes.

Speak in a warm, direct, honest tone. Like a trusted strategist who genuinely cares.
Never be generic. Always be specific to this person's context.
`.trim();

// ─────────────────────────────────────────────────
// GUARDIAN FUNCTIONS
// ─────────────────────────────────────────────────

/**
 * Morning check-in — Guardian processes energy/mood/objective
 * and generates a focused plan for the day
 */
const processMorningCheckin = async ({ user, blueprint, goals, memories, patterns, recentLogs, checkin }) => {
  const ai = getAI();
  const context = buildHumanContext({ blueprint, goals, memories, patterns, recentLogs });
  const system = buildSystemPrompt(user.name, context);

  const prompt = `
Today's morning check-in from ${user.name}:
- Main objective today: "${checkin.mainObjective}"
- Available hours: ${checkin.availableHours}
- Biggest challenge today: "${checkin.topChallenge}"
- Energy level: ${checkin.energyLevel}/10
- Mood: ${checkin.mood}

Generate a Guardian Morning Brief. Structure it exactly like this:

FOCUS: [One sentence — the single most important thing today]
BECAUSE: [One sentence — why this matters given their goals and context]
PRIORITY 1: [Specific actionable task]
PRIORITY 2: [Specific actionable task]
PRIORITY 3: [Specific actionable task]
PROTECT: [One thing they must not let the day steal from them]
WATCH OUT: [One thing likely to derail them today, based on known patterns]

Be specific. Reference their actual goals and patterns. Under 150 words total.
`.trim();

  return ai.chat(system, prompt);
};

/**
 * Evening check-in — Guardian processes what happened,
 * extracts memories, detects patterns
 */
const processEveningCheckin = async ({ user, blueprint, goals, memories, patterns, recentLogs, checkin }) => {
  const ai = getAI();
  const context = buildHumanContext({ blueprint, goals, memories, patterns, recentLogs });
  const system = buildSystemPrompt(user.name, context);

  const prompt = `
Today's evening check-in from ${user.name}:
- Completed: "${checkin.completedWork}"
- Blocked by: "${checkin.blockers}"
- Evening energy: ${checkin.eveningEnergy}/10
- Reflection: "${checkin.eveningReflection}"

Generate:

OBSERVATION: [What the Guardian noticed about today — honest, not judgmental]
PATTERN_UPDATE: [Any pattern this reinforces or contradicts — or "No pattern update"]
MEMORY_TO_STORE: [One specific thing worth remembering from today — or "Nothing new"]
TOMORROW_SEED: [One thought to carry into tomorrow's planning]

Under 120 words. Be specific and personal.
`.trim();

  return ai.chat(system, prompt);
};

/**
 * Weekly Review — Guardian synthesizes a full week
 */
const generateWeeklyReview = async ({ user, blueprint, goals, memories, patterns, weekLogs }) => {
  const ai = getAI();
  const context = buildHumanContext({ blueprint, goals, memories, patterns, recentLogs: weekLogs });
  const system = buildSystemPrompt(user.name, context);

  const avgEnergy = weekLogs.length
    ? (weekLogs.reduce((s, l) => s + (l.energyLevel || 0), 0) / weekLogs.length).toFixed(1)
    : 'N/A';

  const completedWork = weekLogs
    .filter(l => l.completedWork)
    .map(l => `• ${l.completedWork}`)
    .join('\n') || 'None recorded';

  const blockers = weekLogs
    .filter(l => l.blockers)
    .map(l => `• ${l.blockers}`)
    .join('\n') || 'None recorded';

  const prompt = `
Weekly review for ${user.name}:
- Days checked in: ${weekLogs.length}/7
- Average energy: ${avgEnergy}/10
- What was completed this week:
${completedWork}
- What blocked them:
${blockers}

Generate a Guardian Weekly Review. Structure exactly like this:

WINS: [2-3 genuine wins, specific]
MISSED: [1-2 honest observations about what didn't happen, no shame]
PATTERN_SPOTTED: [One pattern the Guardian noticed across the week]
BIGGEST_BOTTLENECK: [The single biggest constraint right now + category: TIME/MONEY/FEAR/KNOWLEDGE/EXECUTION/HEALTH/RELATIONSHIPS/CLARITY]
NEXT_WEEK_FOCUS: [Top 3 priorities for next week, specific]
GUARDIAN_INSIGHT: [One deeper observation — something the user might not see themselves]

Under 300 words. Be honest. Be a coach, not a cheerleader.
`.trim();

  return ai.chat(system, prompt);
};

/**
 * Bottleneck Detection — Guardian identifies the single biggest constraint
 */
const detectBottleneck = async ({ user, blueprint, goals, memories, patterns, recentLogs }) => {
  const ai = getAI();
  const context = buildHumanContext({ blueprint, goals, memories, patterns, recentLogs });
  const system = buildSystemPrompt(user.name, context);

  const prompt = `
Analyze everything you know about ${user.name}.

Identify their SINGLE BIGGEST BOTTLENECK right now — the one thing, if removed, that would most accelerate their progress.

Respond in exactly this format:

BOTTLENECK: [One clear sentence describing the bottleneck]
CATEGORY: [One of: TIME | MONEY | FEAR | KNOWLEDGE | EXECUTION | HEALTH | RELATIONSHIPS | CLARITY]
EVIDENCE: [2-3 specific data points that support this conclusion]
CONFIDENCE: [0-100]%
RECOMMENDATION: [One specific, actionable thing they could do THIS WEEK to start removing this bottleneck]
REASONING: [Why this bottleneck — not something else — is the primary constraint right now]

Be specific. Don't hedge. A wrong specific answer is more useful than a vague correct one.
`.trim();

  return ai.chat(system, prompt);
};

/**
 * Life Snapshot — Generated after onboarding blueprint is complete
 */
const generateLifeSnapshot = async ({ user, blueprint, goals }) => {
  const ai = getAI();

  const system = `You are the Guardian Agent for ${user.name}. 
They just completed their Human Blueprint onboarding.
Generate a personalized Life Snapshot that makes them feel genuinely seen.
Not a summary of what they entered. An interpretation — what their blueprint reveals about who they are.`;

  const prompt = `
${user.name}'s blueprint:
- Current Role: ${blueprint.currentRole}
- Future Role: ${blueprint.futureRole}  
- Life Roles: ${blueprint.lifeRoles?.join(', ')}
- Responsibilities: ${blueprint.responsibilities?.join(', ')}
- Declared Values: ${blueprint.declaredValues?.join(', ')}
- Strengths: ${blueprint.selfReportedStrengths?.join(', ')}
- Weaknesses: ${blueprint.selfReportedWeaknesses?.join(', ')}
- 1 Year Goal: ${blueprint.oneYearGoal}
- Lifetime Goal: ${blueprint.lifetimeGoal}
- Willing to sacrifice: ${blueprint.willingToSacrifice?.join(', ')}
- Life story events: ${blueprint.lifeStoryEvents?.join(' | ')}

Write a 4-5 sentence Life Snapshot. It should:
1. Reflect back who this person genuinely is (not just their job title)
2. Name the tension or ambition that drives them
3. Acknowledge what they're carrying (responsibilities, constraints)
4. Set the tone: the Guardian is here to help them move forward

Make it feel like it was written specifically for them. Not generic. Not corporate.
`.trim();

  return ai.chat(system, prompt);
};

/**
 * Coach Chat — Free conversation with full context
 */
const coachChat = async ({ user, blueprint, goals, memories, patterns, recentLogs, message }) => {
  const ai = getAI();
  const context = buildHumanContext({ blueprint, goals, memories, patterns, recentLogs });
  const system = buildSystemPrompt(user.name, context);

  return ai.chat(system, message);
};

/**
 * Extract memories from a daily log (runs async after check-in)
 * Returns array of memory objects to be stored
 */
const extractMemoriesFromLog = async ({ user, blueprint, log }) => {
  const ai = getAI();

  const system = `You are the Memory Engine for HumanOS.
Your job is to extract structured memories from a user's daily check-in.
Only extract things worth remembering long-term. Not everything is worth storing.
Respond ONLY with a valid JSON array. No markdown, no explanation.`;

  const prompt = `
User: ${user.name}
Role: ${blueprint?.currentRole}
Today's log:
- Objective: "${log.mainObjective}"
- Completed: "${log.completedWork}"
- Blocked by: "${log.blockers}"
- Energy: ${log.energyLevel}/10, Evening energy: ${log.eveningEnergy}/10
- Reflection: "${log.eveningReflection}"

Extract 0-3 memories worth storing. For each, return:
{
  "type": "CURRENT_PROJECT | CURRENT_PRIORITY | HABIT | TENDENCY | OBSTACLE | LESSON | MILESTONE",
  "content": "specific memory text",
  "importance": 1-10
}

Return only a JSON array. Example: [{"type":"LESSON","content":"Works better when tasks are under 2 hours","importance":7}]
If nothing is worth storing, return: []
`.trim();

  try {
    const response = await ai.chat(system, prompt);
    const clean = response.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return [];
  }
};

module.exports = {
  processMorningCheckin,
  processEveningCheckin,
  generateWeeklyReview,
  detectBottleneck,
  generateLifeSnapshot,
  coachChat,
  extractMemoriesFromLog,
};
