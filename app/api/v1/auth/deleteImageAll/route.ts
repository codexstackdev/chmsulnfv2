import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const imageId = params.get("fileId");
  try {
    if (!imageId)
      return NextResponse.json(
        { success: false, message: "Invalid params" },
        { status: 400 },
      );
    const auth = Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString(
      "base64",
    );

    const res = await fetch(`https://api.imagekit.io/v1/files/${imageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { success: false, message: err },
        { status: res.status },
      );
    }
    return NextResponse.json({
      success: true,
      message: "Image Deleted",
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Server Error";
    return NextResponse.json({ success: false, message: err }, { status: 500 });
  }
}
