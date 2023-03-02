-- CreateTable
CREATE TABLE "room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_roomTouser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_roomTouser_A_fkey" FOREIGN KEY ("A") REFERENCES "room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_roomTouser_B_fkey" FOREIGN KEY ("B") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'text',
    "ressource" TEXT NOT NULL DEFAULT '',
    "channelID" TEXT NOT NULL,
    CONSTRAINT "chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_chat" ("channelID", "createdAt", "id", "message", "ressource", "type", "userId") SELECT "channelID", "createdAt", "id", "message", "ressource", "type", "userId" FROM "chat";
DROP TABLE "chat";
ALTER TABLE "new_chat" RENAME TO "chat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_roomTouser_AB_unique" ON "_roomTouser"("A", "B");

-- CreateIndex
CREATE INDEX "_roomTouser_B_index" ON "_roomTouser"("B");
