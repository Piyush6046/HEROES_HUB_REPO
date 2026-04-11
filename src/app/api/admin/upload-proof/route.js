import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const winnerId = formData.get("winnerId");
    const file = formData.get("file");

    if (!winnerId || !file) {
      return NextResponse.json({ error: "Missing winnerId or file" }, { status: 400 });
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Unique path
    const timestamp = new Date().getTime();
    const path = `${winnerId}/${timestamp}_${file.name.replace(/\s+/g, '_')}`;

    // 1. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from("proofs")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error("Storage Upload Error:", uploadError);
      return NextResponse.json({ error: "Storage Upload Failed: " + uploadError.message }, { status: 500 });
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from("proofs")
      .getPublicUrl(path);

    // 3. Update Winners Table
    const { data: updatedWinner, error } = await supabaseAdmin
      .from("winners")
      .update({
        proof_url: publicUrl,
        proof_uploaded_at: new Date().toISOString()
      })
      .eq("id", winnerId)
      .select()
      .single();

    if (error) {
      console.error("Database Update Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Proof uploaded successfully",
      proofUrl: publicUrl,
      winner: updatedWinner
    });

  } catch (error) {
    console.error("Proof upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
