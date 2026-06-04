export interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  billingCycle: "monthly" | "annual" | "weekly";
  nextRenewal: string; // ISO date string
  color: string;
  emoji: string;
  source: "email" | "bank" | "manual";
  account: string;
  status: "active" | "cancelled" | "paused" | "trial";
  usageScore: number; // 0-100
  description: string;
  website: string;
  startedDate: string;
}

export const SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    category: "Entertainment",
    amount: 15.99,
    billingCycle: "monthly",
    nextRenewal: "2026-06-04",
    color: "#E50914",
    emoji: "🎬",
    source: "bank",
    account: "Chase Checking ••4821",
    status: "active",
    usageScore: 82,
    description: "Standard HD plan, 2 screens",
    website: "netflix.com",
    startedDate: "2022-03-15",
  },
  {
    id: "2",
    name: "Spotify",
    category: "Music",
    amount: 10.99,
    billingCycle: "monthly",
    nextRenewal: "2026-06-07",
    color: "#1DB954",
    emoji: "🎵",
    source: "email",
    account: "john@gmail.com",
    status: "active",
    usageScore: 95,
    description: "Premium individual plan",
    website: "spotify.com",
    startedDate: "2021-08-01",
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    category: "Productivity",
    amount: 54.99,
    billingCycle: "monthly",
    nextRenewal: "2026-06-12",
    color: "#FF0000",
    emoji: "🎨",
    source: "bank",
    account: "Chase Checking ••4821",
    status: "active",
    usageScore: 34,
    description: "All Apps plan",
    website: "adobe.com",
    startedDate: "2023-01-20",
  },
  {
    id: "4",
    name: "GitHub Copilot",
    category: "Developer Tools",
    amount: 10.0,
    billingCycle: "monthly",
    nextRenewal: "2026-06-15",
    color: "#7C3AED",
    emoji: "🤖",
    source: "email",
    account: "john@gmail.com",
    status: "active",
    usageScore: 91,
    description: "Individual AI coding assistant",
    website: "github.com",
    startedDate: "2024-02-10",
  },
  {
    id: "5",
    name: "iCloud+",
    category: "Storage",
    amount: 2.99,
    billingCycle: "monthly",
    nextRenewal: "2026-06-03",
    color: "#3693F3",
    emoji: "☁️",
    source: "bank",
    account: "Apple Card ••7743",
    status: "active",
    usageScore: 78,
    description: "50GB storage plan",
    website: "apple.com",
    startedDate: "2020-11-05",
  },
  {
    id: "6",
    name: "ChatGPT Plus",
    category: "AI Tools",
    amount: 20.0,
    billingCycle: "monthly",
    nextRenewal: "2026-06-18",
    color: "#10A37F",
    emoji: "💬",
    source: "bank",
    account: "Chase Checking ••4821",
    status: "active",
    usageScore: 88,
    description: "GPT-4o access + advanced features",
    website: "openai.com",
    startedDate: "2023-06-01",
  },
  {
    id: "7",
    name: "Notion",
    category: "Productivity",
    amount: 96.0,
    billingCycle: "annual",
    nextRenewal: "2026-08-22",
    color: "#000000",
    emoji: "📝",
    source: "email",
    account: "work@company.com",
    status: "active",
    usageScore: 65,
    description: "Plus plan — annual",
    website: "notion.so",
    startedDate: "2022-08-22",
  },
  {
    id: "8",
    name: "Figma Professional",
    category: "Design",
    amount: 12.0,
    billingCycle: "monthly",
    nextRenewal: "2026-06-25",
    color: "#A259FF",
    emoji: "✏️",
    source: "email",
    account: "work@company.com",
    status: "active",
    usageScore: 99,
    description: "Professional plan per editor",
    website: "figma.com",
    startedDate: "2021-05-14",
  },
  {
    id: "9",
    name: "1Password",
    category: "Security",
    amount: 35.88,
    billingCycle: "annual",
    nextRenewal: "2026-11-10",
    color: "#0A8DCC",
    emoji: "🔐",
    source: "manual",
    account: "Added manually",
    status: "active",
    usageScore: 100,
    description: "Individual plan — annual",
    website: "1password.com",
    startedDate: "2020-11-10",
  },
  {
    id: "10",
    name: "Duolingo Super",
    category: "Education",
    amount: 6.99,
    billingCycle: "monthly",
    nextRenewal: "2026-06-20",
    color: "#58CC02",
    emoji: "🦉",
    source: "email",
    account: "john@gmail.com",
    status: "paused",
    usageScore: 12,
    description: "Super plan — ad-free + offline",
    website: "duolingo.com",
    startedDate: "2024-01-05",
  },
  {
    id: "11",
    name: "HBO Max",
    category: "Entertainment",
    amount: 15.99,
    billingCycle: "monthly",
    nextRenewal: "2026-03-20",
    color: "#7B2CBF",
    emoji: "🎭",
    source: "bank",
    account: "Chase Checking ••4821",
    status: "cancelled",
    usageScore: 22,
    description: "Standard plan",
    website: "max.com",
    startedDate: "2023-05-20",
  },
  {
    id: "12",
    name: "Dropbox Plus",
    category: "Storage",
    amount: 11.99,
    billingCycle: "monthly",
    nextRenewal: "2026-01-15",
    color: "#0061FF",
    emoji: "📦",
    source: "email",
    account: "john@gmail.com",
    status: "cancelled",
    usageScore: 8,
    description: "2 TB storage",
    website: "dropbox.com",
    startedDate: "2022-04-15",
  },
  {
    id: "13",
    name: "Headspace",
    category: "Education",
    amount: 69.99,
    billingCycle: "annual",
    nextRenewal: "2025-12-01",
    color: "#F47D31",
    emoji: "🧘",
    source: "email",
    account: "john@gmail.com",
    status: "cancelled",
    usageScore: 15,
    description: "Annual plan",
    website: "headspace.com",
    startedDate: "2024-12-01",
  },
  {
    id: "14",
    name: "Notion AI",
    category: "AI Tools",
    amount: 10.0,
    billingCycle: "monthly",
    nextRenewal: "2026-06-07",
    color: "#000000",
    emoji: "🧠",
    source: "email",
    account: "john@gmail.com",
    status: "trial",
    usageScore: 60,
    description: "14-day free trial",
    website: "notion.so",
    startedDate: "2026-05-24",
  },
];

