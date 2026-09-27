/**
 * ARK Clinic Consultation Pricing Configuration
 * Centralized pricing constants and helper functions.
 * Update these values when official clinic pricing changes.
 */

export interface ConsultationPricing {
  id: string;
  typeKey: 'video' | 'in_person' | 'home-visit' | 'telephonic';
  title: string;
  subtitle: string;
  priceInr: number;
  pricePaise: number;
  currency: string;
  badge?: string;
}

export const CLINIC_PRICING: Record<string, ConsultationPricing> = {
  'online-video': {
    id: 'online-video',
    typeKey: 'video',
    title: 'Online Video Consultation',
    subtitle: 'Secure HD video consultation with our specialist',
    priceInr: 499,
    pricePaise: 49900,
    currency: 'INR',
    badge: 'Popular',
  },
  'in-clinic': {
    id: 'in-clinic',
    typeKey: 'in_person',
    title: 'In-Clinic Consultation',
    subtitle: 'Visit ARK Clinic for comprehensive physical evaluation',
    priceInr: 399,
    pricePaise: 39900,
    currency: 'INR',
    badge: 'Standard',
  },
  'home-visit': {
    id: 'home-visit',
    typeKey: 'home-visit',
    title: 'Home Visit',
    subtitle: 'Dedicated medical care at your doorstep',
    priceInr: 699,
    pricePaise: 69900,
    currency: 'INR',
    badge: 'Specialized',
  },
  'telephonic': {
    id: 'telephonic',
    typeKey: 'telephonic',
    title: 'Telephonic Consultation',
    subtitle: 'Direct audio consultation with our physician',
    priceInr: 399,
    pricePaise: 39900,
    currency: 'INR',
    badge: 'Quick',
  },
};

/**
 * Retrieve pricing info by consultation mode ID or type key
 */
export const getPricingForMode = (modeId: string | null | undefined): ConsultationPricing => {
  if (!modeId) return CLINIC_PRICING['in-clinic'];
  
  if (CLINIC_PRICING[modeId]) {
    return CLINIC_PRICING[modeId];
  }

  // Alias lookup
  if (modeId === 'video') return CLINIC_PRICING['online-video'];
  if (modeId === 'in_person') return CLINIC_PRICING['in-clinic'];

  return CLINIC_PRICING['in-clinic'];
};

/**
 * Format currency amount into Indian Rupee string (e.g., ₹499)
 */
export const formatInr = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};
