import delay from "delay"
import { chromium } from "playwright"
import path from "path"

declare const document: any

async function main() {
    let browser = await chromium.launch({ headless: true })
    let context = await browser.newContext()
    let page = await context.newPage()

    await page.goto("https://doc.rust-lang.org/book/print.html")
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

    let dest = path.resolve(`./trlp_${new Date().toDateString().split(" ").join("_")}.pdf`)
    await page.pdf({
        path: dest,
        format: "a4",
        printBackground: true,
        margin: {
            top: 40,
            bottom: 40,
            left: 25,
            right: 25,
        },
        displayHeaderFooter: true,
        footerTemplate: `<span style="font-size: 10px"> <span class="pageNumber"></span>/<span class="totalPages"></span></span>`,
    })

    console.log(`Succesfully printed? ${dest}`)

    console.log("Completed")
    await browser.close()
    process.exit(0)
}

main().catch((e) => {
    console.log("Error", e)
    process.exit(0)
})

export {}
