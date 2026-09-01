## Rust Books PDF

69 freely available Rust books as light and dark PDFs (with bookmarks), rebuilt monthly from their original sources.

Download from the [website](https://shirshak55.github.io/Rust-Book-In-PDF/) or the [release tab](https://github.com/shirshak55/Rust-Book-In-PDF/releases/) (see the Assets section).

### Contributing

Feel free to send a pull request. We follow the Rust Code of Conduct.

### Development

To run this project, install [Node](https://nodejs.org/) 26+ and pnpm.

```bash
git clone https://github.com/shirshak55/Rust-Book-In-PDF.git
pnpm install
pnpm exec playwright install chromium --only-shell
pnpm start
```

This downloads all books listed in `config.toml`.

Use `DEBUG_ONLY_FIRST=true pnpm start` to process only the first book during debugging.

Use `DEBUG_ONLY_BOOK=<config_key> pnpm start` (e.g. `DEBUG_ONLY_BOOK=Nomicon`) to process a single book by its `config.toml` key.

Use `PRINT_SETTLE_MS=12000 pnpm start` to enforce a longer fixed settle delay before printing.

Use `pnpm generate-site` to regenerate `docs/index.html`.

### Support us

You can support us by starring the repo. As the book is written by other people, I can't take any financial support.

### Thanks,

- Shirshak
- TRPL team
- Rustaceans
- Contributors
