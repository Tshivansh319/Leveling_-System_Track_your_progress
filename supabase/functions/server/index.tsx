import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-aae8dea8/health", (c) => {
  return c.json({ status: "ok" });
});

// Load system data
app.get("/make-server-aae8dea8/load", async (c) => {
  try {
    const userId = c.req.query('userId');
    if (!userId) {
      return c.json({ error: "User ID required" }, 400);
    }
    
    const key = `soloSystem_${userId}`;
    const data = await kv.get(key);
    
    if (data) {
      return c.json({ exists: true, ...data });
    }
    return c.json({ exists: false });
  } catch (error) {
    console.error("Load error:", error);
    return c.json({ error: "Failed to load data" }, 500);
  }
});

// Save system data
app.post("/make-server-aae8dea8/save", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, ...systemData } = body;
    
    if (!userId) {
      return c.json({ error: "User ID required" }, 400);
    }
    
    const key = `soloSystem_${userId}`;
    await kv.set(key, systemData);
    return c.json({ success: true });
  } catch (error) {
    console.error("Save error:", error);
    return c.json({ error: "Failed to save data" }, 500);
  }
});

// Get progress data
app.get("/make-server-aae8dea8/progress", async (c) => {
  try {
    const userId = c.req.query('userId');
    if (!userId) {
      return c.json({ error: "User ID required" }, 400);
    }
    
    const key = `soloSystemProgress_${userId}`;
    const data = await kv.get(key);
    
    return c.json({ progress: data || [] });
  } catch (error) {
    console.error("Load progress error:", error);
    return c.json({ error: "Failed to load progress data" }, 500);
  }
});

// Save progress entry
app.post("/make-server-aae8dea8/progress", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, entry } = body;
    
    if (!userId || !entry) {
      return c.json({ error: "User ID and entry required" }, 400);
    }
    
    const key = `soloSystemProgress_${userId}`;
    const existingData = await kv.get(key) || [];
    
    // Check if entry for today already exists
    const today = entry.date;
    const filteredData = existingData.filter((e: any) => e.date !== today);
    
    // Add new entry
    const updatedData = [...filteredData, entry];
    
    // Keep only last 90 days
    const sorted = updatedData.sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const trimmed = sorted.slice(-90);
    
    await kv.set(key, trimmed);
    return c.json({ success: true });
  } catch (error) {
    console.error("Save progress error:", error);
    return c.json({ error: "Failed to save progress data" }, 500);
  }
});

Deno.serve(app.fetch);