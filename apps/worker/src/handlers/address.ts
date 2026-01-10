import { jsonResponse } from "../lib/cors";

/**
 * NBN Co Location API Integration
 * 
 * NBN Co provides a free Location API for address qualification:
 * Documentation: https://www.nbnco.com.au/develop/location-api
 * 
 * This requires registration at https://www.nbnco.com.au/develop/
 * to get an API key. For now, this is a placeholder implementation.
 * 
 * Alternative: Use Google Places API for address autocomplete,
 * then NBN Co Location API for service qualification.
 */

interface AddressSearchResult {
  id: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
}

interface NBNServiceQualification {
  serviceType: string; // FTTP, FTTC, FTTN, HFC, Fixed Wireless, Satellite
  techType: string;
  maxSpeed: number; // Maximum download speed in Mbps
  available: boolean;
  disconnectionDate?: string | null;
  newDevelopment?: boolean;
}

/**
 * Search for addresses using NBN Co's FREE public API (no registration required!)
 * 
 * Based on https://github.com/LukePrior/nbn-service-check
 * API: https://places.nbnco.net.au/places/v1/autocomplete
 * 
 * This is the SAME API used on NBN's official website!
 */
export async function searchAddress(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    
    if (!query || query.trim().length < 3) {
      return jsonResponse({
        ok: false,
        error: "Search query must be at least 3 characters"
      }, 400);
    }

    // Call NBN Co's PUBLIC API (no API key required!)
    const nbnUrl = `https://places.nbnco.net.au/places/v1/autocomplete?query=${encodeURIComponent(query)}`;

    const nbnResponse = await fetch(nbnUrl, {
      headers: {
        'Referer': 'https://www.nbnco.com.au/residential/learn/network-technology/fttp-upgrade',
        'User-Agent': 'NBNCompare/1.0'
      }
    });

    if (!nbnResponse.ok) {
      throw new Error(`NBN API error: ${nbnResponse.status}`);
    }

    const nbnData = await nbnResponse.json();
    
    // Transform NBN response to our format
    const suggestions = nbnData.suggestions || [];
    
    // Filter for LOC IDs (actual NBN locations, not Google Places)
    const results: AddressSearchResult[] = suggestions
      .filter((item: unknown) => {
        const suggestion = item as { id?: string };
        return suggestion.id && suggestion.id.startsWith('LOC');
      })
      .map((item: unknown) => {
        const suggestion = item as { id: string; formattedAddress?: string; address?: string; latitude?: number; longitude?: number };
        return {
        id: suggestion.id, // LOC ID for qualification
        formattedAddress: suggestion.formattedAddress || suggestion.address,
        latitude: suggestion.latitude,
        longitude: suggestion.longitude
      }));

    return jsonResponse({
      ok: true,
      results,
      source: "NBN Co Official API"
    });

  } catch (err) {
    console.error("NBN address search error:", err);
    return jsonResponse({
      ok: false,
      error: String(err)
    }, 500);
  }
}

/**
 * Qualify an address for NBN service using NBN Co's FREE public API
 * 
 * Based on https://github.com/LukePrior/nbn-service-check
 * API: https://places.nbnco.net.au/places/v2/details/{locationId}
 * 
 * Returns actual NBN service details including technology type and max speed
 */
export async function qualifyAddress(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const locationId = url.searchParams.get("id");
    
    if (!locationId) {
      return jsonResponse({
        ok: false,
        error: "Location ID is required"
      }, 400);
    }

    // Validate it's a LOC ID
    if (!locationId.startsWith('LOC')) {
      return jsonResponse({
        ok: false,
        error: "Invalid location ID format"
      }, 400);
    }

    // Call NBN Co's details API (FREE, no API key!)
    const nbnUrl = `https://places.nbnco.net.au/places/v2/details/${locationId}`;
    
    const nbnResponse = await fetch(nbnUrl, {
      headers: {
        'Referer': 'https://www.nbnco.com.au/residential/learn/network-technology/fttp-upgrade',
        'User-Agent': 'NBNCompare/1.0'
      }
    });

    if (!nbnResponse.ok) {
      throw new Error(`NBN API error: ${nbnResponse.status}`);
    }

    const nbnData = await nbnResponse.json();
    
    // Extract service details
    const servingArea = nbnData.servingArea || {};
    const addressDetail = nbnData.addressDetail || {};
    
    const techType = addressDetail.techType || servingArea.techType || 'UNKNOWN';
    const serviceClass = addressDetail.serviceClass || 'UNKNOWN';
    const coExistence = addressDetail['co-existence'] === 'Yes';
    
    // Map tech types to max speeds (based on NBN Co specifications)
    // Updated 2026: FTTP and HFC now support 2000/100 Mbps
    const maxSpeeds: Record<string, number> = {
      'FTTP': 2000,  // Fiber to the Premises supports up to 2000/100 Mbps
      'FTTB': 100,
      'FTTC': 100,
      'FTTN': 100,
      'HFC': 2000,  // HFC (cable) now supports 2000/100 Mbps plans
      'WIRELESS': 50,
      'SATELLITE': 25
    };

    const qualification: NBNServiceQualification = {
      serviceType: techType,
      techType: techType,
      maxSpeed: maxSpeeds[techType] || 100,
      available: serviceClass !== '0' && serviceClass !== '4' && serviceClass !== '10' && serviceClass !== '30',
      newDevelopment: addressDetail.newDevelopmentCharge ? true : false
    };

    return jsonResponse({
      ok: true,
      qualification,
      details: {
        formattedAddress: addressDetail.formattedAddress,
        servingAreaName: servingArea.description,
        coExistence,
        techChangeStatus: addressDetail.techChangeStatus,
        programType: addressDetail.programType,
        targetEligibilityQuarter: addressDetail.targetEligibilityQuarter
      },
      source: "NBN Co Official API"
    });

  } catch (err) {
    console.error("Address qualification error:", err);
    return jsonResponse({
      ok: false,
      error: String(err)
    }, 500);
  }
}
