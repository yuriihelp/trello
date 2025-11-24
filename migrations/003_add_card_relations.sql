-- Migration: Add CardRelation model for JIRA-style task dependencies
-- Created: 2025-11-24

-- Create RelationType enum
CREATE TYPE "RelationType" AS ENUM ('BLOCKS', 'BLOCKED_BY', 'RELATES_TO', 'DUPLICATES', 'CLONES');

-- Create CardRelation table
CREATE TABLE "CardRelation" (
    "id" TEXT NOT NULL,
    "type" "RelationType" NOT NULL,
    "fromCardId" TEXT NOT NULL,
    "toCardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardRelation_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "CardRelation_fromCardId_idx" ON "CardRelation"("fromCardId");
CREATE INDEX "CardRelation_toCardId_idx" ON "CardRelation"("toCardId");

-- Add unique constraint to prevent duplicate relations
CREATE UNIQUE INDEX "CardRelation_fromCardId_toCardId_type_key" ON "CardRelation"("fromCardId", "toCardId", "type");

-- Add foreign keys
ALTER TABLE "CardRelation" ADD CONSTRAINT "CardRelation_fromCardId_fkey" FOREIGN KEY ("fromCardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CardRelation" ADD CONSTRAINT "CardRelation_toCardId_fkey" FOREIGN KEY ("toCardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Comment
COMMENT ON TABLE "CardRelation" IS 'Stores relationships between cards (blocks, blocked_by, relates_to, etc.) similar to JIRA issue links';
