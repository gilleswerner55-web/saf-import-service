import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

function getSession(request: NextRequest) {
  const cookie = request.cookies.get("admin-session")?.value;
  if (!cookie) return null;

  try {
    return JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

function withCors(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS");
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  const session = getSession(request);
  // TEMPORÄR für lokalen Test deaktiviert
  // if (!session) {
  //   return withCors(
  //     NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  //   );
  // }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawType = formData.get("type");
    const id = formData.get("id") as string | null;

    if (!file) {
      return withCors(
        NextResponse.json({ error: "No file provided" }, { status: 400 })
      );
    }

    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    // Falls kein type mitgeschickt wurde, automatisch sinnvoll ableiten
    const type =
      typeof rawType === "string" && rawType.trim().length > 0
        ? rawType
        : isPdf
          ? "tournament-pdf"
          : "member";

    console.log("Upload request:", {
      type,
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name,
    });

    if (type === "tournament-pdf") {
      if (!isPdf) {
        return withCors(
          NextResponse.json(
            { error: `File must be a PDF (got: ${file.type})` },
            { status: 400 }
          )
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        return withCors(
          NextResponse.json(
            {
              error: `File too large: ${(file.size / 1024 / 1024).toFixed(
                1
              )}MB (max 10MB)`,
            },
            { status: 400 }
          )
        );
      }
    } else {
      if (!isImage) {
        return withCors(
          NextResponse.json(
            { error: `File must be an image (got: ${file.type})` },
            { status: 400 }
          )
        );
      }

      if (file.size > 2 * 1024 * 1024) {
        return withCors(
          NextResponse.json(
            {
              error: `File too large: ${(file.size / 1024 / 1024).toFixed(
                1
              )}MB (max 2MB)`,
            },
            { status: 400 }
          )
        );
      }
    }

    const ext = file.name.split(".").pop() || (isPdf ? "pdf" : "jpg");
    let filename: string;

    switch (type) {
      case "tournament-pdf":
        filename = id
          ? `tournaments/${id}/results.pdf`
          : `tournaments/${Date.now()}-results.pdf`;
        break;

      case "tournament-logo":
        filename = id
          ? `tournaments/${id}/logo.${ext}`
          : `tournaments/${Date.now()}-logo.${ext}`;
        break;

      case "tournament-poster":
        filename = id
          ? `tournaments/${id}/poster.${ext}`
          : `tournaments/${Date.now()}-poster.${ext}`;
        break;

      case "member":
      default:
        filename = id
          ? `members/${id}.${ext}`
          : `members/${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}.${ext}`;
    }

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return withCors(
      NextResponse.json({
        url: blob.url,
        pathname: blob.pathname,
      })
    );
  } catch (error) {
    console.error("Upload failed:", error);
    return withCors(
      NextResponse.json({ error: "Upload failed" }, { status: 500 })
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = getSession(request);
  // TEMPORÄR für lokalen Test deaktiviert
  // if (!session) {
  //   return withCors(
  //     NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  //   );
  // }

  try {
    const { url } = await request.json();

    if (!url) {
      return withCors(
        NextResponse.json({ error: "No URL provided" }, { status: 400 })
      );
    }

    await del(url);

    return withCors(NextResponse.json({ success: true }));
  } catch (error) {
    console.error("Delete failed:", error);
    return withCors(
      NextResponse.json({ error: "Delete failed" }, { status: 500 })
    );
  }
}