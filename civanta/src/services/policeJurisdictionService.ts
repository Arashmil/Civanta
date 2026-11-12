/**
 * CIVANTA AI Police Jurisdiction & Division Determination Service
 * Maps geographical coordinates, address strings, pin codes, and landmark data
 * to Karnataka State Police (KSP) official Districts, Divisions, and Jurisdictional Stations.
 */

import { getEffectiveGeminiKey } from './aiRoleAssistant';

export interface LocationInput {
  latitude: number;
  longitude: number;
  address?: string;
  road?: string;
  suburb?: string;
  city?: string;
  district?: string;
  pinCode?: string;
}

export interface AIJurisdictionResult {
  policeDistrictOrDivision: string;
  jurisdictionalStation: string;
  subDivision: string;
  policeRange: string;
  rationale: string;
  confidence: number;
  source: 'ai_gemini' | 'gis_rule_engine';
}

export const KARNATAKA_POLICE_DIVISIONS = [
  'Bengaluru City - South-East Division',
  'Bengaluru City - Whitefield Division',
  'Bengaluru City - Central Division',
  'Bengaluru City - East Division',
  'Bengaluru City - West Division',
  'Bengaluru City - South Division',
  'Bengaluru City - North Division',
  'Bengaluru City - North-East Division',
  'Bengaluru Rural District',
  'Mysuru City Police Commissionerate',
  'Mangaluru City Police Commissionerate',
  'Hubballi-Dharwad City Police Commissionerate',
  'Belagavi City Police Commissionerate',
  'Kalaburagi City Police Commissionerate',
  'Tumakuru Police District',
  'Udupi Police District',
  'Shivamogga Police District',
  'Dakshina Kannada Police District',
  'Hassan Police District',
  'Mandya Police District',
  'Kolar Police District'
];

interface DivisionRule {
  division: string;
  stations: string[];
  subDivision: string;
  range: string;
  keywords: string[];
  pinCodes: string[];
  latRange: [number, number];
  lngRange: [number, number];
}

