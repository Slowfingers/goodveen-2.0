-- CreateTable
CREATE TABLE "contact_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'contact',
    "address" TEXT NOT NULL DEFAULT 'Tashkent, Uzbekiston Ovozi street 2/1',
    "addressNote" TEXT DEFAULT 'Mirobod, near the Botanical garden entrance',
    "phones" TEXT NOT NULL DEFAULT '["+ 998 71 233 97 80","+998 99 955 90 90","+998 71 120 06 04"]',
    "email" TEXT NOT NULL DEFAULT 'hello@goodveen.uz',
    "emailNote" TEXT DEFAULT 'For wholesale & press',
    "openHours" TEXT NOT NULL DEFAULT 'Every day · 09:00 — 21:00',
    "instagram" TEXT,
    "facebook" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
