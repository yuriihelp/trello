-- Migration: Add JIRA-style keys and card numbers

BEGIN;

-- Add key and cardCounter to Board
ALTER TABLE "Board" ADD COLUMN IF NOT EXISTS "key" VARCHAR(10);
ALTER TABLE "Board" ADD COLUMN IF NOT EXISTS "cardCounter" INTEGER DEFAULT 0;

-- Set default keys for existing boards
DO $$
DECLARE
  board_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR board_record IN SELECT id FROM "Board" WHERE "key" IS NULL LOOP
    UPDATE "Board" SET "key" = 'BOARD' || counter WHERE id = board_record.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Add unique constraint
ALTER TABLE "Board" ADD CONSTRAINT "Board_key_key" UNIQUE ("key");

-- Add number and boardKey to Card
ALTER TABLE "Card" ADD COLUMN IF NOT EXISTS "number" INTEGER;
ALTER TABLE "Card" ADD COLUMN IF NOT EXISTS "boardKey" VARCHAR(10);

-- Populate card numbers
DO $$
DECLARE
  list_rec RECORD;
  card_rec RECORD;
  bkey VARCHAR(10);
  cnum INTEGER;
BEGIN
  FOR list_rec IN SELECT id, "boardId" FROM "List" LOOP
    SELECT "key" INTO bkey FROM "Board" WHERE id = list_rec."boardId";
    cnum := 1;
    FOR card_rec IN SELECT id FROM "Card" WHERE "listId" = list_rec.id AND "number" IS NULL ORDER BY "createdAt" LOOP
      UPDATE "Card" SET "number" = cnum, "boardKey" = bkey WHERE id = card_rec.id;
      cnum := cnum + 1;
    END LOOP;
    UPDATE "Board" SET "cardCounter" = cnum - 1 WHERE id = list_rec."boardId";
  END LOOP;
END $$;

-- Add unique constraint
ALTER TABLE "Card" ADD CONSTRAINT "Card_boardKey_number_key" UNIQUE ("boardKey", "number");

COMMIT;
