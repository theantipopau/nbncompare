/**
 * Provider URL Verification Tool
 * 
 * Verifies all provider canonical URLs are valid and accessible
 * Reports broken URLs, redirects, and status codes
 * 
 * Usage: npx ts-node src/tools/verify-provider-urls.ts
 */

interface ProviderUrl {
  name: string;
  slug: string;
  url: string;
}

interface VerificationResult {
  provider: string;
  slug: string;
  url: string;
  status: number | null;
  redirectUrl: string | null;
  valid: boolean;
  issue: string | null;
  timestamp: string;
}

const providers: ProviderUrl[] = [
  { name: "Telstra", slug: "telstra", url: "https://www.telstra.com.au/internet/nbn" },
  { name: "Optus", slug: "optus", url: "https://www.optus.com.au/network/nbn" },
  { name: "TPG", slug: "tpg", url: "https://www.tpg.com.au/internet/nbn" },
  { name: "Aussie Broadband", slug: "aussiebroadband", url: "https://www.aussiebroadband.com.au/nbn" },
  { name: "iiNet", slug: "iinet", url: "https://www.iinet.net.au/nbn" },
  { name: "Vodafone", slug: "vodafone", url: "https://www.vodafone.com.au/network/nbn" },
  { name: "Dodo", slug: "dodo", url: "https://www.dodo.com.au/internet/nbn" },
  { name: "Superloop", slug: "superloop", url: "https://superloop.com.au/broadband/nbn" },
  { name: "Spintel", slug: "spintel", url: "https://www.spintel.com.au/internet/nbn" },
  { name: "Exetel", slug: "exetel", url: "https://www.exetel.com.au/internet/nbn" },
  { name: "Mate", slug: "mate", url: "https://www.mate.com.au/internet/nbn" },
  { name: "Foxtel", slug: "foxtel", url: "https://www.foxtel.com.au/internet/nbn" },
  { name: "Kogan", slug: "kogan", url: "https://www.kogan.com/au/internet" },
  { name: "Carbon Communications", slug: "carbon", url: "https://www.carboncomms.com.au/nbn" },
  { name: "Tangerine", slug: "tangerine", url: "https://www.tangerine.com.au/internet" },
  // Add more providers as needed
];

async function verifyUrl(provider: ProviderUrl): Promise<VerificationResult> {
  try {
    const response = await fetch(provider.url, {
      method: "HEAD",
      redirect: "manual", // Don't follow redirects automatically
      headers: {
        "User-Agent": "NBN Compare URL Verification Tool",
      },
    });

    const redirectUrl = response.headers.get("location");
    const valid = response.status >= 200 && response.status < 400;
    let issue = null;

    if (response.status === 404) {
      issue = "URL returns 404 Not Found";
    } else if (response.status === 410) {
      issue = "URL returns 410 Gone";
    } else if (response.status >= 500) {
      issue = `Server error: ${response.status}`;
    } else if (redirectUrl && redirectUrl !== provider.url) {
      issue = `Redirects to ${redirectUrl}`;
    }

    return {
      provider: provider.name,
      slug: provider.slug,
      url: provider.url,
      status: response.status,
      redirectUrl,
      valid,
      issue,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      provider: provider.name,
      slug: provider.slug,
      url: provider.url,
      status: null,
      redirectUrl: null,
      valid: false,
      issue: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

async function generateReport(results: VerificationResult[]): Promise<string> {
  const timestamp = new Date().toISOString();
  const valid = results.filter((r) => r.valid).length;
  const invalid = results.filter((r) => !r.valid).length;
  const redirects = results.filter((r) => r.redirectUrl && r.redirectUrl !== r.url).length;

  let report = `# Provider URL Verification Report
Generated: ${timestamp}

## Summary
- Total Providers: ${results.length}
- Valid URLs: ${valid} ✅
- Broken URLs: ${invalid} ❌
- Redirects (needs update): ${redirects} ⚠️

## Issues Found

`;

  const criticalIssues = results.filter((r) => !r.valid && r.status === 404);
  if (criticalIssues.length > 0) {
    report += `### 🔴 CRITICAL - Broken URLs (404 Not Found)
`;
    criticalIssues.forEach((r) => {
      report += `- **${r.provider}** (${r.slug}): ${r.url}\n`;
      report += `  Status: ${r.status}\n`;
      report += `  Action: Update URL or verify provider still exists\n\n`;
    });
  }

  const warnings = results.filter((r) => r.redirectUrl && r.redirectUrl !== r.url);
  if (warnings.length > 0) {
    report += `### 🟡 WARNING - Redirects Detected
`;
    warnings.forEach((r) => {
      report += `- **${r.provider}** (${r.slug})\n`;
      report += `  Current: ${r.url}\n`;
      report += `  Redirects to: ${r.redirectUrl}\n`;
      report += `  Action: Update seed data to use ${r.redirectUrl}\n\n`;
    });
  }

  const errors = results.filter((r) => !r.valid && r.status !== 404 && r.status !== 410);
  if (errors.length > 0) {
    report += `### 🟠 ERRORS - Network/Server Issues
`;
    errors.forEach((r) => {
      report += `- **${r.provider}** (${r.slug})\n`;
      report += `  URL: ${r.url}\n`;
      report += `  Status: ${r.status || "Network error"}\n`;
      report += `  Issue: ${r.issue}\n\n`;
    });
  }

  report += `## All URLs Status

| Provider | URL | Status | Result |
|----------|-----|--------|--------|
`;

  results.forEach((r) => {
    const statusStr = r.status ? `${r.status}` : "ERROR";
    const resultStr = r.valid ? "✅" : "❌";
    const url = r.url.substring(0, 50) + (r.url.length > 50 ? "..." : "");
    report += `| ${r.provider} | ${url} | ${statusStr} | ${resultStr} |\n`;
  });

  report += `\n## Recommendations

1. Review all critical 404 errors and update URLs or note if providers are defunct
2. Update URLs in seed_providers.sql for any redirects found
3. Fix network errors if any (may indicate temporary issues)
4. Schedule quarterly re-verification to catch URL changes

## SQL Updates Needed

\`\`\`sql
-- Update redirected URLs in seed_providers.sql
${warnings
  .map((r) => `UPDATE providers SET canonical_url = '${r.redirectUrl}' WHERE slug = '${r.slug}';`)
  .join("\n")}
\`\`\`

## Next Steps

1. Execute the SQL updates above
2. Create migration: 0025_update_provider_urls.sql
3. Deploy migration
4. Verify all URLs work in production
5. Add URL verification to quarterly maintenance schedule
`;

  return report;
}

async function main() {
  console.log("🔍 Starting Provider URL Verification...\n");

  const results: VerificationResult[] = [];

  for (const provider of providers) {
    process.stdout.write(`Checking ${provider.name}... `);
    const result = await verifyUrl(provider);
    results.push(result);

    if (result.valid) {
      console.log("✅ OK");
    } else {
      console.log(`❌ ${result.issue}`);
    }

    // Rate limiting - don't hammer servers
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n📊 Generating report...\n");
  const report = await generateReport(results);

  // Display summary
  console.log(report);

  // Save report to file
  const fs = await import("fs");
  const reportPath = "./URL_VERIFICATION_REPORT.md";
  fs.writeFileSync(reportPath, report);
  console.log(`\n✅ Report saved to: ${reportPath}`);

  // Exit with error code if any URLs failed
  const failedCount = results.filter((r) => !r.valid).length;
  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Error running verification:", error);
  process.exit(1);
});
