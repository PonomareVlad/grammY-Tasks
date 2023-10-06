import {BaseTask} from "./base.mjs";

export const {
    TASK_SEGMENT_LIMIT = "100",
} = process.env;

export class BroadcastTask extends BaseTask {

    static name = "broadcast"

    static limit = parseInt(TASK_SEGMENT_LIMIT)

    async run(...args) {
        const {limit} = this.constructor;
        const {task, segment} = this.getData();
        if (!globalThis.tasks.has(task)) throw new Error("Task not found");
        if (segment) return this.createTasks(...args);
        const count = await this.countUsers(...args);
        if (count <= limit) return this.createTasks(...args);
        const segments = Math.ceil(count / limit);
        console.debug({count, limit, segments});
        const result = await Promise.allSettled(Array(segments).fill(0).map((_, index) => this.createSegment(index)));
        return {count: result.length, errors: result.filter(({status} = {}) => status === "rejected")};
    }

    async createTasks(bot, collection) {
        const {task, limit, skip} = this.getData();
        const targetTask = globalThis.tasks.get(task);
        const users = await collection.find(this.getFilter()).limit(limit).skip(skip).toArray();
        console.debug(users.length, {task, limit, skip});
        const result = await Promise.allSettled(users.map(user => new targetTask(this.getTaskData(user)).now()));
        return {count: result.length, errors: result.filter(({status} = {}) => status === "rejected")};
    }

    createSegment(index = 0) {
        const {limit} = this.constructor;
        return new this.constructor({
            ...this.data,
            skip: limit * index,
            segment: true,
            limit,
        }).now({skipImmediate: false});
    }

    async countUsers(bot, collection) {
        const $match = this.getFilter();
        const [{count = 0} = {}] = await collection.aggregate([
            Object.keys($match).length ? {$match} : undefined,
            {$count: "count"}
        ].filter(Boolean)).toArray();
        return count;
    }

    getTaskData({key} = {}) {
        const {data = {}} = this.getData();
        return {chat_id: key.toString(), ...data};
    }

    getFilter() {
        const {filter = {}} = this.getData();
        return filter;
    }

}

BroadcastTask.define();
