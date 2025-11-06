import { test, expect } from "@playwright/test";

test.describe("Sign-in error handling", () => {
  test("shows message for invalid credentials", async ({ page }) => {
    await page.goto("/signin");
    await page.getByLabel(/^First name$/i).fill("NoSuch");
    await page.getByLabel(/^Last name$/i).fill("User");
    await page.getByLabel(/^Password$/).fill("wrongpass");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText(/name or password is incorrect/i)).toBeVisible();
  });

  test("inactive users cannot log in (friendly message)", async ({ page }) => {
    // Sign up a new active user
    await page.goto("/signup");
    await page.getByLabel(/^First name$/i).fill("Eve");
    await page.getByLabel(/^Last name$/i).fill("Tester");
    await page.getByLabel(/^Password$/).fill("secret123");
    await page.getByLabel(/^Confirm password$/i).fill("secret123");
    await page.getByRole("button", { name: "Create Account" }).click();

    // On dashboard, set this user to inactive
    const row = page.locator("tr", { hasText: /Eve\s+Tester/i }).first();
    await row.locator("select").first().selectOption("inactive");
    await expect(page.getByText(/updated successfully/i)).toBeVisible();

    // Log out
    await page.getByRole("button", { name: "Log Out" }).click();
    await page.waitForURL("**/signin");

    // Try to sign in again -> friendly inactive message
    await page.getByLabel(/^First name$/i).fill("Eve");
    await page.getByLabel(/^Last name$/i).fill("Tester");
    await page.getByLabel(/^Password$/).fill("secret123");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText(/cannot log in/i)).toBeVisible();
  });
});