export const LINKED_ACCOUNTS = [
  { id: "1", type: "email", name: "john@gmail.com", icon: "📧", count: 4 },
  { id: "2", type: "email", name: "work@company.com", icon: "💼", count: 2 },
  { id: "3", type: "bank", name: "Chase ••4821", icon: "🏦", count: 3 },
  { id: "4", type: "bank", name: "Apple Card ••7743", icon: "💳", count: 2 },
];

export const AI_INSIGHTS = [
  {
    id: "1",
    type: "warning",
    title: "Potentially unused subscription",
    body: "Adobe Creative Cloud costs $54.99/mo but your usage score is only 34%. Consider downgrading to a lower tier or pausing the plan — that's $660/year.",
    savings: 659.88,
    subscriptionId: "3",
  },
  {
    id: "2",
    type: "info",
    title: "Duplicate streaming coverage",
    body: "You pay for Netflix and have access to Apple TV+ through your Apple Card. Both overlap significantly in original content.",
    savings: 191.88,
    subscriptionId: "1",
  },
  {
    id: "3",
    type: "success",
    title: "Smart spending detected",
    body: "GitHub Copilot and ChatGPT Plus together replace ~3 hours/week of manual work, making them highly cost-efficient tools.",
    savings: 0,
    subscriptionId: undefined as string | undefined,
  },
  {
    id: "4",
    type: "warning",
    title: "Duolingo on pause",
    body: "Duolingo Super has been paused but still charges $6.99/mo. Cancel it or resume your streak to get value from it.",
    savings: 83.88,
    subscriptionId: "10",
  },
];

