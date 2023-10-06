import {BaseTask} from "./base.mjs";

export class BotTask extends BaseTask {

    static name = "bot"

    static createMiddleware(bot) {
        return async ctx => {
            const {id: chat_id} = ctx.chat;
            await new this({chat_id}).run(bot);
        }
    }

    run(bot) {
        const method = this.getMethod(bot);
        const args = this.getArgs();
        return method(...args);
    }

    getMethod(bot) {
        const {
            method = "sendMessage",
        } = this.getData();
        if (
            !bot.api ||
            !method in bot.api ||
            typeof bot.api[method] !== "function"
        ) throw new Error("Method not available");
        return bot.api[method].bind(bot.api);
    }

    getArgs() {
        const {chat_id, args = []} = this.getData();
        return chat_id ? [chat_id, ...args] : args;
    }

    async result(result) {
        if (typeof result !== "object")
            return super.result(result);
        const {
            error_code,
            parameters = {},
        } = result;
        switch (error_code) {
            case 429:
                const {retry_after = 10} = parameters;
                const valid = retry_after && !isNaN(retry_after);
                const delay = valid ? retry_after : 10;
                const time = Date.now() + (delay * 1000);
                await this.once(time);
        }
        return super.result(result);
    }

}

BotTask.define();
