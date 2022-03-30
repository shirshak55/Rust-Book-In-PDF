import delay from "delay"
import { chromium, firefox } from "playwright"
import path from "path"
import process from "process"
import toml from "toml"
import fs from "fs"
import child from "child_process"

declare const document: any

async function main() {
    let config = toml.parse(fs.readFileSync("./config.toml").toString())

    let browser = await chromium.launch({ headless: true })
    let context = await browser.newContext()
    let page = await context.newPage()
    await page.addInitScript(() => {
        window.print = function () {}
    })

    fs.promises.mkdir("outputs").catch((e) => undefined)

    for (let book_key in config.Books) {
        let book = config.Books[book_key]

        console.log("Download from", book_key)

        await page.goto(book.print_url)
        page.on("dialog", (page) => {
            console.log("THere is a dailog")
            page.accept()
        })
        console.log("Saving page")
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

            document.getElementById("sidebar")?.remove()
            document.getElementById("menu-bar")?.remove()
            Array.from(document.querySelectorAll("div.buttons")).forEach((el: any) => el?.remove())
            Array.from(document.querySelectorAll("img.ferris")).forEach((el: any) => el?.remove())
            document.getElementById("page-wrapper").classList?.remove("page-wrapper")
            Array.from(document.getElementsByTagName("script")).forEach((el: any) => el?.remove())
            document.getElementById("sections")?.remove()

            Array.from(document.getElementsByTagName("img")).forEach(function (el: any) {
                if (el?.src.indexOf("https://rustwasm.github.io/docs/images/") > -1)
                    el.src = "https://rustwasm.github.io/docs/book/images/game-of-life/" + el.src.split(/[/ ]+/).pop()
            })
        })

        console.log("Delay for 30 seconds")
        await delay(30 * 1000)

        console.log("Saving pdf")
        let dest = path.resolve(`./outputs/${book.file_name}.pdf`)
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
        })

        console.log("Saving epub", book.file_name)
        let cdp = await page.context().newCDPSession(page)
        let { data: htmlData } = await cdp.send("Page.captureSnapshot", { format: "mhtml" })
        fs.promises.writeFile(path.resolve(`./outputs/${book.file_name}.mhtml`), htmlData)

        // Doesn't work
        let pandocResult = child.execSync(
            `pandoc ./outputs/${book.file_name}.mhtml --to=epub --output=./outputs/${book.file_name}.epub`,
        )
        console.log(`Pandoc ${pandocResult.toString()}`)
    }

    console.log("Completed")
    await browser.close()
    process.exit(0)
}

main().catch((e) => {
    console.log("Error", e)
    process.exit(0)
})

export {}
