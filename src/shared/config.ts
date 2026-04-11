import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import toml from "toml";

export interface AppConfig {
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

export function getProjectRoot(fromFileUrl: string) {
  return path.resolve(path.dirname(fileURLToPath(fromFileUrl)), "..");
}

export function loadConfig(fromFileUrl: string) {
  const projectRoot = getProjectRoot(fromFileUrl);
  return toml.parse(
    fs.readFileSync(path.join(projectRoot, "config.toml"), "utf-8"),
  ) as AppConfig;
}
