import { parse } from "csv-parse";
import fs from "node:fs";

const csvPath = new URL("./tasks.csv", import.meta.url);
const url = "http://localhost:3333/tasks";

const csvParser = parse({ from_line: 2 });

async function importCsv() {
    try {
        const stream = fs.createReadStream(csvPath);

        const parser = stream.pipe(csvParser);

        for await (const record of parser) {
            await fetch(url, {
                method: "post",
                body: JSON.stringify({
                    title: record[0],
                    description: record[1],
                }),
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (error) {
        console.log(error);
    }
}

importCsv();
