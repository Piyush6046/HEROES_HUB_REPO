import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import { sendPayoutUpdate } from "@/lib/email";

export async function POST(req) {
  try {
    const { winnerId, status } = await req.json();

    if (!winnerId || !status) {
      return NextResponse.json({ error: "Missing winnerId or status" }, { status: 400 });
    }

    const validStatuses = ["pending", "processing", "paid", "failed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    console.log(`Updating payout status for winner ${winnerId} to: ${status}`);

    const { data: updatedWinner, error } = await supabaseAdmin
      .from("winners")
      .update({
        payout_status: status,
        paid_at: status === "paid" ? new Date().toISOString() : null
      })
      .eq("id", winnerId)
      .select("*, profiles(email, full_name)")
      .single();

    if (error) {
      console.error("Error updating payout status:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send Notification Email
    if (updatedWinner.profiles?.email) {
      try {
        await sendPayoutUpdate(updatedWinner.profiles.email, status);
      } catch (mailErr) {
        console.error("Payout Email Failed:", mailErr);
      }
    }

    console.log("Payout status updated successfully:", updatedWinner);

    return NextResponse.json({
      message: `Payout status updated to ${status}`,
      winner: updatedWinner
    });

  } catch (error) {
    console.error("Update payout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
