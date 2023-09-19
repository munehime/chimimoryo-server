import { start } from "./app";

(async () => {
    try {
        await start();
    } catch (err) {
        console.error(err);
    }
})();
