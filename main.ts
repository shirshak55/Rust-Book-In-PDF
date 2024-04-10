import { Browser, chromium } from "playwright"
import path from "path"
import process from "process"
import toml from "toml"
import fs from "fs"
import pLimit from 'p-limit'
import { setTimeout as delay } from "node:timers/promises"

declare const document: any

let config = toml.parse(fs.readFileSync("./config.toml").toString())


async function main() {
    let browser = await chromium.launch({ headless: true })

    // concurrency of 5
    let limit = pLimit(50)
    let proms = []
    for (let mode of ["dark", "light"] as const) {
        for (let book_key in config.Books) {
            proms.push(limit((...args) => fetchBook(...args), book_key, browser, mode))
        }
    }
    await Promise.all(proms)
    console.log("Completed")
    await browser.close()
    process.exit(0)
}

async function fetchBook(book_key: string, browser: Browser, mode: "dark" | "light") {
    let context = await browser.newContext({ colorScheme: mode })
    let page = await context.newPage()
    let book = config.Books[book_key]

    console.log("Download from", book_key)

    await page.goto(book.print_url)
    await page.evaluate(() => {
        let head = document.querySelector("head")
        let link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;900&display=swap"
        link.rel = "stylesheet"
        head.appendChild(link)

        let link2 = document.createElement("link2")
        link2.href = "   https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
        link2.rel = "stylesheet"
        head.appendChild(link2)

        var styles = `
    html {
        font-family: Nunito
    }

    body{
        margin: 40px 25px 40ox 25px !important;
    }

    pre, code {
        font-family: 'Fira Code', monospace;
    }

    .fa.fa-copy clip-button {
        display:none
    }

    h1 {
        page-break-before: always;
    }
`
        var styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)
    })

    console.log("Delay for 30 seconds")
    await delay(30 * 1000)


    let dest = path.resolve(book.file_name.replace(".pdf", `_${mode}.pdf`))
    await page.pdf({
        path: dest,
        format: "a4",
        printBackground: true,
        margin: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        },
    })

    console.log(`Successfully printed? ${dest}`)

}
main().catch((e) => {
    console.log("Error on main", e)
    process.exit(0)
})

export { }
