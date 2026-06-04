const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const headers = {
  "Content-Type": "application/json",
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

export interface Response {
  id: string;
  created_at: string;
  variant: string;
  participant_name: string | null;
  age_range: string | null;
  profession: string | null;
  task_started_at: string | null;
  task_completed_at: string | null;
  survey_completed_at: string | null;
  q1: string | null;   // Learnability choice
  q2: string | null;   // Navigation clarity text
  q3: string | null;   // First impression text
  q4: string | null;   // Feature discoverability ("No" | description text)
  q5: string | null;   // Unmet expectations text
  q6: string | null;   // Desired features text
  q7: string | null;   // Usage intent choice
  q8: string | null;   // unused (old schema)
  q9: string | null;   // unused (old schema)
  q10: string | null;  // unused (old schema)
  nps: number | null;  // 0–10 recommendation likelihood
}

export async function submitResponse(data: Omit<Response, "id" | "created_at">): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/responses`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Submit failed: ${res.status}`);
}

export async function fetchResponses(): Promise<Response[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/responses?order=created_at.asc`, { headers });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
}

export async function deleteResponse(id: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/responses?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}
