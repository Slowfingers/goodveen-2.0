-- CreateTable
CREATE TABLE "workshop_tabs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "workshop_portfolio_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tabId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "workshop_portfolio_images_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "workshop_tabs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workshop_content_blocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tabId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "workshop_content_blocks_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "workshop_tabs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "workshop_tabs_slug_key" ON "workshop_tabs"("slug");

-- CreateIndex
CREATE INDEX "workshop_portfolio_images_tabId_idx" ON "workshop_portfolio_images"("tabId");

-- CreateIndex
CREATE INDEX "workshop_content_blocks_tabId_idx" ON "workshop_content_blocks"("tabId");
