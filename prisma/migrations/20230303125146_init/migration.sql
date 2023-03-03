-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "currentRoomID" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_user" ("createdAt", "id", "name", "password", "salt") SELECT "createdAt", "id", "name", "password", "salt" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
