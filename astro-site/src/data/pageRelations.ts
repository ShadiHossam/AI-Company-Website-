export interface RelatedLink {
  path: string;
  label: string;
}

export interface IndustryServiceRelation {
  industry: RelatedLink;
  services: RelatedLink[];
}

/**
 * Maps each industry page to the 2 most relevant service pages. Authored in
 * one direction only: RelatedPages.astro (via getRelatedLinks in
 * src/lib/internalLinks.ts) does the reverse lookup automatically, so a
 * service page shows the industries that named it without needing a second
 * entry here. Prefer a specific service subpage (e.g.
 * "/services/ai-automation/real-estate") over the generic top-level service
 * page when one exists for that industry.
 */
export const INDUSTRY_SERVICE_RELATIONS: IndustryServiceRelation[] = [
  { industry: { path: '/en/ae/industries/real-estate', label: 'Real Estate' }, services: [
    { path: '/en/ae/services/ai-agents/for-real-estate', label: 'AI Agents for Real Estate' },
    { path: '/en/ae/services/ai-automation/real-estate', label: 'Real Estate Automation' },
  ]},
  { industry: { path: '/en/ae/industries/property-management', label: 'Property Management' }, services: [
    { path: '/en/ae/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/en/ae/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/en/ae/industries/construction', label: 'Construction' }, services: [
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
    { path: '/en/ae/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/en/ae/industries/interior-fitout', label: 'Interior Design & Fit-Out' }, services: [
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
    { path: '/en/ae/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/en/ae/industries/engineering-consultancies', label: 'Engineering Consultancies' }, services: [
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
    { path: '/en/ae/services/ai-strategy', label: 'AI Strategy Consulting' },
  ]},
  { industry: { path: '/en/ae/industries/healthcare', label: 'Healthcare' }, services: [
    { path: '/en/ae/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/en/ae/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/en/ae/industries/healthcare-clinics', label: 'Medical Clinics' }, services: [
    { path: '/en/ae/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/en/ae/industries/dental-clinics', label: 'Dental Clinics' }, services: [
    { path: '/en/ae/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/en/ae/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/en/ae/industries/aesthetic-clinics', label: 'Aesthetic & Derma Clinics' }, services: [
    { path: '/en/ae/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/en/ae/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/en/ae/industries/pharmacies', label: 'Pharmacies' }, services: [
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
    { path: '/en/ae/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/en/ae/industries/fitness-gyms', label: 'Gyms & Fitness Studios' }, services: [
    { path: '/en/ae/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/en/ae/industries/beauty-salons', label: 'Salons & Spas' }, services: [
    { path: '/en/ae/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/en/ae/industries/retail', label: 'Retail' }, services: [
    { path: '/en/ae/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/en/ae/industries/ecommerce', label: 'E-Commerce' }, services: [
    { path: '/en/ae/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/en/ae/industries/restaurants', label: 'Restaurants' }, services: [
    { path: '/en/ae/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/en/ae/industries/car-dealerships', label: 'Car Dealerships' }, services: [
    { path: '/en/ae/services/ai-agents/sales', label: 'AI Sales Agents' },
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/en/ae/industries/travel-agencies', label: 'Travel Agencies' }, services: [
    { path: '/en/ae/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/en/ae/industries/event-management', label: 'Event Management' }, services: [
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
    { path: '/en/ae/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/en/ae/industries/consulting', label: 'Professional Services' }, services: [
    { path: '/en/ae/services/ai-strategy', label: 'AI Strategy Consulting' },
    { path: '/en/ae/services/ai-automation/agencies', label: 'Automation for Agencies' },
  ]},
  { industry: { path: '/en/ae/industries/legal', label: 'Legal' }, services: [
    { path: '/en/ae/services/custom-ai-development', label: 'Custom AI Development' },
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/en/ae/industries/finance-banking', label: 'Finance & Banking' }, services: [
    { path: '/en/ae/services/ai-automation/finance', label: 'Finance Automation' },
    { path: '/en/ae/services/ai-compliance-uae', label: 'AI Compliance in the UAE' },
  ]},
  { industry: { path: '/en/ae/industries/accounting-firms', label: 'Accounting Firms' }, services: [
    { path: '/en/ae/services/ai-automation/accounting', label: 'Accounting Automation' },
    { path: '/en/ae/services/ai-integration', label: 'AI Integration' },
  ]},
  { industry: { path: '/en/ae/industries/insurance', label: 'Insurance' }, services: [
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
    { path: '/en/ae/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/en/ae/industries/coworking-business-setup', label: 'Business Setup Consultancies' }, services: [
    { path: '/en/ae/services/ai-automation/free-zone', label: 'Free Zone Business Automation' },
    { path: '/en/ae/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/en/ae/industries/marketing', label: 'Marketing' }, services: [
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
    { path: '/en/ae/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/en/ae/industries/marketing-agencies', label: 'Marketing Agencies' }, services: [
    { path: '/en/ae/services/ai-automation/agencies', label: 'Automation for Agencies' },
    { path: '/en/ae/services/ai-agents/agencies', label: 'AI Agents for Agencies' },
  ]},
  { industry: { path: '/en/ae/industries/hr-recruitment', label: 'HR & Recruitment' }, services: [
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
    { path: '/en/ae/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/en/ae/industries/logistics', label: 'Logistics' }, services: [
    { path: '/en/ae/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/en/ae/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/en/ae/industries/last-mile-delivery', label: 'Last-Mile Delivery' }, services: [
    { path: '/en/ae/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/en/ae/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/en/ae/industries/facilities-management', label: 'Facilities Management' }, services: [
    { path: '/en/ae/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/en/ae/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/en/ae/industries/cleaning-services', label: 'Cleaning Services' }, services: [
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
    { path: '/en/ae/services/ai-agents/receptionist', label: 'AI Receptionist' },
  ]},
  { industry: { path: '/en/ae/industries/auto-service', label: 'Auto Service Centres' }, services: [
    { path: '/en/ae/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/en/ae/industries/security-services', label: 'Security & Manpower' }, services: [
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
    { path: '/en/ae/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/en/ae/industries/trading-distribution', label: 'Trading & Distribution' }, services: [
    { path: '/en/ae/services/ai-automation/procurement', label: 'Procurement Automation' },
    { path: '/en/ae/services/ai-automation/operations', label: 'Operations Automation' },
  ]},
  { industry: { path: '/en/ae/industries/manufacturing', label: 'Manufacturing' }, services: [
    { path: '/en/ae/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/en/ae/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/en/ae/industries/hospitality', label: 'Hospitality' }, services: [
    { path: '/en/ae/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/en/ae/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/en/ae/industries/education', label: 'Education' }, services: [
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
    { path: '/en/ae/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/en/ae/industries/training-institutes', label: 'Training Institutes' }, services: [
    { path: '/en/ae/services/ai-training', label: 'AI Training & Workshops' },
    { path: '/en/ae/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/en/ae/industries/it-msp', label: 'IT Service Providers' }, services: [
    { path: '/en/ae/services/ai-integration', label: 'AI Integration' },
    { path: '/en/ae/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
];
