import type { ApiResponse } from "@/types/api";

const SERVER_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function fetchPublicApi<T>(path: string, revalidate = 60): Promise<ApiResponse<T> | null> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, {
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}
