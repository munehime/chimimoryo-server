import http from "node:http";
import Koa from "koa";
import koaBodyParser from "koa-bodyparser";
import koaCors from "@koa/cors";
import koaLogger from "koa-logger";
import koaSession from "koa-session";
import routes from "@/routes";
import logger from "@/logger";

export const app = new Koa();

export const start = async (): Promise<void> => {
    const port = process.env.PORT || 8080;

    logger.info("[server] starting.");

    app.use(async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            if (err instanceof Error) {
                // ctx.status = err.statusCode || err.status || err.code || 500;
                ctx.body = { message: err.message };

                logger.error(err.message);
            }
        }
    });

    app.keys = [""];
    app.proxy = true;

    app.use(
        koaBodyParser({
            encoding: "utf-8",
            strict: true,
        }),
    );

    app.use(
        koaSession(
            {
                secure: process.env.NODE_ENV !== "development",
                httpOnly: true,
                renew: true,
            },
            app,
        ),
    );

    app.use(
        koaLogger((str) => {
            logger.info(str);
        }),
    );

    app.use(
        koaCors({
            allowMethods: "GET,POST,PUT,DELETE,PATCH",
            credentials: true,
        }),
    );

    app.use(routes.routes()).use(routes.allowedMethods());

    http.createServer(app.callback()).listen(port, () => {
        logger.info("[server] started.");
        logger.info(`[server] listening on port ${port}.`);
    });
};