const DIVISION_RULES: DivisionRule[] = [
  {
    division: 'Bengaluru City - South-East Division',
    stations: ['HSR Layout Police Station', 'Koramangala Police Station', 'Madiwala Police Station', 'Electronic City Police Station', 'Begur Police Station', 'Bommanahalli Police Station', 'Hulimavu Police Station'],
    subDivision: 'Madiwala Sub-Division (ACP)',
    range: 'Bengaluru City Police Commissionerate',
    keywords: ['hsr', 'koramangala', 'madiwala', 'electronic city', 'begur', 'bommanahalli', 'hulimavu', 'parappana agrahara', 'bandepalya', 'bomanahalli', 'singasandra', 'btm', 'silk board'],
    pinCodes: ['560034', '560068', '560095', '560100', '560102'],
    latRange: [12.83, 12.94],
    lngRange: [77.59, 77.69]
  },
  {
    division: 'Bengaluru City - Whitefield Division',
    stations: ['Whitefield Police Station', 'Kadugodi Police Station', 'Mahadevapura Police Station', 'Marathahalli Police Station', 'HAL Police Station', 'Bellandur Police Station', 'Varthur Police Station', 'KR Puram Police Station'],
    subDivision: 'Whitefield Sub-Division (ACP)',
    range: 'Bengaluru City Police Commissionerate',
    keywords: ['whitefield', 'kadugodi', 'mahadevapura', 'marathahalli', 'hal', 'bellandur', 'varthur', 'kr puram', 'k.r. puram', 'hoodi', 'brookefield', 'sarjapur', 'kundalahalli', 'outer ring road'],
    pinCodes: ['560036', '560037', '560048', '560066', '560067', '560103', '560087'],
    latRange: [12.90, 13.02],
    lngRange: [77.67, 77.78]
  },
  {
    division: 'Bengaluru City - South Division',
    stations: ['Jayanagar Police Station', 'JP Nagar Police Station', 'Banashankari Police Station', 'Basavanagudi Police Station', 'Hanumanthanagar Police Station', 'Subramanyapura Police Station', 'Kumaraswamy Layout Police Station'],
    subDivision: 'Jayanagar Sub-Division (ACP)',
    range: 'Bengaluru City Police Commissionerate',
    keywords: ['jayanagar', 'jp nagar', 'j.p. nagar', 'banashankari', 'basavanagudi', 'hanumanthanagar', 'girinagar', 'subramanyapura', 'kumaraswamy layout', 'thalaghattapura', 'konanakunte', 'padmanabhanagar'],
    pinCodes: ['560011', '560041', '560070', '560078', '560062', '560028', '560004'],
    latRange: [12.87, 12.95],
    lngRange: [77.53, 77.60]
  },
  {
    division: 'Bengaluru City - Central Division',
    stations: ['Cubbon Park Police Station', 'Vidhana Soudha Police Station', 'Ashok Nagar Police Station', 'Halasuru Gate Police Station', 'SJ Park Police Station', 'Wilson Garden Police Station'],
    subDivision: 'Cubbon Park Sub-Division (ACP)',
    range: 'Bengaluru City Police Commissionerate',
    keywords: ['cubbon park', 'vidhana soudha', 'ashok nagar', 'ashoknagar', 'halasuru gate', 'sj park', 'wilson garden', 'sampangiramanagar', 'mg road', 'brigade road', 'richmond town', 'shanthinagar', 'lavelle road', 'church street'],
    pinCodes: ['560001', '560025', '560027', '560002'],
    latRange: [12.95, 12.99],
    lngRange: [77.57, 77.62]
  },
  {
    division: 'Bengaluru City - East Division',
    stations: ['Indiranagar Police Station', 'Ulsoor Police Station', 'Commercial Street Police Station', 'Shivajinagar Police Station', 'Banaswadi Police Station', 'KG Halli Police Station', 'Hennur Police Station'],
    subDivision: 'Halasuru Sub-Division (ACP)',
    range: 'Bengaluru City Police Commissionerate',
    keywords: ['indiranagar', 'ulsoor', 'halasuru', 'commercial street', 'shivajinagar', 'bharathinagar', 'pulakeshinagar', 'banaswadi', 'hennur', 'kg halli', 'dj halli', 'ramamurthy nagar', 'frazer town', 'cox town'],
    pinCodes: ['560008', '560038', '560043', '560084', '560051', '560005'],
    latRange: [12.97, 13.04],
    lngRange: [77.60, 77.68]
  },
  {
    division: 'Bengaluru City - West Division',
    stations: ['Malleshwaram Police Station', 'Rajajinagar Police Station', 'Vijayanagar Police Station', 'Basaveshwaranagar Police Station', 'Magadi Road Police Station', 'Mahalakshmi Layout Police Station'],
    subDivision: 'Malleshwaram Sub-Division (ACP)',
    range: 'Bengaluru City Police Commissionerate',
    keywords: ['malleshwaram', 'malleswaram', 'rajajinagar', 'vijayanagar', 'magadi road', 'basaveshwaranagar', 'subramanyanagar', 'mahalakshmi layout', 'chandra layout', 'govindrajnagar'],
    pinCodes: ['560003', '560010', '560040', '560079', '560086'],
    latRange: [12.95, 13.02],
    lngRange: [77.50, 77.57]
  },
  {
    division: 'Bengaluru City - North Division',
    stations: ['Yeshwanthpur Police Station', 'Peenya Police Station', 'RMC Yard Police Station', 'Nandini Layout Police Station', 'Jalahalli Police Station'],
    subDivision: 'Yeshwanthpur Sub-Division (ACP)',
    range: 'Bengaluru City Police Commissionerate',
    keywords: ['yeshwanthpur', 'peenya', 'rmc yard', 'nandini layout', 'jalahalli', 'gangammanagudi', 'bagalgunte', 'soladevanahalli'],
    pinCodes: ['560022', '560057', '560058', '560090'],
    latRange: [13.01, 13.09],
    lngRange: [77.48, 77.56]
  },
  {
    division: 'Bengaluru City - North-East Division',
    stations: ['Yelahanka Police Station', 'Yelahanka New Town Police Station', 'Hebbal Police Station', 'RT Nagar Police Station', 'Vidyaranyapura Police Station', 'BIAL Airport Police Station'],
    subDivision: 'Yelahanka Sub-Division (ACP)',
    range: 'Bengaluru City Police Commissionerate',
    keywords: ['yelahanka', 'hebbal', 'rt nagar', 'r.t. nagar', 'kodigehalli', 'vidyaranyapura', 'sahakarnagar', 'bial', 'kempegowda airport', 'bagalur', 'chikkajala'],
    pinCodes: ['560024', '560032', '560064', '560092', '560097', '560300'],
    latRange: [13.02, 13.22],
    lngRange: [77.56, 77.72]
  },
  {
    division: 'Bengaluru Rural District',
    stations: ['Nelamangala Police Station', 'Doddaballapura Town Police Station', 'Devanahalli Police Station', 'Hosakote Police Station'],
    subDivision: 'Doddaballapura Sub-Division (DySP)',
    range: 'Central Range (IGP Central Range)',
    keywords: ['nelamangala', 'doddaballapura', 'devanahalli', 'hosakote', 'bengaluru rural', 'kanakapura road rural', 'magadi rural'],
    pinCodes: ['562123', '562110', '562114', '562120'],
    latRange: [13.10, 13.40],
    lngRange: [77.30, 77.85]
  },
  {
    division: 'Mysuru City Police Commissionerate',
    stations: ['Devaraja Police Station', 'Krishnaraja Police Station', 'Narasimharaja Police Station', 'Kuvempunagar Police Station', 'Vijayanagar Mysuru Police Station'],
    subDivision: 'Devaraja Sub-Division (ACP)',
    range: 'Southern Range (IGP Mysuru)',
    keywords: ['mysuru', 'mysore', 'devaraja', 'krishnaraja', 'narasimharaja', 'kuvempunagar', 'chamundi', 'gokulam'],
    pinCodes: ['570001', '570004', '570020', '570023'],
    latRange: [12.25, 12.38],
    lngRange: [76.58, 76.72]
  },
  {
    division: 'Mangaluru City Police Commissionerate',
    stations: ['Mangaluru North (Bunder) Police Station', 'Kadri Police Station', 'Urwa Police Station', 'Surathkal Police Station', 'Panambur Police Station'],
    subDivision: 'Mangaluru Central Sub-Division (ACP)',
    range: 'Western Range (IGP Mangaluru)',
    keywords: ['mangaluru', 'mangalore', 'bunder', 'kadri', 'urwa', 'surathkal', 'panambur', 'hampankatta', 'dakshina kannada'],
    pinCodes: ['575001', '575002', '575003', '575014'],
    latRange: [12.82, 13.01],
    lngRange: [74.78, 74.92]
  },
  {
    division: 'Hubballi-Dharwad City Police Commissionerate',
    stations: ['Hubballi Town Police Station', 'Dharwad Sub-Urban Police Station', 'Vidyanagar Police Station', 'Gokul Road Police Station'],
    subDivision: 'Hubballi North Sub-Division (ACP)',
    range: 'Northern Range (IGP Belagavi)',
    keywords: ['hubballi', 'hubli', 'dharwad', 'vidyanagar hubballi', 'gokul road'],
    pinCodes: ['580020', '580021', '580029', '580030'],
    latRange: [15.30, 15.48],
    lngRange: [75.05, 75.20]
  }
];

