import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
const root = resolve(new URL("..", import.meta.url).pathname);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".map": "application/json" };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(`${root}${sep}`)) throw new Error("invalid path");
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    response.setHeader("content-type", types[extname(file)] ?? "application/octet-stream");
    response.end(await readFile(file));
  } catch { response.statusCode = 404; response.end("Not found"); }
}).listen(4173, "127.0.0.1", () => console.log("Vanilla example: http://127.0.0.1:4173/examples/vanilla/"));
