import * as dotenv from "dotenv";

dotenv.config();

import Application from "./app";

let port = 2000;

if (process.env.PORT && !isNaN(Number(process.env.PORT))) {
    port = parseInt(process.env.PORT);
}

const app = new Application(port);

app.start().catch();

process.on("SIGTERM", async () => {
    await app.stop().catch();
    process.exit(0);
});
