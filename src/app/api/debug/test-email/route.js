import { sendWinnerEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetEmail = searchParams.get("email") || "instructoplus@gmail.com";

  try {
    console.log("Sending test winner email to:", targetEmail);
    const info = await sendWinnerEmail(
      targetEmail,
      "Test User",
      1250.50,
      "April 2026"
    );

    return NextResponse.json({ 
      success: true, 
      message: "Test Winner Email sent successfully!",
      info: info.messageId 
    });
  } catch (error) {
    console.error("Email Test Failed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
