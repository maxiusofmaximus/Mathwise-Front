import { expect, test } from "@playwright/test";

test("login inválido muestra error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email|correo/i).fill("bad@example.com");
  await page.getByLabel(/password|contraseña/i).fill("bad-password");
  await page.getByRole("button", { name: /login|entrar/i }).click();
  await expect(page.locator(".alert")).toBeVisible();
});