export const ALERTS = [
  {
    id: "1",
    subscriptionId: "5",
    name: "iCloud+",
    emoji: "☁️",
    amount: 2.99,
    daysUntil: 3,
    date: "Jun 3",
    urgency: "high",
  },
  {
    id: "2",
    subscriptionId: "1",
    name: "Netflix",
    emoji: "🎬",
    amount: 15.99,
    daysUntil: 4,
    date: "Jun 4",
    urgency: "high",
  },
  {
    id: "3",
    subscriptionId: "2",
    name: "Spotify",
    emoji: "🎵",
    amount: 10.99,
    daysUntil: 7,
    date: "Jun 7",
    urgency: "medium",
  },
  {
    id: "4",
    subscriptionId: "4",
    name: "GitHub Copilot",
    emoji: "🤖",
    amount: 10.0,
    daysUntil: 15,
    date: "Jun 15",
    urgency: "low",
  },
];

export const MONTHLY_SPEND_TREND = [
  { month: "Jul", amount: 102 },
  { month: "Aug", amount: 108 },
  { month: "Sep", amount: 108 },
  { month: "Oct", amount: 115 },
  { month: "Nov", amount: 122 },
  { month: "Dec", amount: 130 },
  { month: "Jan", amount: 118 },
  { month: "Feb", amount: 134 },
  { month: "Mar", amount: 134 },
  { month: "Apr", amount: 148 },
  { month: "May", amount: 141 },
  { month: "Jun", amount: 133 },
];

export const CATEGORY_BREAKDOWN = [
  { category: "Productivity", amount: 66.99, color: "#5B8DEF" },
  { category: "AI Tools", amount: 30.0, color: "#4FFFB0" },
  { category: "Entertainment", amount: 15.99, color: "#FF7B4F" },
  { category: "Design", amount: 12.0, color: "#C97BFF" },
  { category: "Music", amount: 10.99, color: "#FFD166" },
  { category: "Other", amount: 19.97, color: "#6B728E" },
];

export interface DetectedSubscription {
  id: string;
  name: string;
  emoji: string;
  category: string;
  amount: number;
  billingCycle: "monthly" | "annual";
  confidence: number;
  alreadyTracked: boolean;
  source: string;
  lastCharge: string;
}

export const DETECTED_SUBSCRIPTIONS: DetectedSubscription[] = [
  { id: "d1", name: "Disney+", emoji: "🏰", category: "Entertainment", amount: 13.99, billingCycle: "monthly", confidence: 96, alreadyTracked: false, source: "Gmail", lastCharge: "2026-05-22" },
  { id: "d2", name: "The New York Times", emoji: "📰", category: "News", amount: 17.00, billingCycle: "monthly", confidence: 94, alreadyTracked: false, source: "Gmail", lastCharge: "2026-05-18" },
  { id: "d3", name: "Audible", emoji: "🎧", category: "Entertainment", amount: 14.95, billingCycle: "monthly", confidence: 91, alreadyTracked: false, source: "Gmail", lastCharge: "2026-05-15" },
  { id: "d4", name: "Calm", emoji: "🌙", category: "Wellness", amount: 69.99, billingCycle: "annual", confidence: 88, alreadyTracked: false, source: "Gmail", lastCharge: "2026-04-02" },
  { id: "d5", name: "Netflix", emoji: "🎬", category: "Entertainment", amount: 15.99, billingCycle: "monthly", confidence: 99, alreadyTracked: true, source: "Gmail", lastCharge: "2026-05-04" },
  { id: "d6", name: "Patreon — Lex Fridman", emoji: "💭", category: "Creators", amount: 5.00, billingCycle: "monthly", confidence: 72, alreadyTracked: false, source: "Gmail", lastCharge: "2026-05-10" },
  { id: "d7", name: "Linode", emoji: "🖥️", category: "Developer Tools", amount: 12.00, billingCycle: "monthly", confidence: 58, alreadyTracked: false, source: "Gmail", lastCharge: "2026-05-08" },
  { id: "d8", name: "Medium", emoji: "📖", category: "News", amount: 50.00, billingCycle: "annual", confidence: 49, alreadyTracked: false, source: "Gmail", lastCharge: "2025-11-19" },
];

export const totalMonthly = (subs: Subscription[]) =>
  subs
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      if (s.billingCycle === "monthly") return sum + s.amount;
      if (s.billingCycle === "annual") return sum + s.amount / 12;
      if (s.billingCycle === "weekly") return sum + s.amount * 4.33;
      return sum;
    }, 0);
