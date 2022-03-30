import delay from "delay";
import { chromium } from "playwright";
import path from "path";
import process from "process";
import toml from "toml";
import fs from "fs";
import child from "child_process";
async function main() {
    let config = toml.parse(fs.readFileSync("./config.toml").toString());
    let browser = await chromium.launch({ headless: true });
    let context = await browser.newContext();
    let page = await context.newPage();
    await page.addInitScript(() => {
        window.print = function () { };
    });
    fs.promises.mkdir("outputs").catch((e) => undefined);
    for (let book_key in config.Books) {
        let book = config.Books[book_key];
        console.log("Download from", book_key);
        await page.goto(book.print_url);
        page.on("dialog", (page) => {
            console.log("THere is a dailog");
            page.accept();
        });
        console.log("Saving page");
        await page.evaluate(() => {
            let head = document.querySelector("head");
            let link = document.createElement("link");
            link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;900&display=swap";
            link.rel = "stylesheet";
            head.appendChild(link);
            let link2 = document.createElement("link2");
            link2.href = "   https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap";
            link2.rel = "stylesheet";
            head.appendChild(link2);
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
        `;
            var styleSheet = document.createElement("style");
            styleSheet.type = "text/css";
            styleSheet.innerText = styles;
            document.head.appendChild(styleSheet);
            document.getElementById("sidebar")?.remove();
            document.getElementById("menu-bar")?.remove();
            Array.from(document.querySelectorAll("div.buttons")).forEach((el) => el?.remove());
            Array.from(document.querySelectorAll("img.ferris")).forEach((el) => el?.remove());
            document.getElementById("page-wrapper").classList?.remove("page-wrapper");
            Array.from(document.getElementsByTagName("script")).forEach((el) => el?.remove());
            document.getElementById("sections")?.remove();
            Array.from(document.getElementsByTagName("img")).forEach(function (el) {
                if (el?.src.indexOf("https://rustwasm.github.io/docs/images/") > -1)
                    el.src = "https://rustwasm.github.io/docs/book/images/game-of-life/" + el.src.split(/[/ ]+/).pop();
            });
        });
        console.log("Delay for 30 seconds");
        await delay(30 * 1000);
        console.log("Saving pdf");
        let dest = path.resolve(`./outputs/${book.file_name}.pdf`);
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
        });
        console.log("Saving epub", book.file_name);
        let cdp = await page.context().newCDPSession(page);
        let { data: htmlData } = await cdp.send("Page.captureSnapshot", { format: "mhtml" });
        fs.promises.writeFile(path.resolve(`./outputs/${book.file_name}.mhtml`), htmlData);
        // Doesn't work
        let pandocResult = child.execSync(`pandoc ./outputs/${book.file_name}.mhtml --to=epub --output=./outputs/${book.file_name}.epub`);
        console.log(`Pandoc ${pandocResult.toString()}`);
    }
    console.log("Completed");
    await browser.close();
    process.exit(0);
}
main().catch((e) => {
    console.log("Error", e);
    process.exit(0);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLEVBQUUsUUFBUSxFQUFXLE1BQU0sWUFBWSxDQUFBO0FBQzlDLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQTtBQUN2QixPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUE7QUFDN0IsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBQ3ZCLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQTtBQUNuQixPQUFPLEtBQUssTUFBTSxlQUFlLENBQUE7QUFJakMsS0FBSyxVQUFVLElBQUk7SUFDZixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtJQUVwRSxJQUFJLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUN2RCxJQUFJLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUN4QyxJQUFJLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUNsQyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFO1FBQzFCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsY0FBYSxDQUFDLENBQUE7SUFDakMsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBRXBELEtBQUssSUFBSSxRQUFRLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtRQUMvQixJQUFJLElBQUksR0FBRyxNQUFNLENB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