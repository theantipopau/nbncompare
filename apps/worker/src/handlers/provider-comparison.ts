/**
 * Provider Features Comparison
 * Shows side-by-side IPv6, CGNAT, static IP, support, parent company
 */

export interface ProviderFeatures {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  ipv6_support: number; // 0=no, 1=yes
  cgnat: number; // 0=no CGNAT, 1=uses CGNAT
  cgnat_opt_out?: number; // 0=none, 1=free, 2=paid
  static_ip_available: number; // 0=no, 1=free, 2=paid
  australian_support: number; // 0=offshore, 1=mixed, 2=100% AU
  parent_company?: string;
  support_hours?: string;
  description?: string;
}

interface WorkerEnv {
  DB: unknown; // D1Database
}

interface _ProviderData {
  id: number;
  name: string;
  slug?: string;
  logo_url?: string;
  ipv6_support?: boolean;
  cgnat?: string;
  cgnat_opt_out?: boolean | string;
  static_ip_available?: boolean | string;
  australian_support?: boolean | string;
  parent_company?: string;
  support_hours?: string;
  description?: string;
}

export async function getProviderComparison(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const db = env.DB as any;
    
    const providers = await db.prepare(`
      SELECT 
        id, name, slug, logo_url,
        ipv6_support, cgnat, cgnat_opt_out,
        static_ip_available, australian_support,
        parent_company, support_hours, description
      FROM providers
      WHERE is_active = 1
      ORDER BY name ASC
    `).all();

    // Transform for frontend
    const features = providers.results.map((p: Record<string, unknown>) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      logo_url: p.logo_url,
      features: {
        ipv6: {
          label: 'IPv6 Support',
          value: p.ipv6_support,
          display: p.ipv6_support ? '✓' : '✗'
        },
        cgnat: {
          label: 'CGNAT',
          value: p.cgnat,
          display: p.cgnat ? `Uses CGNAT${p.cgnat_opt_out ? (p.cgnat_opt_out === 1 ? ' (free opt-out)' : ' (paid opt-out)') : ''}` : 'No CGNAT'
        },
        static_ip: {
          label: 'Static IP',
          value: p.static_ip_available,
          display: p.static_ip_available === 0 ? '✗' : (p.static_ip_available === 1 ? 'Free' : 'Paid addon')
        },
        australian_support: {
          label: 'Support',
          value: p.australian_support,
          display: p.australian_support === 2 ? '100% Australian' : (p.australian_support === 1 ? 'Mixed (AU+Offshore)' : 'Offshore')
        },
        parent_company: {
          label: 'Parent Company',
          value: p.parent_company,
          display: p.parent_company || 'Independent'
        }
      },
      description: p.description,
      support_hours: p.support_hours
    }));

    return new Response(
      JSON.stringify({ providers: features }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        } 
      }
    );
  } catch (err) {
    console.error('Provider comparison error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch provider comparison' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
