/**
 * Savings Calculator
 * Calculates estimated annual savings based on usage patterns
 */

interface Plan {
  id: number;
  plan_name: string;
  ongoing_price_cents: number;
  speed_tier?: number;
  data_allowance?: string;
  provider_name?: string;
}

export interface SavingsCalculation {
  current_plan_id: number;
  proposed_plans: number[]; // Array of plan IDs to compare
  usage_gb_per_month: number;
  months: number; // Usually 12 for annual
}

export interface SavingsResult {
  current_plan: {
    id: number;
    name: string;
    provider: string;
    annual_cost: number;
  };
  alternatives: Array<{
    id: number;
    name: string;
    provider: string;
    annual_cost: number;
    savings: number;
    savings_percent: number;
    speed_upgrade: boolean;
  }>;
  total_potential_savings: number;
  best_value_id: number;
}

interface WorkerEnv {
  DB: unknown; // D1Database
}

export async function calculateSavings(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const { current_plan_id, proposed_plans, usage_gb_per_month, months = 12 } = await request.json() as SavingsCalculation;

    const db = env.DB as any;
    
    // Get current plan details
    const currentResult = await db.prepare(`
      SELECT 
        p.id, p.plan_name, p.ongoing_price_cents, p.data_allowance,
        pr.name as provider_name
      FROM plans p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE p.id = ?
    `).bind(current_plan_id).first();

    if (!currentResult) {
      return new Response(
        JSON.stringify({ error: 'Current plan not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const current = currentResult as Plan;
    const currentAnnualCost = (current.ongoing_price_cents / 100) * months;

    // Get proposed plans
    const proposedResult = await db.prepare(`
      SELECT 
        p.id, p.plan_name, p.ongoing_price_cents, p.speed_tier, p.data_allowance,
        pr.name as provider_name
      FROM plans p
      JOIN providers pr ON p.provider_id = pr.id
      WHERE p.id IN (${proposed_plans.map(() => '?').join(',')})
      ORDER BY p.ongoing_price_cents ASC
    `).bind(...proposed_plans).all();

    const alternatives = (proposedResult.results || []).map((plan: Plan) => {
      const annualCost = (plan.ongoing_price_cents / 100) * months;
      const savings = currentAnnualCost - annualCost;
      const savingsPercent = (savings / currentAnnualCost) * 100;
      
      return {
        id: plan.id,
        name: plan.plan_name,
        provider: plan.provider_name,
        annual_cost: Math.round(annualCost * 100) / 100,
        speed_tier: plan.speed_tier,
        data_allowance: plan.data_allowance,
        savings: Math.round(savings * 100) / 100,
        savings_percent: Math.round(savingsPercent * 10) / 10,
        speed_upgrade: (plan.speed_tier || 0) > (current.speed_tier || 0)
      };
    });

    const bestValue = alternatives.reduce((best: typeof alternatives[0] | null, alt: typeof alternatives[0]) => 
      alt.savings > best.savings ? alt : best, 
      alternatives[0] || { savings: 0, id: current_plan_id }
    );

    return new Response(
      JSON.stringify({
        current_plan: {
          id: current.id,
          name: current.plan_name,
          provider: current.provider_name,
          annual_cost: Math.round(currentAnnualCost * 100) / 100
        },
        alternatives,
        total_potential_savings: Math.round(alternatives.reduce((sum: number, a: typeof alternatives[0]) => sum + a.savings, 0) * 100) / 100,
        best_value_id: bestValue.id,
        usage_scenario: {
          gb_per_month: usage_gb_per_month,
          months,
          note: 'Data allowance not factored into pricing (most plans are unlimited)'
        }
      } as SavingsResult),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=600' // Cache for 10 minutes
        } 
      }
    );
  } catch (err) {
    console.error('Savings calculation error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to calculate savings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
