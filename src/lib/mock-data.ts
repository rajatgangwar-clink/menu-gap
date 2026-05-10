// Static UI fixtures for things the backend doesn't expose yet.
// All real menu/trending/dish data comes from the API — see src/lib/api.ts.

// Chart time series — the intelligence endpoint returns scalars, not series.
// These shapes are stable so we can swap in real data the moment the backend
// adds a `/performance-history` (or similar) endpoint.
export const placeholderWeeklyOrders = [
  { day: "Mon", orders: 45 },
  { day: "Tue", orders: 52 },
  { day: "Wed", orders: 48 },
  { day: "Thu", orders: 61 },
  { day: "Fri", orders: 55 },
  { day: "Sat", orders: 67 },
  { day: "Sun", orders: 58 },
];

export const placeholderWeeklyOrdersWorst = [
  { day: "Mon", orders: 12 },
  { day: "Tue", orders: 10 },
  { day: "Wed", orders: 8 },
  { day: "Thu", orders: 11 },
  { day: "Fri", orders: 9 },
  { day: "Sat", orders: 14 },
  { day: "Sun", orders: 10 },
];

export const placeholderTrendSeries = [
  { week: "W1", score: 72 },
  { week: "W2", score: 76 },
  { week: "W3", score: 81 },
  { week: "W4", score: 87 },
  { week: "W5", score: 89 },
  { week: "W6", score: 92 },
  { week: "W7", score: 94 },
];

export const placeholderTrendSeriesDeclining = [
  { week: "W1", score: 45 },
  { week: "W2", score: 42 },
  { week: "W3", score: 38 },
  { week: "W4", score: 36 },
  { week: "W5", score: 33 },
  { week: "W6", score: 35 },
  { week: "W7", score: 34 },
];

export const placeholderGlobalSeries = [
  { month: "Jan", score: 65 },
  { month: "Feb", score: 70 },
  { month: "Mar", score: 76 },
  { month: "Apr", score: 82 },
  { month: "May", score: 88 },
];

export const placeholderGlobalSeriesDeclining = [
  { month: "Jan", score: 52 },
  { month: "Feb", score: 48 },
  { month: "Mar", score: 43 },
  { month: "Apr", score: 38 },
  { month: "May", score: 35 },
];

export const placeholderPerformanceFactors: { label: string; score: number; status: "excellent" | "good" | "average" }[] = [
  { label: "Rating", score: 94, status: "excellent" },
  { label: "Order Volume", score: 89, status: "excellent" },
  { label: "Price Positioning", score: 72, status: "good" },
  { label: "Customer Retention", score: 85, status: "excellent" },
  { label: "Profitability", score: 78, status: "good" },
  { label: "Prep Efficiency", score: 81, status: "good" },
];

export const placeholderCompetitors = [
  { name: "Cafe Noir", rating: 4.6, price: 270 },
  { name: "Bean There", rating: 4.5, price: 260 },
  { name: "Morning Brew", rating: 4.4, price: 250 },
];

// FAQ content (no backend endpoint).
export const mockFaqs = [
  {
    question: "How does Menu Gap collect competitor data?",
    answer:
      "We aggregate publicly available data from food delivery platforms, review sites, and social media. We analyze 14 cafes within a 2km radius of your location in HSR Layout. Data is refreshed weekly to ensure accuracy.",
  },
  {
    question: "What does the Menu Gap Score mean?",
    answer:
      "Your Menu Gap Score (0-100) measures how many high-value dishes your competitors serve that you don't. A score of 73 means you're missing about 27% of trending, well-rated items in your area. Higher scores indicate bigger opportunities.",
  },
  {
    question: "How accurate are the pricing recommendations?",
    answer:
      "Pricing recommendations are based on median prices from cafes with similar ratings and locations. We compare your prices to 14 nearby cafes and factor in your rating differential. However, final pricing should consider your ingredient costs, portion sizes, and brand positioning.",
  },
  {
    question: "Can I trust the AI Assistant's recommendations?",
    answer:
      "The AI Assistant uses the same data as the dashboard — competitor menus, ratings, reviews, pricing, and trend analysis. It provides reasoning for every recommendation so you can make informed decisions. However, it doesn't know your exact costs or kitchen constraints, so use it as advisory input, not a directive.",
  },
  {
    question: "What makes a dish 'trending'?",
    answer:
      "We calculate trend scores based on three factors: (1) how many new cafes added it in the last 90 days, (2) review volume growth, and (3) social media mentions. Dishes score 0-1, with anything above 0.4 considered 'trending up' and below 0.25 as 'declining'.",
  },
  {
    question: "How is ingredient overlap calculated?",
    answer:
      "For each suggested global dish, we compare its ingredient list to what you already stock (inferred from your existing menu). Overlap ratio of 0.75 means you have 75% of the ingredients on hand. Missing ingredients are listed so you can plan procurement.",
  },
  {
    question: "How often is the data updated?",
    answer:
      "Competitor menu data, prices, and ratings are updated weekly. Trending scores and social signals are updated daily. Your own menu performance (ratings, review counts) is refreshed every 24 hours.",
  },
  {
    question: "What if I disagree with a recommendation?",
    answer:
      "Menu Gap provides data-driven suggestions, but you know your customers, costs, and brand better than we do. Use recommendations as input, not commands. If you consistently disagree with suggestions, let us know — we can adjust our algorithm's sensitivity to your feedback.",
  },
];
