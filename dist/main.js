import delay from "delay";
import { chromium } from "playwright";
import path from "path";
import process from "process";
import toml from "toml";
import fs from "fs";
async function main() {
    let config = toml.parse(fs.readFileSync("./config.toml").toString());
    let browser = await chromium.launch({ headless: true });
    let context = await browser.newContext();
    let page = await context.newPage();
    for (let book_key in config.Books) {
        let book = config.Books[book_key];
        console.log("Download from", book_key);
        await page.goto(book.print_url);
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
        });
        console.log("Delay for 30 seconds");
        await delay(30 * 1000);
        let dest = path.resolve(book.file_name);
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
        console.log(`Succesfully printed? ${dest}`);
    }
    console.log("Completed");
    await browser.close();
    process.exit(0);
}
main().catch((e) => {
    console.log("Error", e);
    process.exit(0);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ3JDLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQTtBQUN2QixPQUFPLE9BQU8sTUFBTSxTQUFTLENBQUE7QUFDN0IsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBQ3ZCLE9BQU8sRUFBRSxNQUFNLElBQUksQ0FBQTtBQUluQixLQUFLLFVBQVUsSUFBSTtJQUNmLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBRXBFLElBQUksT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ3ZELElBQUksT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFBO0lBQ3hDLElBQUksSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBRWxDLEtBQUssSUFBSSxRQUFRLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtRQUMvQixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBRWpDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBRXRDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDL0IsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNyQixJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3pDLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDekMsSUFBSSxDQUFDLElBQUksR0FBRywrRUFBK0UsQ0FBQTtZQUMzRixJQUFJLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQTtZQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBRXRCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDM0MsS0FBSyxDQUFDLElBQUksR0FBRyw2RkFBNkYsQ0FBQTtZQUMxRyxLQUFLLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQTtZQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBRXZCLElBQUksTUFBTSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7O1NBZ0JoQixDQUFBO1lBRUcsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUNoRCxVQUFVLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQTtZQUM1QixVQUFVLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQTtZQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUN6QyxDQUFDLENBQUMsQ0FBQTtRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtRQUNuQyxNQUFNLEtBQUssQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFFdEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDdkMsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1gsSUFBSSxFQUFFLElBQUk7WUFDVixNQUFNLEVBQUUsSUFBSTtZQUNaLGVBQWUsRUFBRSxJQUFJO1lBQ3JCLE1BQU0sRUFBRTtnQkFDSixHQUFHLEVBQUUsRUFBRTtnQkFDUCxNQUFNLEVBQUUsRUFBRTtnQkFDVixJQUFJLEVBQUUsRUFBRTtnQkFDUixLQUFLLEVBQUUsRUFBRTthQUNaO1NBQ0osQ0FBQyxDQUFBO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUM5QztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDeEIsTUFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUE7SUFDckIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNuQixDQUFDO0FBRUQsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7SUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ25CLENBQUMsQ0FBQyxDQUFBIn0=