import delay from "delay";
import { chromium } from "playwright";
import path from "path";
async function main() {
    let browser = await chromium.launch({ headless: true });
    let context = await browser.newContext();
    let page = await context.newPage();
    await page.goto("https://doc.rust-lang.org/book/print.html");
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
    let dest = path.resolve(`./trlp_${new Date().toDateString().split(" ").join("_")}.pdf`);
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
        headerTemplate: "",
        footerTemplate: `<span style="margin-left:auto"> <span class="pageNumber"></span></span>`,
    });
    console.log(`Succesfully printed? ${dest}`);
    console.log("Completed");
    await browser.close();
    process.exit(0);
}
main().catch((e) => {
    console.log("Error", e);
    process.exit(0);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUN6QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQ3JDLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQTtBQUl2QixLQUFLLFVBQVUsSUFBSTtJQUNmLElBQUksT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ3ZELElBQUksT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFBO0lBQ3hDLElBQUksSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBRWxDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFBO0lBQzVELE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7UUFDckIsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUN6QyxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3pDLElBQUksQ0FBQyxJQUFJLEdBQUcsK0VBQStFLENBQUE7UUFDM0YsSUFBSSxDQUFDLEdBQUcsR0FBRyxZQUFZLENBQUE7UUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUV0QixJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzNDLEtBQUssQ0FBQyxJQUFJLEdBQUcsNkZBQTZGLENBQUE7UUFDMUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxZQUFZLENBQUE7UUFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUV2QixJQUFJLE1BQU0sR0FBRzs7Ozs7Ozs7Ozs7Ozs7OztTQWdCWixDQUFBO1FBRUQsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNoRCxVQUFVLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQTtRQUM1QixVQUFVLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQTtRQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUN6QyxDQUFDLENBQUMsQ0FBQTtJQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtJQUNuQyxNQUFNLEtBQUssQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7SUFFdEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDdkYsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ1gsSUFBSSxFQUFFLElBQUk7UUFDVixNQUFNLEVBQUUsSUFBSTtRQUNaLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLE1BQU0sRUFBRTtZQUNKLEdBQUcsRUFBRSxFQUFFO1lBQ1AsTUFBTSxFQUFFLEVBQUU7WUFDVixJQUFJLEVBQUUsRUFBRTtZQUNSLEtBQUssRUFBRSxFQUFFO1NBQ1o7UUFDRCxtQkFBbUIsRUFBRSxJQUFJO1FBQ3pCLGNBQWMsRUFBRSxFQUFFO1FBQ2xCLGNBQWMsRUFBRSx5RUFBeUU7S0FDNUYsQ0FBQyxDQUFBO0lBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUUzQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ3hCLE1BQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFBO0lBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbkIsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNuQixDQUFDLENBQUMsQ0FBQSJ9