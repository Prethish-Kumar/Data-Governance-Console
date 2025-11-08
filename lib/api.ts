// /lib/api.ts
const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

export async function getUsers(searchParams?: { page?: string }) {
  // Extract current page safely
  const { page: pageParam } = (await searchParams) || { page: "0" };
  const currentPage = Number(pageParam);
  const size = 5;

  // Fetch users from backend
  const res = await fetch(
    `${BASE_URL}/api/v1/users?page=${currentPage}&size=${size}`,
    {
      next: { revalidate: 30 },
    }
  );

  if (!res.ok) {
    console.error("❌ Failed to fetch users:", res.status, res.statusText);
    throw new Error("Failed to fetch users");
  }

  const data = await res.json();

  // Normalize structure (safely handle missing fields)
  return {
    users: data.content || [],
    totalPages: data.totalPages ?? 1,
    isFirst: data.first ?? currentPage === 0,
    isLast: data.last ?? currentPage + 1 >= (data.totalPages ?? 1),
    pageNumber: data.number ?? currentPage,
    size,
  };
}
