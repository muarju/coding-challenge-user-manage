import { test, expect } from "@playwright/test";

test("sign up → dashboard → logout", async ({ page }) => {
  await page.goto("/signup"); // was /, redirected to /signin previously
  // Already on Sign Up
  await page.getByLabel(/^First name$/i).fill("John");
  await page.getByLabel(/^Last name$/i).fill("Doe");
  const pw = page.getByLabel(/^Password$/);
  const confirm = page.getByLabel(/^Confirm password$/i);
  await confirm.fill("secret");
  await expect(confirm).toHaveValue("secret");
  await pw.click();
  await pw.fill("secret");
  await expect(pw).toHaveValue("secret");
  const waitSignup = page.waitForResponse((r) => r.url().includes("/api/sessions/signup") && r.status() === 201);
  await page.locator("form").evaluate((el) => (el as HTMLFormElement).requestSubmit());
  await waitSignup;

  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 10000 });

  await page.getByRole("button", { name: "Log Out" }).click();
  // Fallback navigation to ensure stable teardown across CI
  await page.goto("/signin");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});
