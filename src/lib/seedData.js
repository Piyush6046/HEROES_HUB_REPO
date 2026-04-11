// Comprehensive seed data for HeroesHub platform
export const seedCharities = [
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
    name: "Doctors Without Borders",
    description: "Providing medical assistance to people affected by conflict, epidemics, disasters, or exclusion from healthcare.",
    logo_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop&crop=center",
    website_url: "https://www.doctorswithoutborders.org",
    category: "Health",
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
  },
  {
    name: "The Nature Conservancy",
    description: "Conserving the lands and waters on which all life depends. Working to make a tangible difference around the world.",
    logo_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&h=100&fit=crop&crop=center",
    website_url: "https://www.nature.org",
    category: "Environment",
    is_featured: false,
    is_active: true
  },
  {
    name: "American Red Cross",
    description: "Preventing and alleviating human suffering in the face of emergencies by mobilizing the power of volunteers and donors.",
    logo_url: "https://images.unsplash.com/photo-1526547541286-73a1aaa28f80?w=100&h=100&fit=crop&crop=center",
    website_url: "https://www.redcross.org",
    category: "Disaster Relief",
    is_featured: true,
    is_active: true
  }
];

export const seedDraws = [
  {
    month_year: "2024-01",
    winning_numbers: [5, 12, 23, 31, 42],
    draw_type: "standard",
    prize_pool_5match: 1200.00,
    prize_pool_4match: 1050.00,
    prize_pool_3match: 750.00,
    total_pool: 3000.00,
    status: "completed",
    results_published: true,
    published_at: "2024-02-01T10:00:00Z"
  },
  {
    month_year: "2024-02",
    winning_numbers: [8, 15, 19, 27, 36],
    draw_type: "algorithmic",
    prize_pool_5match: 1350.00,
    prize_pool_4match: 1181.25,
    prize_pool_3match: 843.75,
    total_pool: 3375.00,
    status: "completed",
    results_published: true,
    published_at: "2024-03-01T10:00:00Z"
  },
  {
    month_year: "2024-03",
    winning_numbers: [3, 11, 24, 33, 41],
    draw_type: "standard",
    prize_pool_5match: 1480.00,
    prize_pool_4match: 1295.00,
    prize_pool_3match: 925.00,
    total_pool: 3700.00,
    status: "completed",
    results_published: true,
    published_at: "2024-04-01T10:00:00Z"
  }
];

export const sampleScores = [
  { score: 18, course_name: "Pebble Beach Golf Links", date_played: "2024-03-15", notes: "Great round! Personal best." },
  { score: 22, course_name: "Augusta National", date_played: "2024-03-10", notes: "Challenging conditions." },
  { score: 15, course_name: "St Andrews Links", date_played: "2024-03-05", notes: "Perfect weather!" },
  { score: 25, course_name: "Pebble Beach Golf Links", date_played: "2024-02-28", notes: "Windy day." },
  { score: 20, course_name: "Augusta National", date_played: "2024-02-20", notes: "Improving consistency." },
  { score: 12, course_name: "St Andrews Links", date_played: "2024-02-15", notes: "Exceptional round!" },
  { score: 28, course_name: "Pebble Beach Golf Links", date_played: "2024-02-10", notes: "Tough course conditions." },
  { score: 16, course_name: "Augusta National", date_played: "2024-02-05", notes: "Good putting day." },
  { score: 30, course_name: "St Andrews Links", date_played: "2024-01-30", notes: "Learning the greens." },
  { score: 19, course_name: "Pebble Beach Golf Links", date_played: "2024-01-25", notes: "Solid performance." }
];

// Helper function to generate random test data
export const generateTestData = (userCount = 5) => {
  const testUsers = [];
  const testScores = [];
  
  for (let i = 0; i < userCount; i++) {
    const userId = `test-user-${i + 1}`;
    testUsers.push({
      id: userId,
      full_name: `Test User ${i + 1}`,
      email: `testuser${i + 1}@example.com`,
      subscription_status: Math.random() > 0.3 ? 'active' : 'pending',
      subscription_plan: Math.random() > 0.7 ? 'yearly' : 'monthly',
      xp_points: Math.floor(Math.random() * 1500),
      current_rank: calculateRankFromXp(Math.floor(Math.random() * 1500)),
      rounds_played: Math.floor(Math.random() * 20) + 1
    });
    
    // Generate scores for each user
    const scoreCount = Math.floor(Math.random() * 8) + 3; // 3-10 scores per user
    const userScores = [];
    for (let j = 0; j < scoreCount; j++) {
      userScores.push({
        user_id: userId,
        score: Math.floor(Math.random() * 35) + 10, // Scores between 10-45
        course_name: getRandomCourse(),
        date_played: getRandomDate(),
        notes: `Practice round ${j + 1}`
      });
    }
    testScores.push(...userScores);
  }
  
  return { testUsers, testScores };
};

function calculateRankFromXp(xp) {
  if (xp >= 1200) return 'Legend';
  if (xp >= 700) return 'Champion';
  if (xp >= 350) return 'Ace';
  if (xp >= 150) return 'Amateur';
  return 'Rookie';
}

function getRandomCourse() {
  const courses = [
    "Pebble Beach Golf Links",
    "Augusta National",
    "St Andrews Links",
    "Royal Birkdale",
    "Cypress Point Club",
    "Shinnecock Hills",
    "Royal County Down",
    "Pinehurst No. 2"
  ];
  return courses[Math.floor(Math.random() * courses.length)];
}

function getRandomDate() {
  const start = new Date(2024, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}
