// A shared in-memory store. Both server.js and inngest/functions.js
// import this same module, so they operate on the same Map instance
// for the life of the process (Node caches module instances).
export const reports = new Map();