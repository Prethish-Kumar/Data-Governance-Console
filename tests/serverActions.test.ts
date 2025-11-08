/**
 * @jest-environment node
 *
 * Server Actions Unit Tests
 * - Tests all CRUD operations and data fetching
 * - Mocks fetch, Next.js cache, and redirect
 * - Uses BASE_URL from environment variable to be environment-agnostic
 */

import {
  addUser,
  deleteUser,
  toggleUserStatus,
  getUsers,
  getUserById,
  getUserPreferences,
  getUserPosts,
} from "../actions/userActions";

// Ensure BASE_URL is defined for tests
process.env.BASE_URL = process.env.BASE_URL || "http://localhost:8080";

// Mock global fetch function
global.fetch = jest.fn();

// Mock Next.js cache revalidation and navigation redirect
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

const revalidateSpy = require("next/cache").revalidatePath;
const redirectSpy = require("next/navigation").redirect;

describe("Server Actions", () => {
  // Clear mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * DELETE USER
   * - Should call the DELETE endpoint with correct ID
   * - Should revalidate /users cache and redirect to users page
   */
  it("deleteUser should call correct API, revalidate path, and redirect", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await deleteUser("123");

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.BASE_URL}/api/v1/users/123`,
      expect.objectContaining({ method: "DELETE" })
    );
    expect(revalidateSpy).toHaveBeenCalledWith("/users");
    expect(redirectSpy).toHaveBeenCalledWith("/users?page=0");
  });

  // DELETE USER - validation: should throw error if ID is missing
  it("deleteUser should throw error if id is missing", async () => {
    await expect(deleteUser("")).rejects.toThrow("User ID required");
  });

  /**
   * TOGGLE USER STATUS
   * - Sends PATCH request to update user status
   * - Should revalidate /users cache after success
   */
  it("toggleUserStatus should send PATCH with correct body", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await toggleUserStatus("123", "INACTIVE");

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.BASE_URL}/api/v1/users/123`,
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "INACTIVE" }),
      })
    );
    expect(revalidateSpy).toHaveBeenCalledWith("/users");
  });

  /**
   * ADD USER
   * - Posts new user data
   * - Revalidates /users cache
   * - Returns success object on success, or error object on failure
   */
  it("addUser should call correct API and revalidate path", async () => {
    const formData = new FormData();
    formData.set("username", "pre");
    formData.set("email", "pre@example.com");
    formData.set("name", "Pre");
    formData.append("roles", "ADMIN");

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "123" }),
    });

    const result = await addUser(formData);

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.BASE_URL}/api/v1/users`,
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "pre",
          email: "pre@example.com",
          name: "Pre",
          roles: ["ADMIN"],
          status: "ACTIVE",
        }),
      })
    );
    expect(revalidateSpy).toHaveBeenCalledWith("/users");
    expect(result).toEqual({ success: true });
  });

  // ADD USER - handles missing or invalid data gracefully
  it("addUser should handle missing data gracefully", async () => {
    const formData = new FormData(); // empty form
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 400 });

    const result = await addUser(formData);

    expect(result).toEqual({ success: false, error: "Failed to add user" });
  });

  /**
   * GET USERS
   * - Returns normalized paginated users list
   */
  it("getUsers should return normalized data", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ id: "1", name: "A" }],
        totalPages: 2,
        first: true,
        last: false,
        number: 0,
      }),
    });

    const data = await getUsers({ page: "0" });

    expect(data.users.length).toBe(1);
    expect(data.totalPages).toBe(2);
    expect(data.isFirst).toBe(true);
    expect(data.isLast).toBe(false);
  });

  /**
   * GET USER BY ID
   * - Returns user object if found
   * - Returns null if not found or error
   */
  it("getUserById should return user object or null", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "1", name: "A" }),
    });
    const user = await getUserById("1");
    expect(user).toEqual({ id: "1", name: "A" });

    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const noUser = await getUserById("999");
    expect(noUser).toBeNull();
  });

  /**
   * GET USER PREFERENCES
   * - Returns preferences object if exists
   * - Returns null if API fails or no data
   */
  it("getUserPreferences should return preferences or null", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ theme: "dark" }),
    });
    const prefs = await getUserPreferences("1");
    expect(prefs).toEqual({ theme: "dark" });

    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const noPrefs = await getUserPreferences("1");
    expect(noPrefs).toBeNull();
  });

  /**
   * GET USER POSTS
   * - Returns array of posts
   * - Returns empty array if API fails
   */
  it("getUserPosts should return posts array or empty array", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: "p1", title: "Post 1" }],
    });
    const posts = await getUserPosts("1");
    expect(posts).toEqual([{ id: "p1", title: "Post 1" }]);

    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    const noPosts = await getUserPosts("1");
    expect(noPosts).toEqual([]);
  });
});
