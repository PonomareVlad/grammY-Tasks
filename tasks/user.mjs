import {BotTask} from "./bot.mjs";

export class UserTask extends BotTask {

    static name = "user"

    async run(bot, collection) {
        const filter = this.getFilter();
        const update = this.getUpdate();
        const {
            matchedCount
        } = await collection.updateOne(filter, update);
        return matchedCount ?
            super.run(bot) :
            this.otherwise(bot);
    }

    otherwise() {
        return console.log(`Task ${this.constructor.name} has been skipped`);
    }

    getFilter() {
        const {chat_id, filter = {}} = this.getData();
        return {...filter, "key": chat_id.toString()};
    }

    getUpdate() {
        const {update = {$set: {}}} = this.getData();
        return update;
    }

}

UserTask.define();
