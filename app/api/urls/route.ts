import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const newer = searchParams.get("newer") === "true";

    const result = newer
      ? await db.execute(`
          SELECT
            id,
            url,
            created_at,
            updated_at
          FROM saved_urls
          ORDER BY updated_at DESC
          LIMIT 1
        `)
      : await db.execute(`
          SELECT
            id,
            url,
            created_at,
            updated_at
          FROM saved_urls
          ORDER BY created_at DESC
        `);

    return NextResponse.json(result.rows, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch URLs" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body.url?.trim();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const result = await db.execute({
      sql: `
        INSERT INTO saved_urls (url)
        VALUES (?)
      `,
      args: [url],
    });

    return NextResponse.json(
      {
        id: Number(result.lastInsertRowid),
        url,
      },
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("SAVE URL ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to save URL",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}