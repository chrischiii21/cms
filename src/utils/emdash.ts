export interface HeroSection {
  hero_headline: string;
  hero_subheadline: string;
  primary_cta_text: string;
  primary_cta_link: string;
}

export interface StatItem {
  stat_number: string;
  stat_label: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  icon?: string;
}

export interface PrincipleItem {
  title: string;
  description: string;
}

export interface InvestmentDiscipline {
  section_title: string;
  principles: PrincipleItem[];
}

export interface TargetAudience {
  dos: string[];
  donts: string[];
}

export interface ScheduleSection {
  section_title: string;
  section_subtitle: string;
  intro_title: string;
  intro_desc: string;
  intro_link: string;
  deep_dive_title: string;
  deep_dive_desc: string;
  deep_dive_link: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FooterSection {
  footer_text: string;
  legal_disclaimers: string;
  contact_info: {
    email: string;
    phone: string;
    address: string;
  };
}

export interface LandingPageData {
  hero: HeroSection;
  stats: StatItem[];
  approach: ServiceItem[];
  discipline: InvestmentDiscipline;
  audience: TargetAudience;
  schedule: ScheduleSection;
  faqs: FAQItem[];
  footer: FooterSection;
}

import rawFallbackData from '../data/emdash.json';
const STATIC_FALLBACK_DATA = rawFallbackData as LandingPageData;


/**
 * Fetches landing page data from the Emdash CMS API if configured,
 * otherwise falls back to the premium static data.
 */
export async function fetchLandingPageData(): Promise<LandingPageData> {
  const apiUrl = import.meta.env.EMDASH_API_URL;
  const apiKey = import.meta.env.EMDASH_API_KEY;

  if (!apiUrl) {
    // Graceful fallback when no API URL is configured
    return STATIC_FALLBACK_DATA;
  }

  try {
    const response = await fetch(`${apiUrl}/api/content/landing-page`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {})
      }
    });

    if (!response.ok) {
      console.warn(`Emdash CMS API returned status ${response.status}. Using fallback static data.`);
      return STATIC_FALLBACK_DATA;
    }

    const data = await response.json();
    
    // Validate response structure loosely, fall back if malformed
    if (!data || typeof data !== "object") {
      console.warn("Emdash CMS API returned invalid JSON structure. Using fallback static data.");
      return STATIC_FALLBACK_DATA;
    }

    // Merge API data with fallback data to ensure any missing fields are filled
    return {
      hero: { ...STATIC_FALLBACK_DATA.hero, ...data.hero },
      stats: Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : STATIC_FALLBACK_DATA.stats,
      approach: Array.isArray(data.approach) && data.approach.length > 0 ? data.approach : STATIC_FALLBACK_DATA.approach,
      discipline: {
        section_title: data.discipline?.section_title || STATIC_FALLBACK_DATA.discipline.section_title,
        principles: Array.isArray(data.discipline?.principles) && data.discipline.principles.length > 0
          ? data.discipline.principles
          : STATIC_FALLBACK_DATA.discipline.principles
      },
      audience: {
        dos: Array.isArray(data.audience?.dos) && data.audience.dos.length > 0 ? data.audience.dos : STATIC_FALLBACK_DATA.audience.dos,
        donts: Array.isArray(data.audience?.donts) && data.audience.donts.length > 0 ? data.audience.donts : STATIC_FALLBACK_DATA.audience.donts
      },
      schedule: {
        section_title: data.schedule?.section_title || STATIC_FALLBACK_DATA.schedule.section_title,
        section_subtitle: data.schedule?.section_subtitle || STATIC_FALLBACK_DATA.schedule.section_subtitle,
        intro_title: data.schedule?.intro_title || STATIC_FALLBACK_DATA.schedule.intro_title,
        intro_desc: data.schedule?.intro_desc || STATIC_FALLBACK_DATA.schedule.intro_desc,
        intro_link: data.schedule?.intro_link || STATIC_FALLBACK_DATA.schedule.intro_link,
        deep_dive_title: data.schedule?.deep_dive_title || STATIC_FALLBACK_DATA.schedule.deep_dive_title,
        deep_dive_desc: data.schedule?.deep_dive_desc || STATIC_FALLBACK_DATA.schedule.deep_dive_desc,
        deep_dive_link: data.schedule?.deep_dive_link || STATIC_FALLBACK_DATA.schedule.deep_dive_link
      },
      faqs: Array.isArray(data.faqs) && data.faqs.length > 0 ? data.faqs : STATIC_FALLBACK_DATA.faqs,
      footer: {
        footer_text: data.footer?.footer_text || STATIC_FALLBACK_DATA.footer.footer_text,
        legal_disclaimers: data.footer?.legal_disclaimers || STATIC_FALLBACK_DATA.footer.legal_disclaimers,
        contact_info: {
          email: data.footer?.contact_info?.email || STATIC_FALLBACK_DATA.footer.contact_info.email,
          phone: data.footer?.contact_info?.phone || STATIC_FALLBACK_DATA.footer.contact_info.phone,
          address: data.footer?.contact_info?.address || STATIC_FALLBACK_DATA.footer.contact_info.address
        }
      }
    };
  } catch (error) {
    console.error("Failed to fetch from Emdash CMS API:", error);
    return STATIC_FALLBACK_DATA;
  }
}
