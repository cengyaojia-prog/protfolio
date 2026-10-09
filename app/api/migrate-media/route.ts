import { env } from "cloudflare:workers";
import { handleMediaMigration } from "@/lib/media-migration";
export const dynamic = "force-dynamic";
export async function GET(request: Request) { return handleMediaMigration(request, env as unknown as Parameters<typeof handleMediaMigration>[1]); }
export async function POST(request: Request) { return handleMediaMigration(request, env as unknown as Parameters<typeof handleMediaMigration>[1]); }
