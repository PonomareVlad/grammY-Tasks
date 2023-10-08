import {jsonResponse} from "vercel-grammy";
import {createAgendaJob} from "agenda-rest-client";

export {tasks} from "./tasks.mjs";

export * from "./tasks/base.mjs"
export * from "./tasks/bot.mjs"
export * from "./tasks/user.mjs"
export * from "./tasks/broadcast.mjs"

export const {
    TASK_JOB_NAME = "task",
} = process.env;

const parseQuery = (
    {url} = {}
) => Object.fromEntries(
    new URL(url).searchParams.entries()
);

export const runHandler = (...args) => async request => {
    const {task} = parseQuery(request);
    const data = await request.json();
    if (!globalThis.tasks.has(task)) return jsonResponse({error: "Task not found"}, {status: 404});
    const targetTask = new (globalThis.tasks.get(task))(data);
    const result = await targetTask.run(...args).catch(error => console.error(error) || error);
    return jsonResponse(result, {space: 2});
}

export const callbackHandler = (...args) => async request => {
    const {
        data: {
            query: {
                task
            } = {},
            body: data = {},
        } = {},
        response,
    } = await request.json();
    if (!globalThis.tasks.has(task)) return jsonResponse({error: "Task not found"}, {status: 404});
    const targetTask = new (globalThis.tasks.get(task))(data);
    const result = await targetTask.result(response, ...args);
    return jsonResponse(result, {space: 2});
}

export const intiJob = (...args) => createAgendaJob(TASK_JOB_NAME, ...args);
