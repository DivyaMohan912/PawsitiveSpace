import { NextRequest, NextResponse } from "next/server";
import { publishToInstagram } from "@/lib/instagram";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, caption } = await req.json();

    if (!imageUrl || !caption) {
      return NextResponse.json(
        { error: "imageUrl and caption are required" },
        { status: 400 }
      );
    }

    const result = await publishToInstagram(imageUrl, caption);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Instagram publish failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      postId: result.postId,
    });
  } catch (err: any) {
    console.error("[Instagram API Error]", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
