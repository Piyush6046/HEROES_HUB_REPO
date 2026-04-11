import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

// Simple UUID generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(req) {
  try {
    console.log("Starting database seeding...");

    const results = {};

    // 1. Seed Charities
    console.log("Seeding charities...");
    const charities = [
      {
        name: "Ocean Conservancy",
        description: "Working to protect the ocean from today's greatest global challenges. Creates science-based solutions for a healthy ocean and the wildlife and communities that depend on it.",
        logo_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop&crop=center",
        website_url: "https://oceanconservancy.org",
        category: "Environment",
        is_featured: true,
        is_active: true
      },
      {
        name: "St. Jude Children's Research Hospital",
        description: "Leading the way the world understands, treats and defeats childhood cancer and other life-threatening diseases.",
        logo_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1a?w=100&h=100&fit=crop&crop=center",
        website_url: "https://www.stjude.org",
        category: "Health",
        is_featured: true,
        is_active: true
      },
      {
        name: "World Wildlife Fund",
        description: "WWF's mission is to conserve nature and reduce the most pressing threats to the diversity of life on Earth.",
        logo_url: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=100&h=100&fit=crop&crop=center",
        website_url: "https://www.worldwildlife.org",
        category: "Environment",
        is_featured: false,
        is_active: true
      },
      {
        name: "UNICEF",
        description: "Working in over 190 countries and territories to save children's lives, to defend their rights, and to help them fulfill their potential.",
        logo_url: "https://images.unsplash.com/photo-1509099833638-3796e69df410?w=100&h=100&fit=crop&crop=center",
        website_url: "https://www.unicef.org",
        category: "Children",
        is_featured: true,
        is_active: true
      },
      {
        name: "Habitat for Humanity",
        description: "Building strength, stability, and self-reliance through shelter. Helping families find decent, affordable housing.",
        logo_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=100&fit=crop&crop=center",
        website_url: "https://www.habitat.org",
        category: "Housing",
        is_featured: false,
        is_active: true
      }
    ];

    const { data: charitiesData, error: charitiesError } = await supabaseAdmin
      .from("charities")
      .insert(charities)
      .select();

    if (charitiesError) {
      console.error("Error seeding charities:", charitiesError);
      results.charities = { error: charitiesError.message };
    } else {
      console.log(`Seeded ${charitiesData?.length || 0} charities`);
      results.charities = { success: true, count: charitiesData?.length || 0 };
    }

    // 2. Generate test users with real UUIDs
    console.log("Generating test users...");
    const testUsers = [
      {
        id: generateUUID(),
        full_name: "John Smith",
        email: "john.smith@example.com",
        subscription_status: "active",
        subscription_plan: "monthly",
        xp_points: 450,
        current_rank: "Ace",
        rounds_played: 12,
        role: "user"
      },
      {
        id: generateUUID(),
        full_name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        subscription_status: "active",
        subscription_plan: "yearly",
        xp_points: 850,
        current_rank: "Champion",
        rounds_played: 25,
        role: "user"
      },
      {
        id: generateUUID(),
        full_name: "Mike Davis",
        email: "mike.davis@example.com",
        subscription_status: "active",
        subscription_plan: "monthly",
        xp_points: 150,
        current_rank: "Amateur",
        rounds_played: 5,
        role: "user"
      },
      {
        id: generateUUID(),
        full_name: "Emily Wilson",
        email: "emily.wilson@example.com",
        subscription_status: "pending",
        subscription_plan: "monthly",
        xp_points: 0,
        current_rank: "Rookie",
        rounds_played: 0,
        role: "user"
      },
      {
        id: generateUUID(),
        full_name: "Admin User",
        email: "admin@example.com",
        subscription_status: "active",
        subscription_plan: "yearly",
        xp_points: 1500,
        current_rank: "Legend",
        rounds_played: 50,
        role: "admin"
      }
    ];

    // Assign charities to users
    const usersWithCharities = testUsers.map((user, index) => ({
      ...user,
      charity_id: charitiesData?.[index % charitiesData.length]?.id || null,
      contribution_percentage: 15 + (index * 5) // 15%, 20%, 25%, 30%, 35%
    }));

    const { data: usersData, error: usersError } = await supabaseAdmin
      .from("profiles")
      .insert(usersWithCharities)
      .select();

    if (usersError) {
      console.error("Error seeding users:", usersError);
      results.users = { error: usersError.message };
    } else {
      console.log(`Seeded ${usersData?.length || 0} users`);
      results.users = { success: true, count: usersData?.length || 0 };
    }

    // 3. Seed scores
    console.log("Seeding scores...");
    const testScores = [
      // John Smith's scores
      { user_id: testUsers[0].id, score: 18, course_name: "Pebble Beach Golf Links", date_played: "2024-03-15", notes: "Great round! Personal best." },
      { user_id: testUsers[0].id, score: 22, course_name: "Augusta National", date_played: "2024-03-10", notes: "Challenging conditions." },
      { user_id: testUsers[0].id, score: 15, course_name: "St Andrews Links", date_played: "2024-03-05", notes: "Perfect weather!" },
      { user_id: testUsers[0].id, score: 25, course_name: "Pebble Beach Golf Links", date_played: "2024-02-28", notes: "Windy day." },
      { user_id: testUsers[0].id, score: 20, course_name: "Augusta National", date_played: "2024-02-20", notes: "Improving consistency." },

      // Sarah Johnson's scores
      { user_id: testUsers[1].id, score: 12, course_name: "St Andrews Links", date_played: "2024-03-12", notes: "Exceptional round!" },
      { user_id: testUsers[1].id, score: 28, course_name: "Pebble Beach Golf Links", date_played: "2024-03-08", notes: "Tough course conditions." },
      { user_id: testUsers[1].id, score: 16, course_name: "Augusta National", date_played: "2024-03-01", notes: "Good putting day." },
      { user_id: testUsers[1].id, score: 30, course_name: "St Andrews Links", date_played: "2024-02-25", notes: "Learning the greens." },
      { user_id: testUsers[1].id, score: 19, course_name: "Pebble Beach Golf Links", date_played: "2024-02-18", notes: "Solid performance." },

      // Mike Davis's scores
      { user_id: testUsers[2].id, score: 35, course_name: "Augusta National", date_played: "2024-03-20", notes: "Struggled with the greens." },
      { user_id: testUsers[2].id, score: 27, course_name: "Pebble Beach Golf Links", date_played: "2024-03-15", notes: "Better performance." },
      { user_id: testUsers[2].id, score: 33, course_name: "St Andrews Links", date_played: "2024-03-10", notes: "Challenging round." },
      { user_id: testUsers[2].id, score: 29, course_name: "Augusta National", date_played: "2024-03-05", notes: "Making progress." },
      { user_id: testUsers[2].id, score: 24, course_name: "Pebble Beach Golf Links", date_played: "2024-02-28", notes: "Consistent improvement." }
    ];

    const { data: scoresData, error: scoresError } = await supabaseAdmin
      .from("scores")
      .insert(testScores)
      .select();

    if (scoresError) {
      console.error("Error seeding scores:", scoresError);
      results.scores = { error: scoresError.message };
    } else {
      console.log(`Seeded ${scoresData?.length || 0} scores`);
      results.scores = { success: true, count: scoresData?.length || 0 };
    }

    // 4. Generate winners for completed draws
    if (usersData && usersData.length > 0) {
      console.log("Generating winners...");
      const winnersGenerated = await generateWinners(usersData);

      if (winnersGenerated.error) {
        results.winners = { error: winnersGenerated.error };
      } else {
        results.winners = { success: true, count: winnersGenerated.count };
      }
    }

    return NextResponse.json({
      message: "Database seeding completed successfully",
      results
    });

  } catch (error) {
    console.error("Database seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generateWinners(users) {
  try {
    // Get existing draws
    const { data: draws } = await supabaseAdmin
      .from("draws")
      .select("*")
      .eq("status", "completed");

    if (!draws || draws.length === 0) {
      return { count: 0 };
    }

    const winners = [];

    for (const draw of draws) {
      // Get scores for users
      const { data: userScores } = await supabaseAdmin
        .from("scores")
        .select("user_id, score")
        .in("user_id", users.map(u => u.id));

      // Group scores by user
      const scoresByUser = {};
      userScores?.forEach(score => {
        if (!scoresByUser[score.user_id]) {
          scoresByUser[score.user_id] = [];
        }
        scoresByUser[score.user_id].push(score.score);
      });

      // Check each user for matches
      const winSet = new Set(draw.winning_numbers);

      for (const user of users) {
        const userScoreList = scoresByUser[user.id] || [];
        const uniqueScores = [...new Set(userScoreList)];
        const matches = uniqueScores.filter(score => winSet.has(score)).length;

        if (matches >= 3) {
          const matchType = `${matches}-Match`;
          let prizeAmount = 0;

          if (matches === 5) prizeAmount = draw.prize_pool_5match;
          else if (matches === 4) prizeAmount = draw.prize_pool_4match;
          else if (matches === 3) prizeAmount = draw.prize_pool_3match;

          winners.push({
            draw_id: draw.id,
            user_id: user.id,
            match_type: matchType,
            match_count: matches,
            user_scores: uniqueScores,
            prize_amount: prizeAmount,
            payout_status: "pending"
          });
        }
      }
    }

    // Insert winners
    if (winners.length > 0) {
      const { data: insertedWinners } = await supabaseAdmin
        .from("winners")
        .insert(winners)
        .select();

      return { count: insertedWinners?.length || 0 };
    }

    return { count: 0 };

  } catch (error) {
    console.error("Error generating winners:", error);
    return { error: error.message };
  }
}
