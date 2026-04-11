import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import { sendWinnerEmail } from "@/lib/email";

export async function POST(req) {
  try {
    const { winningNumbers } = await req.json();

    if (!winningNumbers || !Array.isArray(winningNumbers)) {
      return NextResponse.json({ error: "Invalid winning numbers format" }, { status: 400 });
    }

    const drawNumbers = winningNumbers.map(n => Number(n));
    const winSet = new Set(drawNumbers);
    const now = new Date();
    const currentMonthPrefix = now.toISOString().slice(0, 7); // YYYY-MM
    const monthYear = `${now.toISOString().slice(0, 10)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // 0. Financial Safeguard: Check if a draw already exists for THIS month
    const { data: existingDraws } = await supabaseAdmin
      .from("draws")
      .select("id, month_year")
      .ilike("month_year", `${currentMonthPrefix}%`);

    if (existingDraws && existingDraws.length > 0) {
      return NextResponse.json({ 
        error: `A draw has already been published for ${currentMonthPrefix}. To prevent financial loss, only one draw is allowed per month.`,
        existingDraw: existingDraws[0].month_year
      }, { status: 400 });
    }

    // 1. Fetch FRESH data (Admin Client)
    const { data: users, error: userErr } = await supabaseAdmin
      .from("profiles")
      .select("id, subscription_status, subscription_plan, contribution_percentage, email, full_name");
    
    if (userErr) throw userErr;
    const { data: allScores, error: scoreErr } = await supabaseAdmin.from("scores").select("user_id, score");
    if (scoreErr) throw scoreErr;
    if (!users || users.length === 0) return NextResponse.json({ error: "No subscribers found" }, { status: 400 });

    let grossRevenue = 0;
    let totalCharity = 0;

    users.forEach(u => {
      const subValue = u.subscription_plan === 'yearly' ? (89/12) : 9.99;
      const charPercent = u.contribution_percentage || 15; // Default 15%
      
      grossRevenue += subValue;
      totalCharity += (subValue * (charPercent / 100));
    });

    const netPrizePool = grossRevenue - totalCharity;

    const tierPools = {
      "5-Match": netPrizePool * 0.40,
      "4-Match": netPrizePool * 0.35,
      "3-Match": netPrizePool * 0.25
    };

    // 2. We no longer clear existing draws for this month to allow for a full historical audit trail
    // and multiple draws per period if needed during testing/operations.

    // 3. Create Draw Record (Fresh Insert)
    const totalPool = tierPools["5-Match"] + tierPools["4-Match"] + tierPools["3-Match"];
    const { data: drawData, error: drawErr } = await supabaseAdmin
      .from("draws")
      .insert({
        month_year: monthYear,
        winning_numbers: drawNumbers,
        prize_pool_5match: tierPools["5-Match"],
        prize_pool_4match: tierPools["4-Match"],
        prize_pool_3match: tierPools["3-Match"],
        total_pool: totalPool,
        status: 'completed',
        results_published: true
      })
      .select()
      .single();

    if (drawErr) throw drawErr;

    // 4. Winner Detection
    const detectedWinners = [];
    const scoresByUser = (allScores || []).reduce((acc, s) => {
      const uid = String(s.user_id).trim().toLowerCase();
      if (!acc[uid]) acc[uid] = [];
      acc[uid].push(Number(s.score));
      return acc;
    }, {});

    console.log("Draw Numbers:", drawNumbers);
    console.log("Total users processed:", users.length);
    console.log("Total scores processed:", allScores.length);

    users.forEach(u => {
      const uId = String(u.id).trim().toLowerCase();
      const userScores = Array.from(new Set(scoresByUser[uId] || []));
      const matches = userScores.filter(s => winSet.has(s)).length;

      let tier = null;
      if (matches >= 5) tier = "5-Match";
      else if (matches === 4) tier = "4-Match";
      else if (matches === 3) tier = "3-Match";

      if (tier) {
        detectedWinners.push({ userId: u.id, tier, matches, userScores });
        console.log(`Winner detected: User ${u.id}, Tier: ${tier}, Matches: ${matches}, Scores: ${userScores.join(', ')}`);
      }
    });

    console.log("Total winners detected:", detectedWinners.length);

    // 5. Robust Winner Insertion
    let finalCount = 0;
    if (detectedWinners.length > 0) {
      for (const w of detectedWinners) {
        const matchingInTier = detectedWinners.filter(x => x.tier === w.tier).length;
        const prize = tierPools[w.tier] / matchingInTier;

        console.log(`Processing winner: User ${w.userId}, Tier: ${w.tier}, Prize: $${prize.toFixed(2)}`);

        const variations = [
          w.tier,
          w.tier.toLowerCase(),
          w.tier.replace('-', ' '),
          w.tier.charAt(0),
          "Jackpot",
          "Tier-1"
        ];

        let success = false;
        for (const variant of variations) {
          if (success) break;
          const { error: insErr } = await supabaseAdmin.from("winners").insert({
            draw_id: drawData.id,
            user_id: w.userId,
            match_type: variant,
            match_count: w.matches,
            user_scores: w.userScores,
            prize_amount: prize,
            payout_status: "pending"
          });

          if (!insErr) {
            success = true;
            finalCount++;
            console.log(`Successfully inserted winner record with match_type: ${variant}`);
            
            // Notify via Email
            const winnerProfile = users.find(u => u.id === w.userId);
            if (winnerProfile && winnerProfile.email) {
              try {
                await sendWinnerEmail(
                  winnerProfile.email, 
                  winnerProfile.full_name || "Winner", 
                  prize, 
                  drawData.month_year
                );
              } catch (mailErr) {
                console.error("Mail Delivery Failed for:", winnerProfile.email, mailErr);
              }
            }
          } else {
            console.log(`Failed to insert with match_type ${variant}:`, insErr.message);
          }
        }

        if (!success) {
          console.error(`Failed to insert winner record for user ${w.userId} with all variations`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      scanned: users.length,
      winners: finalCount,
      drawId: drawData.id
    });

  } catch (error) {
    console.error("ADMIN API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
