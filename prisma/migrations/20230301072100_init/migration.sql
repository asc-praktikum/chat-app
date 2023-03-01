/*
  Warnings:

  - You are about to drop the column `user` on the `chat` table. All the data in the column will be lost.
  - Added the required column `userID` to the `chat` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "userID" TEXT NOT NULL
);
INSERT INTO "new_chat" ("createdAt", "id", "message") SELECT "createdAt", "id", "message" FROM "chat";
DROP TABLE "chat";
ALTER TABLE "new_chat" RENAME TO "chat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
