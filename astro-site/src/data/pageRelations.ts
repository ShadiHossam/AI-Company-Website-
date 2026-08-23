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
  { industry: { path: '/industries/real-estate', label: 'Real Estate' }, services: [
    { path: '/services/ai-agents/for-real-estate', label: 'AI Agents for Real Estate' },
    { path: '/services/ai-automation/real-estate', label: 'Real Estate Automation' },
  ]},
  { industry: { path: '/industries/property-management', label: 'Property Management' }, services: [
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/industries/construction', label: 'Construction' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/interior-fitout', label: 'Interior Design & Fit-Out' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/industries/engineering-consultancies', label: 'Engineering Consultancies' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-strategy', label: 'AI Strategy Consulting' },
  ]},
  { industry: { path: '/industries/healthcare', label: 'Healthcare' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/industries/healthcare-clinics', label: 'Medical Clinics' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/dental-clinics', label: 'Dental Clinics' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/industries/aesthetic-clinics', label: 'Aesthetic & Derma Clinics' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/industries/pharmacies', label: 'Pharmacies' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/industries/fitness-gyms', label: 'Gyms & Fitness Studios' }, services: [
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/beauty-salons', label: 'Salons & Spas' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/retail', label: 'Retail' }, services: [
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/ecommerce', label: 'E-Commerce' }, services: [
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/restaurants', label: 'Restaurants' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/car-dealerships', label: 'Car Dealerships' }, services: [
    { path: '/services/ai-agents/sales', label: 'AI Sales Agents' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/travel-agencies', label: 'Travel Agencies' }, services: [
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/event-management', label: 'Event Management' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/industries/consulting', label: 'Professional Services' }, services: [
    { path: '/services/ai-strategy', label: 'AI Strategy Consulting' },
    { path: '/services/ai-automation/agencies', label: 'Automation for Agencies' },
  ]},
  { industry: { path: '/industries/legal', label: 'Legal' }, services: [
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/finance-banking', label: 'Finance & Banking' }, services: [
    { path: '/services/ai-automation/finance', label: 'Finance Automation' },
    { path: '/services/ai-compliance-uae', label: 'AI Compliance in the UAE' },
  ]},
  { industry: { path: '/industries/accounting-firms', label: 'Accounting Firms' }, services: [
    { path: '/services/ai-automation/accounting', label: 'Accounting Automation' },
    { path: '/services/ai-integration', label: 'AI Integration' },
  ]},
  { industry: { path: '/industries/insurance', label: 'Insurance' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/coworking-business-setup', label: 'Business Setup Consultancies' }, services: [
    { path: '/services/ai-automation/free-zone', label: 'Free Zone Business Automation' },
    { path: '/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/industries/marketing', label: 'Marketing' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-agents/sales', label: 'AI Sales Agents' },
  ]},
  { industry: { path: '/industries/marketing-agencies', label: 'Marketing Agencies' }, services: [
    { path: '/services/ai-automation/agencies', label: 'Automation for Agencies' },
    { path: '/services/ai-agents/agencies', label: 'AI Agents for Agencies' },
  ]},
  { industry: { path: '/industries/hr-recruitment', label: 'HR & Recruitment' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/logistics', label: 'Logistics' }, services: [
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/industries/last-mile-delivery', label: 'Last-Mile Delivery' }, services: [
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/industries/facilities-management', label: 'Facilities Management' }, services: [
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/services/ai-agents', label: 'AI Agents' },
  ]},
  { industry: { path: '/industries/cleaning-services', label: 'Cleaning Services' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
  ]},
  { industry: { path: '/industries/auto-service', label: 'Auto Service Centres' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/security-services', label: 'Security & Manpower' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/trading-distribution', label: 'Trading & Distribution' }, services: [
    { path: '/services/ai-automation/procurement', label: 'Procurement Automation' },
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
  ]},
  { industry: { path: '/industries/manufacturing', label: 'Manufacturing' }, services: [
    { path: '/services/ai-automation/operations', label: 'Operations Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/hospitality', label: 'Hospitality' }, services: [
    { path: '/services/ai-agents/receptionist', label: 'AI Receptionist' },
    { path: '/services/ai-agents/customer-support', label: 'AI Customer Support Agents' },
  ]},
  { industry: { path: '/industries/education', label: 'Education' }, services: [
    { path: '/services/ai-automation', label: 'AI Automation' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
  { industry: { path: '/industries/training-institutes', label: 'Training Institutes' }, services: [
    { path: '/services/ai-training', label: 'AI Training & Workshops' },
    { path: '/services/ai-automation', label: 'AI Automation' },
  ]},
  { industry: { path: '/industries/it-msp', label: 'IT Service Providers' }, services: [
    { path: '/services/ai-integration', label: 'AI Integration' },
    { path: '/services/custom-ai-development', label: 'Custom AI Development' },
  ]},
];