export class PoliceJurisdictionService {
  /**
   * Determine Police Division and Jurisdictional Station using AI (Gemini) or GIS Rule Engine fallback
   */
  static async determineJurisdiction(loc: LocationInput): Promise<AIJurisdictionResult> {
    const textBlob = `${loc.address || ''} ${loc.road || ''} ${loc.suburb || ''} ${loc.city || ''} ${loc.district || ''} ${loc.pinCode || ''}`.toLowerCase();

    // 1. Try Gemini AI if API Key is configured
    const apiKey = getEffectiveGeminiKey();
    if (apiKey) {
      try {
        const aiResult = await this.queryGeminiJurisdiction(apiKey, loc, textBlob);
        if (aiResult) {
          return aiResult;
        }
      } catch (err) {
        console.warn('AI Gemini jurisdiction lookup failed, using local GIS engine:', err);
      }
    }

    // 2. Intelligent Offline GIS & Pin Code Matcher
    return this.resolveByGISEngine(loc, textBlob);
  }

  private static async queryGeminiJurisdiction(
    apiKey: string,
    loc: LocationInput,
    textBlob: string
  ): Promise<AIJurisdictionResult | null> {
    const prompt = `You are the Karnataka State Police (KSP) GIS Jurisdiction Intelligence Agent.
Given this incident location in Karnataka, India:
- Latitude: ${loc.latitude}
- Longitude: ${loc.longitude}
- Address: ${loc.address || 'Unknown'}
- Road/Area: ${loc.road || loc.suburb || 'Unknown'}
- City: ${loc.city || 'Bengaluru'}
- Pin Code: ${loc.pinCode || 'Unknown'}

Identify the exact Karnataka State Police jurisdiction. Respond ONLY in valid JSON with these exact keys:
{
  "policeDistrictOrDivision": "e.g. Bengaluru City - South-East Division",
  "jurisdictionalStation": "e.g. HSR Layout Police Station",
  "subDivision": "e.g. Madiwala Sub-Division (ACP)",
  "policeRange": "e.g. Bengaluru City Police Commissionerate",
  "rationale": "1-sentence explanation of why coordinates and area belong to this division and station",
  "confidence": 95
}`;

    const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-3.5-flash-lite'];
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 300 }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (parsed.policeDistrictOrDivision && parsed.jurisdictionalStation) {
              return {
                policeDistrictOrDivision: parsed.policeDistrictOrDivision,
                jurisdictionalStation: parsed.jurisdictionalStation,
                subDivision: parsed.subDivision || 'Jurisdictional Sub-Division',
                policeRange: parsed.policeRange || 'Karnataka State Police Command',
                rationale: parsed.rationale || `Location coordinates (${loc.latitude.toFixed(4)}° N, ${loc.longitude.toFixed(4)}° E) mapped to ${parsed.policeDistrictOrDivision}.`,
                confidence: parsed.confidence || 94,
                source: 'ai_gemini'
              };
            }
          }
        }
      } catch {
        continue;
      }
    }
    return null;
  }

  private static resolveByGISEngine(loc: LocationInput, textBlob: string): AIJurisdictionResult {
    const lat = loc.latitude;
    const lng = loc.longitude;
    const pin = (loc.pinCode || '').trim();

    // 1. Check keyword and Pin Code matches
    for (const rule of DIVISION_RULES) {
      if (pin && rule.pinCodes.includes(pin)) {
        return {
          policeDistrictOrDivision: rule.division,
          jurisdictionalStation: rule.stations[0],
          subDivision: rule.subDivision,
          policeRange: rule.range,
          rationale: `Pin Code ${pin} officially registers under ${rule.division} (${rule.subDivision}).`,
          confidence: 96,
          source: 'gis_rule_engine'
        };
      }

      for (const kw of rule.keywords) {
        if (textBlob.includes(kw)) {
          // Find closest matching station if keyword is station-specific
          const matchedStation = rule.stations.find(st => st.toLowerCase().includes(kw)) || rule.stations[0];
          return {
            policeDistrictOrDivision: rule.division,
            jurisdictionalStation: matchedStation,
            subDivision: rule.subDivision,
            policeRange: rule.range,
            rationale: `Incident locality '${kw.toUpperCase()}' falls under ${rule.division} jurisdiction (${rule.subDivision}).`,
            confidence: 92,
            source: 'gis_rule_engine'
          };
        }
      }
    }

    // 2. Check Coordinate Bounding Boxes
    for (const rule of DIVISION_RULES) {
      if (
        lat >= rule.latRange[0] &&
        lat <= rule.latRange[1] &&
        lng >= rule.lngRange[0] &&
        lng <= rule.lngRange[1]
      ) {
        return {
          policeDistrictOrDivision: rule.division,
          jurisdictionalStation: rule.stations[0],
          subDivision: rule.subDivision,
          policeRange: rule.range,
          rationale: `Incident GPS coordinates (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E) intersect the bounding jurisdiction of ${rule.division}.`,
          confidence: 88,
          source: 'gis_rule_engine'
        };
      }
    }

    // 3. District / City fallback
    if (textBlob.includes('mysuru') || textBlob.includes('mysore')) {
      return {
        policeDistrictOrDivision: 'Mysuru City Police Commissionerate',
        jurisdictionalStation: 'Devaraja Police Station',
        subDivision: 'Devaraja Sub-Division (ACP)',
        policeRange: 'Southern Range',
        rationale: 'Location matched to Mysuru City metropolitan policing zone.',
        confidence: 85,
        source: 'gis_rule_engine'
      };
    }
    if (textBlob.includes('mangaluru') || textBlob.includes('mangalore')) {
      return {
        policeDistrictOrDivision: 'Mangaluru City Police Commissionerate',
        jurisdictionalStation: 'Mangaluru North (Bunder) Police Station',
        subDivision: 'Mangaluru Central Sub-Division (ACP)',
        policeRange: 'Western Range',
        rationale: 'Location matched to Mangaluru coastal commissionerate zone.',
        confidence: 85,
        source: 'gis_rule_engine'
      };
    }

    // Default Central Bengaluru Command fallback
    return {
      policeDistrictOrDivision: 'Bengaluru City - Central Division',
      jurisdictionalStation: 'Central Jurisdictional Police Station',
      subDivision: 'Central Sub-Division (ACP)',
      policeRange: 'Bengaluru City Police Commissionerate',
      rationale: `GPS coordinates (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E) routed to Karnataka Central Police Command pending field jurisdiction verification.`,
      confidence: 80,
      source: 'gis_rule_engine'
    };
  }
}
