export function normalizeHttpUrl(url: string) {
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(
      `Invalid URL protocol in config.toml: ${parsedUrl.protocol}`,
    );
  }
  return parsedUrl.toString();
}
