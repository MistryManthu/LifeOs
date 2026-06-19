-- CreateEnum
CREATE TYPE "Domain" AS ENUM ('WORK', 'HEALTH', 'MONEY', 'GROWTH', 'RELATIONSHIPS', 'HOME', 'BUSINESS');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'DROPPED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "RiskTolerance" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "LearningStyle" AS ENUM ('VISUAL', 'READING', 'HANDS_ON', 'AUDIO');

-- CreateEnum
CREATE TYPE "WorkStyle" AS ENUM ('MORNING_PERSON', 'NIGHT_OWL', 'MIXED');

-- CreateEnum
CREATE TYPE "MemoryType" AS ENUM ('CORE_VALUE', 'MAJOR_GOAL', 'LIFE_EVENT', 'STRENGTH', 'WEAKNESS', 'CURRENT_PROJECT', 'CURRENT_PRIORITY', 'HABIT', 'TENDENCY', 'OBSTACLE', 'LESSON', 'MILESTONE');

-- CreateEnum
CREATE TYPE "MemorySource" AS ENUM ('ONBOARDING', 'DAILY_CHECKIN', 'WEEKLY_REVIEW', 'LIFE_EVENT', 'GOAL_UPDATE', 'GUARDIAN_INFERENCE', 'USER_CORRECTION');

-- CreateEnum
CREATE TYPE "BottleneckCategory" AS ENUM ('TIME', 'MONEY', 'KNOWLEDGE', 'FEAR', 'HEALTH', 'RELATIONSHIPS', 'EXECUTION', 'CLARITY', 'MOTIVATION');

-- CreateEnum
CREATE TYPE "InsightTrigger" AS ENUM ('MORNING_CHECKIN', 'EVENING_CHECKIN', 'WEEKLY_REVIEW', 'GOAL_UPDATE', 'PATTERN_DETECTED', 'USER_INITIATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HumanBlueprint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ageRange" TEXT,
    "occupation" TEXT,
    "location" TEXT,
    "currentRole" TEXT NOT NULL,
    "futureRole" TEXT NOT NULL,
    "lifeRoles" TEXT[],
    "responsibilities" TEXT[],
    "oneYearGoal" TEXT,
    "fiveYearGoal" TEXT,
    "lifetimeGoal" TEXT,
    "constraints" TEXT[],
    "declaredValues" TEXT[],
    "riskTolerance" "RiskTolerance" NOT NULL DEFAULT 'MEDIUM',
    "learningStyle" "LearningStyle" NOT NULL DEFAULT 'VISUAL',
    "workStyle" "WorkStyle" NOT NULL DEFAULT 'MIXED',
    "willingToSacrifice" TEXT[],
    "notWillingToSacrifice" TEXT[],
    "selfReportedStrengths" TEXT[],
    "selfReportedWeaknesses" TEXT[],
    "lifeStoryEvents" TEXT[],
    "guardianSnapshot" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HumanBlueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "domain" "Domain" NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "targetDate" TIMESTAMP(3),
    "quarter" INTEGER,
    "year" INTEGER,
    "progressPct" INTEGER NOT NULL DEFAULT 0,
    "currentBottleneck" TEXT,
    "bottleneckCategory" "BottleneckCategory",
    "bottleneckUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "morningCompleted" BOOLEAN NOT NULL DEFAULT false,
    "mainObjective" TEXT,
    "availableHours" DOUBLE PRECISION,
    "topChallenge" TEXT,
    "energyLevel" INTEGER,
    "mood" TEXT,
    "guardianMorningSuggestion" TEXT,
    "suggestedPriorities" TEXT[],
    "eveningCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedWork" TEXT,
    "blockers" TEXT,
    "eveningEnergy" INTEGER,
    "eveningReflection" TEXT,
    "memoryExtracted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MemoryType" NOT NULL,
    "content" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 5,
    "sourceType" "MemorySource" NOT NULL,
    "sourceId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "evidence" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BehaviorLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" "Domain" NOT NULL,
    "action" TEXT NOT NULL,
    "alignedWith" TEXT[],
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BehaviorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pattern" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "domain" "Domain",
    "confidence" INTEGER NOT NULL DEFAULT 30,
    "evidence" TEXT[],
    "isValueGap" BOOLEAN NOT NULL DEFAULT false,
    "declaredValue" TEXT,
    "observedBehavior" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "domain" "Domain",
    "impactScore" INTEGER,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trigger" "InsightTrigger" NOT NULL,
    "currentFocus" TEXT,
    "bottleneck" TEXT,
    "bottleneckCategory" "BottleneckCategory",
    "recommendation" TEXT,
    "nextBestAction" TEXT,
    "reasoning" TEXT,
    "fullResponse" TEXT,
    "goalId" TEXT,
    "userActed" BOOLEAN,
    "userFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "wins" TEXT[],
    "missedOpportunities" TEXT[],
    "emergingPatterns" TEXT[],
    "nextWeekFocus" TEXT[],
    "domainScores" JSONB NOT NULL,
    "weeklyBottleneck" TEXT,
    "weeklyBottleneckCategory" "BottleneckCategory",
    "fullReview" TEXT,
    "userReflection" TEXT,
    "userRating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DailyLogGoals" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "HumanBlueprint_userId_key" ON "HumanBlueprint"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_DailyLogGoals_AB_unique" ON "_DailyLogGoals"("A", "B");

-- CreateIndex
CREATE INDEX "_DailyLogGoals_B_index" ON "_DailyLogGoals"("B");

-- AddForeignKey
ALTER TABLE "HumanBlueprint" ADD CONSTRAINT "HumanBlueprint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLog" ADD CONSTRAINT "DailyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehaviorLog" ADD CONSTRAINT "BehaviorLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pattern" ADD CONSTRAINT "Pattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeEvent" ADD CONSTRAINT "LifeEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentInsight" ADD CONSTRAINT "AgentInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentInsight" ADD CONSTRAINT "AgentInsight_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReview" ADD CONSTRAINT "WeeklyReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailyLogGoals" ADD CONSTRAINT "_DailyLogGoals_A_fkey" FOREIGN KEY ("A") REFERENCES "DailyLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DailyLogGoals" ADD CONSTRAINT "_DailyLogGoals_B_fkey" FOREIGN KEY ("B") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
