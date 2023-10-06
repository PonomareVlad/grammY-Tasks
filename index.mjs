import {jsonResponse} from "vercel-grammy";

export default globalThis.tasks = new Map();

export * from "./tasks/base.mjs"
export * from "./tasks/bot.mjs"
export * from "./tasks/user.mjs"
export * from "./tasks/broadcast.mjs"

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

export const resultHandler = (...args) => async request => {
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
