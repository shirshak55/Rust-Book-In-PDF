import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import toml from "toml";
import { createLogger } from "./shared/logger.ts";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, "..");

interface AppConfig {
  Site?: {
    repo: string;
  };
  Books: Record<
    string,
    {
      print_url: string;
      file_name: string;
      display_title?: string;
    }
  >;
}

const config = toml.parse(
  fs.readFileSync(path.join(ROOT, "config.toml"), "utf-8"),
) as AppConfig;
const logger = createLogger("site-generator");

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeUrl(url: string) {
  return new URL(url).toString();
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
      /^[A-Z0-9]{2,}$/.test(word)
        ? word
        : word[0].toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");
}

function toAssetBaseName(fileName: string) {
  return path.basename(fileName).replace(/\.pdf$/i, "");
}

function buildBookCards(books: AppConfig["Books"]) {
  return Object.entries(books)
    .map(([key, book]) => {
      const title = escapeHtml((book.display_title ?? toTitle(key)).trim());
      const printUrl = escapeHtml(normalizeUrl(book.print_url));
      const baseName = escapeHtml(toAssetBaseName(book.file_name));
      return `      <div class="card">
        <div class="card-title">
          <a href="${printUrl}" target="_blank" rel="noopener">${title}</a>
        </div>
        <div class="card-actions">
          <a class="btn btn-light" data-asset="${baseName}_light.pdf" href="#">Light</a>
          <a class="btn btn-dark" data-asset="${baseName}_dark.pdf" href="#">Dark</a>
        </div>
      </div>`;
    })
    .join("\n");
}

const repo = ensureRepo(config.Site?.repo);
const template = fs.readFileSync(path.join(DIR, "template.html"), "utf-8");
const html = template
  .replace("<!-- {{BOOK_CARDS}} -->", buildBookCards(config.Books))
  .replaceAll("{{REPO}}", repo);

const docsDir = path.join(ROOT, "docs");
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, "index.html"), html);
logger.info("Generated docs/index.html");
