import { chromium } from "playwright";

export async function extractXPathContent(
  url: string,
  xpathSelector: string
): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

    // Evaluate XPath and return text content
    const content = await page.evaluate((xpath) => {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      const node = result.singleNodeValue;
      return node ? (node as HTMLElement).textContent?.trim() || "" : "";
    }, xpathSelector);

    return content;
  } finally {
    await browser.close();
  }
}

export async function extractJsonApiContent(
  url: string,
  jsonPath: string,
  httpHeaders?: Record<string, string>
): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...httpHeaders,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  // Resolve JSON path (dot notation: "data.price" or "results[0].name")
  const value = resolveJsonPath(data, jsonPath);
  return JSON.stringify(value);
}

function resolveJsonPath(obj: unknown, path: string): unknown {
  const parts = path.split(/[.[\]]+/).filter(Boolean);
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}
