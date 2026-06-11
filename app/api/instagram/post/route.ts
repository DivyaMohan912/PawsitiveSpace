import { NextRequest, NextResponse } from "next/server";
import { publishToInstagram } from "@/lib/instagram";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, caption, shareType = "post" } = await req.json();

    if (!imageUrl || !caption) {
      return NextResponse.json(
        { error: "imageUrl and caption are required" },
        { status: 400 }
      );
    }

    // Test mode — simulate success when credentials aren't set
    const isTestMode = !process.env.INSTAGRAM_USER_ID ||
                       !process.env.INSTAGRAM_ACCESS_TOKEN ||
                       process.env.INSTAGRAM_USER_ID === "your_instagram_user_id";

    if (isTestMode) {
      console.log(`📸 [TEST MODE] Instagram ${shareType} simulated:`);
      console.log("Image URL:", imageUrl);
      console.log("Caption:", caption.slice(0, 100) + "...");
      return NextResponse.json({
        success: true,
        testMode: true,
        shareType,
        message: `${shareType} simulated (test mode)`,
      });
    }

    const result = await publishToInstagram(imageUrl, caption, shareType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Instagram publish failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      postId: result.postId,
      shareType,
    });
  } catch (err: any) {
    console.error("[Instagram API Error]", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
