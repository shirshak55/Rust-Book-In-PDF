import { Browser, chromium } from "playwright"
import path from "path"
import process from "process"
import toml from "toml"
import fs from "fs"
import pLimit from 'p-limit'
import { setTimeout as delay } from "node:timers/promises"

declare const document: any

let config = toml.parse(fs.readFileSync("./config.toml").toString())

// Create output directory
const OUTPUT_DIR = path.resolve("./output")
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

async function main() {
    console.log("Starting", { debugFirstPageOnly: process.env.DEBUG_ONLY_FRIST === "true" })
    console.log("Output directory:", OUTPUT_DIR)
    let browser = await chromium.launch({ headless: true })

    // concurrency of 5
    let limit = pLimit(10)
    let proms = []

    for (let book_key in config.Books) {
        for (let mode of ["dark", "light"] as const) {
            proms.push(limit((...args) => fetchBook(...args), book_key, browser, mode))
        }

        if (process.env.DEBUG_ONLY_FRIST === "true") {
            break
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

    // Emulate media for dark mode
    if (mode === "dark") {
        await page.emulateMedia({ colorScheme: 'dark' })
    } else {
        await page.emulateMedia({ colorScheme: 'light' })
    }

    await page.evaluate((mode: "dark" | "light") => {
        // workaround for working with tsx
        window.__name = () => { }
        let head = document.querySelector("head")
        let link = document.createElement("link")
        link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;900&display=swap"
        link.rel = "stylesheet"
        head.appendChild(link)

        let link2 = document.createElement("link")
        link2.href = "https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
        link2.rel = "stylesheet"
        head.appendChild(link2)

        var styles = `
            html {
                font-family: Nunito;
            }

            body{
                margin: 40px 25px 40px 25px !important;
            }

            pre, code {
                font-family: 'Fira Code', monospace;
            }

            .fa.fa-copy, clip-button {
                display:none
            }

            h1 {
                page-break-before: always;
            }
`

        if (mode === "dark") {
            styles += `
            * {
                background-color: #1e1e1e !important;
                color: #d4d4d4 !important;
                border-color: #444 !important;
            }
            
            html, body {
                background-color: #1e1e1e !important;
                color: #d4d4d4 !important;
            }
            
            a {
                color: #4a9eff !important;
            }
            
            a:visited {
                color: #9b6bff !important;
            }
            
            code {
                background-color: #2d2d2d !important;
                color: #ce9178 !important;
            }
            
            pre {
                background-color: #2d2d2d !important;
                border: 1px solid #444 !important;
            }
            
            pre code {
                color: #d4d4d4 !important;
            }
            
            table {
                background-color: #252526 !important;
            }
            
            th {
                background-color: #2d2d2d !important;
                color: #d4d4d4 !important;
            }
            
            td {
                background-color: #1e1e1e !important;
                border-color: #444 !important;
            }
            
            blockquote {
                background-color: #2d2d2d !important;
                border-left-color: #007acc !important;
            }
            
            hr {
                border-color: #444 !important;
            }
            
            h1, h2, h3, h4, h5, h6 {
                color: #569cd6 !important;
            }
`
        }

        var styleSheet = document.createElement("style")
        styleSheet.type = "text/css"
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)
    }, mode)

    // Add table of contents
    await page.evaluate(() => {
        // Create the table of contents container
        const toc = document.createElement('div')
        toc.id = 'table-of-contents'
        toc.innerHTML = '<h2>Table of Contents</h2>'
        toc.style.margin = '40px'
        // Find all headings
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        const tocList = document.createElement('ul')

        // Calculate page height (assuming A4 page size)
        const pageHeight = 1122 // A4 height in pixels at 96 DPI

        headings.forEach((heading: any, index: any) => {
            const listItem = document.createElement('li')
            const link = document.createElement('a')

            // Set the link text and href
            link.textContent = heading.textContent
            link.href = `#heading-${index}`

            // Add a class based on the heading level
            listItem.className = `toc-${heading.tagName.toLowerCase()}`

            // Create a span for the dotted line
            const dots = document.createElement('span')
            dots.className = 'dots'

            // Append elements
            listItem.appendChild(link)
            listItem.appendChild(dots)
            tocList.appendChild(listItem)

            // Add an id to the heading
            heading.id = `heading-${index}`
        })

        toc.appendChild(tocList)

        // Insert the table of contents at the beginning of the body
        document.body.insertBefore(toc, document.body.firstChild)
    })

    if (book.file_name.includes("high_assurance_rust")) {
        await page.click("#sidebar-toggle")
    }


    if (process.env.DEBUG_ONLY_FRIST === "true") {
        console.log("Waiting for 5 seconds")
        await delay(5 * 1000)
    } else {
        console.log("Waiting for 20 seconds")
        await delay(20 * 1000)
    }

    let dest = path.join(OUTPUT_DIR, book.file_name.replace(".pdf", `_${mode}.pdf`))
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
    })

    console.log(`Successfully printed? ${dest}`)
}

main().catch((e) => {
    console.log("Error on main", e)
    process.exit(0)
})

export { }
