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
  q1: string | null;
  q2: number | null;
  q3: string | null;
  q4: string | null;
  q5: number | null;
  q6: number | null;
  q7: string | null;
  q8: string | null;
  q9: string | null;
  q10: string | null;
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
