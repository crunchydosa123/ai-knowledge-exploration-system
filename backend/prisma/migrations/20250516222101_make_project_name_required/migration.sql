/*
  Warnings:

  - Made the column `name` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- First update any NULL values to a default name
UPDATE "Project" SET "name" = 'Untitled Project' WHERE "name" IS NULL;

-- Then make the column required
ALTER TABLE "Project" ALTER COLUMN "name" SET NOT NULL;
