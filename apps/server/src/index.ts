import app from "./app";

const PORT = process.env.PORT || 3000;

Bun.serve({
  port: PORT,
  fetch: app.fetch
})

console.log(`Server running on port ${PORT}`)
