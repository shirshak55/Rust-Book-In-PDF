import type { Browser } from "playwright";
import { chromium } from "playwright";
import type { Page } from "playwright";
import path from "node:path";
import process from "node:process";
import fs from "node:fs";
import pLimit from "p-limit";
import { setTimeout as delay } from "node:timers/promises";
import { getProjectRoot, loadConfig } from "./shared/config.ts";
import { createLogger } from "./shared/logger.ts";
import { normalizeHttpUrl } from "./shared/url.ts";

const PROJECT_ROOT = getProjectRoot(import.meta.url);
const config = loadConfig(import.meta.url);
const BOOK_FORMAT_CSS = fs.readFileSync(
  path.join(PROJECT_ROOT, "src", "book-format.css"),
  "utf-8",
);
const logger = createLogger("pdf-generator");

const OUTPUT_DIR = path.join(PROJECT_ROOT, "output");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

main().catch((e) => {
  logger.error({ err: e }, "Error on main");
  process.exit(1);
});

async function main() {
  const debugOnlyFirst = process.env.DEBUG_ONLY_FIRST === "true";
  logger.info({ debugFirstPageOnly: debugOnlyFirst }, "Starting");
  logger.info({ outputDir: OUTPUT_DIR }, "Output directory");
  const settleDelayMs = getSettleDelayMs(debugOnlyFirst);
  logger.info({ settleDelayMs }, "Print settle delay");
  const browser = await chromium.launch({ headless: true });

  const limit = pLimit(10);
  const failed: string[] = [];
  const proms: Promise<void>[] = [];

  for (const book_key of Object.keys(config.Books)) {
    for (const mode of ["dark", "light"] as const) {
      proms.push(
        limit(() =>
          fetchBook(book_key, browser, mode, settleDelayMs).catch((e) => {
            logger.error({ err: e, bookKey: book_key, mode }, "Book failed");
            failed.push(`${book_key} (${mode})`);
          }),
        ),
      );
    }

    if (debugOnlyFirst) {
      break;
    }
  }

  try {
    await Promise.all(proms);
  } finally {
    await browser.close();
  }

  if (failed.length > 0) {
    logger.error({ failed, failedCount: failed.length }, "Books failed");
    process.exit(1);
  }

  logger.info("Completed");
  process.exit(0);
}

function getSettleDelayMs(debugOnlyFirst: boolean) {
  const configuredDelay = Number.parseInt(
    process.env.PRINT_SETTLE_MS ?? "",
    10,
  );
  if (Number.isFinite(configuredDelay) && configuredDelay > 0) {
    return Math.min(configuredDelay, 30_000);
  }
  return debugOnlyFirst ? 5_000 : 8_000;
}

async function waitForPrintReadiness(page: Page, settleDelayMs: number) {
  await page.waitForLoadState("domcontentloaded", { timeout: 30_000 });
  await page
    .waitForLoadState("networkidle", { timeout: 15_000 })
    .catch(() => undefined);
  await page
    .waitForFunction(() => document.readyState === "complete", {
      timeout: 30_000,
    })
    .catch(() => undefined);
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }
  });
  logger.info({ settleDelayMs }, "Settling before PDF");
  await delay(settleDelayMs);
}

async function maybeToggleSidebar(page: Page, fileName: string) {
  if (!fileName.includes("high_assurance_rust")) {
    return;
  }
  const sidebarToggle = page.locator("#sidebar-toggle").first();
  const isVisible = await sidebarToggle.isVisible().catch(() => false);
  if (isVisible) {
    await sidebarToggle.click({ timeout: 5_000 });
  }
}

async function fetchBook(
  book_key: string,
  browser: Browser,
  mode: "dark" | "light",
  settleDelayMs: number,
) {
  const context = await browser.newContext({ colorScheme: mode });
  try {
    const page = await context.newPage();
    const book = config.Books[book_key];

    logger.info({ bookKey: book_key, mode }, "Download from source");
    const printUrl = normalizeHttpUrl(book.print_url);

    await page.goto(printUrl, {
      timeout: 60_000,
      waitUntil: "domcontentloaded",
    });

    await page.emulateMedia({ colorScheme: mode });

    await page.evaluate((bookFormatCss: string) => {
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.textContent = bookFormatCss;
      document.head.appendChild(styleSheet);
    }, BOOK_FORMAT_CSS);

    await page.evaluate(() => {
      const toc = document.createElement("div");
      toc.id = "table-of-contents";
      toc.innerHTML = "<h2>Table of Contents</h2>";
      toc.style.margin = "40px";
      const headings = document.querySelectorAll<HTMLHeadingElement>(
        "h1, h2, h3, h4, h5, h6",
      );
      const tocList = document.createElement("ul");
      const usedIds = new Map<string, number>();

      const slugify = (value: string) =>
        value
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

      headings.forEach((heading, index) => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        const headingText =
          heading.textContent?.trim() ?? `Section ${index + 1}`;
        const existingId = heading.id.trim();
        const baseId =
          existingId || slugify(headingText) || `heading-${index + 1}`;
        const collisionCount = usedIds.get(baseId) ?? 0;
        usedIds.set(baseId, collisionCount + 1);
        const stableId =
          collisionCount === 0 ? baseId : `${baseId}-${collisionCount + 1}`;

        link.textContent = headingText;
        link.href = `#${stableId}`;
        listItem.className = `toc-${heading.tagName.toLowerCase()}`;

        const dots = document.createElement("span");
        dots.className = "dots";

        listItem.append(link, dots);
        tocList.appendChild(listItem);
        heading.id = stableId;
      });

      toc.appendChild(tocList);
      document.body.insertBefore(toc, document.body.firstChild);
    });

    await maybeToggleSidebar(page, book.file_name);
    await waitForPrintReadiness(page, settleDelayMs);

    const dest = path.join(
      OUTPUT_DIR,
      book.file_name.replace(".pdf", `_${mode}.pdf`),
    );
    await page.pdf({
      path: dest,
      format: "A4",
      printBackground: true,
      margin: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
      displayHeaderFooter: true,
      headerTemplate: `
            <div style="position: absolute; right: 5px; top: 5px; font-size:15px; color:${mode === "light" ? "black" : "white"}"><span class="pageNumber"></span></div>
        `,
    });

    logger.info({ dest }, "Successfully printed");
  } finally {
    await context.close();
  }
}
