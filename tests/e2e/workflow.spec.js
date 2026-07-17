import { test, expect } from '@playwright/test';

test.describe('PulseGrid AI Full E2E Workflow', () => {
  test('should launch application, navigate through modes/pages, execute translation analysis, and logout', async ({ page }) => {
    // 1. Open Application
    await page.goto('/');
    
    // Assert landing page content is loaded
    await expect(page.locator('text=Intelligent FIFA World Cup 2026')).toBeVisible();

    // 2. Select Command Center view mode
    await page.click('text="Command Center"');
    
    // Assert Command Center layout is active
    await expect(page.locator('text=PULSEGRID')).toBeVisible();
    await expect(page.locator('text=Morocco vs Portugal')).toBeVisible();

    // 3. Navigate to the AI Translator operations subpage
    await page.click('text="AI Translator"');

    // Assert Translation page heading is rendered
    await expect(page.locator('text=Context-Aware Multilingual AI')).toBeVisible();

    // 4. Fill in a medical crisis fan message
    await page.fill('textarea', 'My grandfather suddenly feels dizzy and has chest pain');

    // Click to run AI context analysis
    await page.click('text="Analyze with AI"');

    // Assert that the AI translates the text and triggers the Medical Alert workflow
    // Specific span matching prevents strict-mode violation with "Medical Alerts"
    const resultHeader = page.locator('span.font-bold:has-text("MEDICAL ALERT")');
    await expect(resultHeader).toBeVisible({ timeout: 10000 });

    // Assert that the translated response is visible (contains "dispatched")
    await expect(page.locator('text=dispatched')).toBeVisible();

    // 5. Navigate back to Landing Page (Logout)
    await page.click('text="Back to Landing"');

    // Assert that we are back on the role selector launcher with exact heading match
    await expect(page.locator('text="Choose Your Interface"')).toBeVisible();
  });
});
