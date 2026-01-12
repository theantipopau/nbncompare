#!/usr/bin/env node
/**
 * Trigger Data Population on Production Worker
 * 
 * This script calls the production worker endpoint to populate enhanced data
 * Usage: node trigger-data-population.js [--status]
 */

const args = process.argv.slice(2);
const statusOnly = args.includes('--status');

async function main() {
  const baseUrl = 'https://nbncompare.info';

  if (statusOnly) {
    console.log('\n📊 Fetching data population status...\n');
    try {
      const response = await fetch(`${baseUrl}/internal/data-population/status`);
      const data = await response.json();

      if (data.ok) {
        const { result } = data;
        console.log(`
╔════════════════════════════════════════════════════════╗
║           Data Population Status Report                ║
╚════════════════════════════════════════════════════════╝

📊 PROVIDER STATUS:
   ✅ Verified:  ${result.providers.verified} providers
   ⏳ Pending:   ${result.providers.pending} providers
   ❌ Failed:    ${result.providers.failed} providers

📈 PLAN DATA COMPLETENESS:
   Total Plans: ${result.plans.total}
   
   Upload Speed:      ${result.plans.with_upload_speed} / ${result.plans.total} (${Math.round((result.plans.with_upload_speed / result.plans.total) * 100)}%)
   Data Allowance:    ${result.plans.with_data_allowance} / ${result.plans.total} (${Math.round((result.plans.with_data_allowance / result.plans.total) * 100)}%)
   Contract Months:   ${result.plans.with_contract_months} / ${result.plans.total} (${Math.round((result.plans.with_contract_months / result.plans.total) * 100)}%)
   Modem Included:    ${result.plans.with_modem_included} / ${result.plans.total} (${Math.round((result.plans.with_modem_included / result.plans.total) * 100)}%)
   Setup Fee:         ${result.plans.with_setup_fee} / ${result.plans.total} (${Math.round((result.plans.with_setup_fee / result.plans.total) * 100)}%)

`);
      } else {
        console.error('❌ Status check failed:', data.error);
      }
    } catch (err) {
      console.error('❌ Failed to fetch status:', err.message);
    }
    return;
  }

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Triggering Enhanced Data Population                    ║
║                 On Production Worker                           ║
╚════════════════════════════════════════════════════════════════╝

⏳ Starting data population process...
   This will scrape all 20 providers and may take 2-5 minutes.

`);

  try {
    console.log(`🚀 Sending POST /internal/data-population/populate`);
    const startTime = Date.now();
    
    const response = await fetch(`${baseUrl}/internal/data-population/populate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (data.ok) {
      const { result } = data;
      console.log(`\n${'='.repeat(70)}`);
      console.log('✅ DATA POPULATION COMPLETED SUCCESSFULLY\n');
      console.log(`📊 RESULTS:`);
      console.log(`   Total Providers:      ${result.totalProviders}`);
      console.log(`   Processed:            ${result.processedProviders}`);
      console.log(`   Verified:             ${result.verifiedProviders}`);
      console.log(`   Plans Updated:        ${result.processedPlans}`);
      console.log(`   Errors:               ${result.errors}`);
      console.log(`   Duration:             ${(result.duration / 1000).toFixed(2)}s`);
      console.log(`\n📋 PROVIDER DETAILS:`);
      
      result.details.forEach((detail, idx) => {
        const status = detail.status.includes('✅') ? '✅' : '❌';
        const plansStr = detail.plans ? `(${detail.plans} plans)` : '';
        console.log(`   ${(idx + 1).toString().padStart(2)}. ${status} ${detail.provider.padEnd(25)} ${plansStr}`);
        if (detail.error) {
          console.log(`       Error: ${detail.error.substring(0, 60)}`);
        }
      });
      
      console.log(`\n${'='.repeat(70)}`);
      console.log(`✨ Response Time: ${duration}ms\n`);
    } else {
      console.error('\n❌ Population failed:');
      console.error(`   Error: ${data.error}`);
      if (data.result) {
        console.error(`   Partial result:`, data.result);
      }
    }
  } catch (err) {
    console.error('\n❌ Request failed:', err.message);
    console.error('\n💡 Make sure:');
    console.error('   1. The worker is deployed: wrangler deploy');
    console.error('   2. The domain is accessible: https://nbncompare.info');
    console.error('   3. Your internet connection is working');
  }
}

main();
