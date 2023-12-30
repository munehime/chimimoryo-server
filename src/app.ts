import crypto from "crypto";
import http from "node:http";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import koaLogger from "koa-logger";
import session from "koa-session";
import cors from "@koa/cors";
import database from "@/database";
import logger from "@/logger";
import routes from "@/routes";

class Application {
    public readonly port: number;

    private readonly koa: Koa;

    constructor(port?: number) {
        this.port = port || 8000;

        this.koa = new Koa();
    }

    public async start(): Promise<void> {
        logger.info(`[server] starting...`);

        try {
            logger.info("[database] connecting...");

            await database.connect({ uri: process.env.CHIMIMORYO_DATABASE_URI ?? "" });

            logger.info("[database] connected");
        } catch (err: any) {
            logger.error(err.message);
            return;
        }

        logger.info("[router] mounting...");

        this.koa.use(async (ctx, next) => {
            try {
                await next();
            } catch (err: any) {
                ctx.status = err.statusCode || err.status || 500;

                if (ctx.status >= 500) {
                    ctx.body = {
                        error: "Something went gone! Please try again or contact the administrator.",
                    };

                    logger.error(err);
                    return;
                }

                ctx.body = {
                    error: err.message,
                };
            }
        });

        this.koa.keys = process.env.CHIMIMORYO_KOA_KEYS ? (process.env.CHIMIMORYO_KOA_KEYS).trim().split(/, /g) : [ crypto.randomBytes(64).toString("base64") ];
        this.koa.proxy = true;

        this.koa.use(
            bodyParser({
                encoding: "utf-8",
                strict: true,
            }),
        );

        this.koa.use(
            koaLogger((str) => {
                logger.info(str);
            }),
        );

        this.koa.use(
            cors({
                allowMethods: "GET,POST,PUT,DELETE,PATCH",
                credentials: true,
            }),
        );

        this.koa.use(routes.routes()).use(routes.allowedMethods());

        logger.info("[router] mounted");

        http.createServer(this.koa.callback()).listen(this.port, () => {
            logger.info("[server] started");
            logger.info(`[server] listening on port ${this.port}`);
        });
    }

    public async stop(): Promise<void> {
        logger.info("[server] stopping...");

        await database.disconnect();

        logger.info("[server] stopped");
    }
}

export default Application;
