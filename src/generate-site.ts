import fs from "node:fs";
import path from "node:path";
import { type AppConfig, getProjectRoot, loadConfig } from "./shared/config.ts";
import { createLogger } from "./shared/logger.ts";
import { normalizeHttpUrl } from "./shared/url.ts";

const PROJECT_ROOT = getProjectRoot(import.meta.url);
const config = loadConfig(import.meta.url);
const logger = createLogger("site-generator");

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function ensureRepo(repo: string | undefined) {
  if (!repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new Error("Invalid or missing Site.repo in config.toml");
  }
  return repo;
}

function toTitle(value: string) {
  const formatted = value
    .replace(/[-_]/g, " ")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2");
  return formatted
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      /^[A-Z0-9]{2,}$/.test(word) ? word : word[0].toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");
}

function toAssetBaseName(fileName: string) {
  return path.basename(fileName).replace(/\.pdf$/i, "");
}

function buildBookRow(key: string, book: AppConfig["Books"][string]) {
  const title = (book.display_title ?? toTitle(key)).trim();
  const printUrl = escapeHtml(normalizeHttpUrl(book.print_url));
  const baseName = escapeHtml(toAssetBaseName(book.file_name));
  return `        <tr class="book" data-title="${escapeHtml(title.toLowerCase())}">
          <td class="book-title"><a href="${printUrl}" target="_blank" rel="noopener">${escapeHtml(title)}</a></td>
          <td class="dl"><a class="btn btn-light" data-asset="${baseName}_light.pdf" href="#">Light</a></td>
          <td class="dl"><a class="btn btn-dark" data-asset="${baseName}_dark.pdf" href="#">Dark</a></td>
        </tr>`;
}

function buildBookTableBodies(books: AppConfig["Books"]) {
  const sections = new Map<string, string[]>();
  for (const [key, book] of Object.entries(books)) {
    const category = book.category?.trim() || "Other";
    const rows = sections.get(category) ?? [];
    rows.push(buildBookRow(key, book));
    sections.set(category, rows);
  }
  return [...sections.entries()]
    .map(
      ([category, rows]) => `      <tbody class="category">
        <tr class="category-row"><th colspan="3">${escapeHtml(category)} <span class="count">${rows.length}</span></th></tr>
${rows.join("\n")}
      </tbody>`,
    )
    .join("\n");
}

const repo = ensureRepo(config.Site?.repo);
const template = fs.readFileSync(path.join(PROJECT_ROOT, "src", "template.html"), "utf-8");
const html = template
  .replace("<!-- {{BOOK_ROWS}} -->", buildBookTableBodies(config.Books))
  .replaceAll("{{REPO}}", repo);

const docsDir = path.join(PROJECT_ROOT, "docs");
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, "index.html"), html);
logger.info("Generated docs/index.html");
