import {fetchAgenda} from "agenda-rest-client";

export const {
    TASK_JOB_NAME = "task",
} = process.env;

export class BaseTask {

    static job = TASK_JOB_NAME
    static name = "base"
    static data = {}

    now = this.schedule.bind(this, "job/now", undefined);
    once = this.schedule.bind(this, "job/once");
    every = this.schedule.bind(this, "job/every");

    constructor(data = {}) {
        Object.assign(this.data ??= {}, data);
    }

    static now = (data, ...args) => new this(data).now(...args)
    static once = (data, ...args) => new this(data).once(...args)
    static every = (data, ...args) => new this(data).every(...args)

    static define(name = this.name) {
        if (globalThis?.tasks) globalThis.tasks.set(name, this);
        return this;
    }

    getData(...data) {
        return Object.assign({}, this.constructor.data, this.data, ...data);
    }

    schedule(method, interval, options = {skipImmediate: true}) {
        const {data: taskData} = this;
        const {
            job: name,
            name: task,
        } = this.constructor;
        const data = {query: {task}, body: taskData};
        const body = {name, interval, options, data};
        return fetchAgenda(method, {method: "POST", body});
    }

    cancel(filter = {data: {body: this.data}}) {
        return console.error("Canceling not yet implemented");
    }

    run() {
        throw new Error(`No run() method in ${this.constructor.name} task`);
    }

    result(result) {
        const {data} = this;
        const {name} = this.constructor;
        console.debug({name, data, result});
        return {ok: true};
    }

}
