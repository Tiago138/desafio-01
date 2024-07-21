import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
    {
        method: "POST",
        path: buildRoutePath("/tasks"),
        handler: (req, res) => {
            const { title, description } = req.body;

            if (!title) {
                return res
                    .writeHead(404)
                    .end("It is necessary to inform a title");
            }

            if (!description) {
                return res
                    .writeHead(404)
                    .end("It is necessary to inform a description");
            }

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            database.insert("tasks", task);

            return res.writeHead(201).end();
        },
    },
    {
        method: "GET",
        path: buildRoutePath("/tasks"),
        handler: (req, res) => {
            const { search } = req.query;

            const tasks = database.select(
                "tasks",
                search
                    ? {
                          title: search,
                          description: search,
                      }
                    : null,
            );

            return res.end(JSON.stringify(tasks));
        },
    },
    {
        method: "PUT",
        path: buildRoutePath("/tasks/:id"),
        handler: (req, res) => {
            const { id } = req.params;
            const { title, description } = req.body;

            if (!title && !description) {
                return res
                    .writeHead(404)
                    .end("It is necessary to inform a title or description");
            }

            const task = database.select("tasks", { id });

            if (!task[0] || task[0].id !== id) {
                return res
                    .writeHead(404)
                    .end(`The task with id ${id} does not exist`);
            }

            database.update("tasks", id, {
                title: title ?? task[0].title,
                description: description ?? task[0].description,
                updated_at: new Date(),
            });

            return res.writeHead(204).end();
        },
    },
    {
        method: "DELETE",
        path: buildRoutePath("/tasks/:id"),
        handler: (req, res) => {
            const { id } = req.params;

            const task = database.select("tasks", { id });

            if (!task[0] || task[0].id !== id) {
                return res
                    .writeHead(404)
                    .end(`The task with id ${id} does not exist`);
            }

            database.delete("tasks", id);

            return res.writeHead(204).end();
        },
    },
    {
        method: "PATCH",
        path: buildRoutePath("/tasks/:id/complete"),
        handler: (req, res) => {
            const { id } = req.params;

            const task = database.select("tasks", { id });

            if (!task[0] || task[0].id !== id) {
                return res
                    .writeHead(404)
                    .end(`The task with id ${id} does not exist`);
            }

            const completed_at = task[0].completed_at ? null : new Date();

            database.update("tasks", id, {
                completed_at,
                updated_at: completed_at ? completed_at : new Date(),
            });

            return res.writeHead(204).end();
        },
    },
];
