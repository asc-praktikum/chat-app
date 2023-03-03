-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "currentRoomID" TEXT
);
INSERT INTO "new_user" ("createdAt", "currentRoomID", "id", "name", "online", "password", "salt") SELECT "createdAt", "currentRoomID", "id", "name", "online", "password", "salt" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
