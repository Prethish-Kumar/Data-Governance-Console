"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";

/**
 * Fetches all users from the backend API (no pagination).
 *
 * Uses a no-store cache policy to always retrieve fresh data from the server.
 *
 * @returns A promise resolving to the parsed JSON response (array or object depending on backend).
 * @throws Error when the network request returns a non-OK response.
 */
export async function getAllUsers() {
  const res = await fetch(`${BASE_URL}/api/v1/users`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch all users");
  return res.json();
}

/**
 * Fetches a paginated list of users from the backend API.
 *
 * @param searchParams Optional object containing `page` parameter as a string.
 * @returns Normalized object with users array, pagination info, and page size.
 * @throws Error if the backend request fails.
 */
export async function getUsers(searchParams?: { page?: string }) {
  const { page: pageParam } = (await searchParams) || { page: "0" };
  const currentPage = Number(pageParam) || 0;
  const size = 5;

  const res = await fetch(
    `${BASE_URL}/api/v1/users?page=${currentPage}&size=${size}`,
    { next: { revalidate: 30 } }
  );

  if (!res.ok) {
    console.error("❌ Failed to fetch users:", res.status, res.statusText);
    throw new Error("Failed to fetch users");
  }

  const data = await res.json();

  return {
    users: data.content || [],
    totalPages: data.totalPages ?? 1,
    isFirst: data.first ?? currentPage === 0,
    isLast: data.last ?? currentPage + 1 >= (data.totalPages ?? 1),
    pageNumber: data.number ?? currentPage,
    size,
  };
}

/**
 * Deletes a user by their ID.
 * Performs a server action: calls DELETE API, revalidates SSR cache, and redirects.
 *
 * @param id User ID to delete.
 * @throws Error if ID is missing or DELETE request fails.
 */
export async function deleteUserFromHome(id: string) {
  if (!id) throw new Error("User ID required");

  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error("❌ Failed to delete user:", res.status, msg);
    throw new Error(`Delete failed (${res.status})`);
  }

  revalidatePath("/users");
}

export async function deleteUser(id: string) {
  if (!id) throw new Error("User ID required");

  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error("❌ Failed to delete user:", res.status, msg);
    throw new Error(`Delete failed (${res.status})`);
  }

  revalidatePath("/users");
  redirect("/users?page=0");
}

/**
 * Fetch a single user's information by ID.
 *
 * @param id User ID.
 * @returns User object if found, otherwise null.
 */
export async function getUserById(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("❌ Failed to fetch user info:", e);
    return null;
  }
}

/**
 * Fetch a user's preferences by ID.
 *
 * @param id User ID.
 * @returns Preferences object if available, otherwise null.
 */
export async function getUserPreferences(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/users/${id}/preferences`, {
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.error) return null;

    return data;
  } catch (e) {
    console.error("⚠️ No preferences found:", e);
    return null;
  }
}

/**
 * Fetch posts created by a user.
 *
 * @param id User ID.
 * @returns Array of posts if found, otherwise empty array.
 */
export async function getUserPosts(id: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/users/${id}/posts`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("⚠️ No posts found:", e);
    return [];
  }
}

/**
 * Adds a new user using data from a FormData object.
 * Performs server-side action: calls POST API and revalidates SSR cache.
 *
 * @param formData FormData containing username, email, name, and roles.
 * @returns Object with success status and optional error message.
 */
export async function addUser(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const roles = formData.getAll("roles") as string[];

  try {
    const res = await fetch(`${BASE_URL}/api/v1/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        name,
        roles,
        status: "ACTIVE",
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to add user (${res.status})`);
    }

    revalidatePath("/users");
    return { success: true };
  } catch (err) {
    console.error("❌ Error adding user:", err);
    return { success: false, error: "Failed to add user" };
  }
}

/**
 * Server action wrapper for adding a user from a FormData submission.
 *
 * Calls `addUser` to perform the POST and then redirects to
 * the add-user page with query params indicating success or failure.
 *
 * @param formData FormData object containing the user fields (username, email, name, roles).
 * @returns void (redirects the user after completing the action).
 */
export async function addUserAction(formData: FormData) {
  const result = await addUser(formData);

  if (result.success) {
    redirect("/users/add?success=true");
  } else {
    redirect(
      `/users/add?error=${encodeURIComponent(result.error ?? "Unknown error")}`
    );
  }
}

/**
 * Toggles a user's status between ACTIVE and INACTIVE.
 * Performs server-side PATCH and revalidates SSR cache.
 *
 * @param id User ID.
 * @param status New status: "ACTIVE" or "INACTIVE".
 * @returns Updated user object from backend.
 * @throws Error if PATCH request fails.
 */
export async function toggleUserStatus(
  id: string,
  status: "ACTIVE" | "INACTIVE"
) {
  console.log("Toggling user status:", id, status);

  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update status: ${errText}`);
  }

  revalidatePath("/users");
  return res.json();
}

/**
 * Creates a new post for a specific user.
 *
 * Sends a POST request to the backend with title and content. Revalidates
 * the user's page on success.
 *
 * @param userId The ID of the user creating the post.
 * @param title Title of the post.
 * @param content Body content of the post.
 * @returns Promise<boolean> resolving to true on success.
 * @throws Error when the backend returns a non-OK response or on network failure.
 */
export async function createUserPost(
  userId: string,
  title: string,
  content: string
) {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/users/${userId}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      console.error("❌ Failed to create post:", await res.text());
      throw new Error("Failed to create post");
    }

    revalidatePath(`/users/${userId}`);
    return true;
  } catch (e) {
    console.error("⚠️ createUserPost error:", e);
    throw e;
  }
}

/**
 * Soft-deletes a post by ID (calls DELETE on posts endpoint).
 *
 * This is intended as a server action. On success it revalidates the users
 * listing cache.
 *
 * @param postId The ID of the post to be deleted.
 * @returns Promise<boolean> resolving to true when deletion succeeds.
 * @throws Error when the backend returns a non-OK response.
 */
export async function softDeletePost(postId: string) {
  "use server";
  const res = await fetch(`${BASE_URL}/api/v1/posts/${postId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete post (${res.status})`);
  }
  revalidatePath(`/users/`);
  return true;
}

/**
 * Creates default preferences for a user.
 *
 * Sends a PUT request to initialize preferences (theme, language, notifications).
 * Revalidates the user's page on success and returns the created preference object.
 *
 * @param userId The ID of the user to create preferences for.
 * @returns The created preferences object from the backend.
 * @throws Error when the backend returns a non-OK response.
 */
export async function createDefaultPreferences(userId: string) {
  "use server";
  const res = await fetch(`${BASE_URL}/api/v1/users/${userId}/preferences`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      theme: "light",
      language: "en",
      notificationsEnabled: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create default preferences (${res.status})`);
  }
  revalidatePath(`/users/${userId}`);
  return await res.json();
}
