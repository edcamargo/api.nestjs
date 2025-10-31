-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "phone1" TEXT NOT NULL DEFAULT '',
    "phone2" TEXT,
    "dialCodePhone1" TEXT NOT NULL DEFAULT '+351',
    "dialCodePhone2" TEXT,
    "countryCodePhone1" TEXT NOT NULL DEFAULT 'PT',
    "countryCodePhone2" TEXT,
    "internationalNumberPhone1" TEXT NOT NULL DEFAULT '',
    "internationalNumberPhone2" TEXT,
    "work_ip" TEXT,
    "notes" TEXT,
    "state" TEXT NOT NULL DEFAULT 'Active',
    "role" TEXT NOT NULL DEFAULT 'USER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME
);
INSERT INTO "new_users" ("countryCodePhone1", "countryCodePhone2", "created_at", "deleted_at", "dialCodePhone1", "dialCodePhone2", "email", "id", "internationalNumberPhone1", "internationalNumberPhone2", "name", "notes", "password", "phone1", "phone2", "role", "state", "surname", "updated_at", "username", "work_ip") SELECT "countryCodePhone1", "countryCodePhone2", "created_at", "deleted_at", "dialCodePhone1", "dialCodePhone2", "email", "id", "internationalNumberPhone1", "internationalNumberPhone2", "name", "notes", "password", "phone1", "phone2", "role", "state", "surname", "updated_at", "username", "work_ip" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
