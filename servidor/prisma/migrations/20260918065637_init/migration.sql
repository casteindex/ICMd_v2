-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "declaredStatus" TEXT NOT NULL DEFAULT 'OK',
    "agentVersion" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "cpuPercent" INTEGER NOT NULL,
    "memoryPercent" INTEGER NOT NULL,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "stationId" INTEGER NOT NULL,
    CONSTRAINT "Report_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Report" ("agentVersion", "cpuPercent", "createdAt", "declaredStatus", "id", "ipAddress", "memoryPercent", "stationId") SELECT "agentVersion", "cpuPercent", "createdAt", "declaredStatus", "id", "ipAddress", "memoryPercent", "stationId" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
