import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "subscribers.json");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ensureDataDir() {
  const dir = path.dirname(SUBSCRIBERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readSubscribers(): { email: string; date: string }[] {
  if (!fs.existsSync(SUBSCRIBERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf8"));
}

function writeSubscribers(subscribers: { email: string; date: string }[]) {
  ensureDataDir();
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email?: string };

  if (!email || !EMAIL_RE.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const subscribers = readSubscribers();
  const exists = subscribers.some((s) => s.email === email);

  if (!exists) {
    subscribers.push({ email, date: new Date().toISOString() });
    writeSubscribers(subscribers);
  }

  return new Response(
    JSON.stringify({ ok: true, alreadySubscribed: exists }),
    { headers: { "Content-Type": "application/json" } }
  );
}
