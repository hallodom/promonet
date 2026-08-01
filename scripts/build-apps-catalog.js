#!/usr/bin/env node
/**
 * Builds src/data/apps.json from:
 *  - ComparEdge open products API (CC BY 4.0)
 *  - scripts/seed-niche-apps.json
 *  - tools listed in src/data/matrix.json
 *  - a large builtin long-tail SaaS list
 *
 * Offline-safe: if fetch fails, still writes from local sources.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const COMPAREDGE_URL = 'https://comparedge.com/api/products'

/** @type {{ name: string, category: string, aliases?: string[] }[]} */
const EXTRA_APPS = [
  // CRM / Sales
  ['Salesforce Sales Cloud', 'CRM'], ['Salesforce Service Cloud', 'CRM'], ['Oracle CX', 'CRM'],
  ['SAP Sales Cloud', 'CRM'], ['SugarCRM', 'CRM'], ['Vtiger', 'CRM'], ['Bitrix24', 'CRM'],
  ['Less Annoying CRM', 'CRM'], ['OnePageCRM', 'CRM'], ['Nutshell', 'CRM'], ['Pipeline CRM', 'CRM'],
  ['Salesflare', 'CRM'], ['noCRM.io', 'CRM'], ['Really Simple Systems', 'CRM'], ['CapsuleHQ', 'CRM'],
  ['Zendesk Sell', 'CRM'], ['Pipedrive Leadbooster', 'CRM'], ['Apollo.io', 'CRM'], ['Outreach', 'CRM'],
  ['Salesloft', 'CRM'], ['Gong', 'CRM'], ['Chorus', 'CRM'], ['Clari', 'CRM'], ['People.ai', 'CRM'],
  ['Clearbit', 'CRM'], ['ZoomInfo', 'CRM'], ['Lusha', 'CRM'], ['Hunter.io', 'CRM'], ['Lemlist', 'CRM'],
  ['Reply.io', 'CRM'], ['Woodpecker', 'CRM'], ['Instantly', 'CRM'], ['Smartlead', 'CRM'],
  // Accounting / Finance
  ['QuickBooks Enterprise', 'Accounting'], ['Sage Business Cloud', 'Accounting'], ['Kashoo', 'Accounting'],
  ['ZipBooks', 'Accounting'], ['Manager.io', 'Accounting'], ['GnuCash', 'Accounting'],
  ['Patriot Accounting', 'Accounting'], ['Zoho Books', 'Accounting'], ['Zoho Invoice', 'Accounting'],
  ['Harvest Forecast', 'Accounting'], ['Float', 'Accounting'], ['Pulse', 'Accounting'],
  ['Fathom', 'Accounting'], ['Spotlight Reporting', 'Accounting'], ['Jirav', 'Accounting'],
  ['Planful', 'Accounting'], ['Adaptive Insights', 'Accounting'], ['Anaplan', 'Accounting'],
  ['Coupa', 'Accounting'], ['Tipalti', 'Accounting'], ['Routable', 'Accounting'], ['Pleo', 'Accounting'],
  ['Brex', 'Accounting'], ['Ramp', 'Accounting'], ['Divvy', 'Accounting'], ['Airbase', 'Accounting'],
  ['Spendesk', 'Accounting'], ['Emburse', 'Accounting'], ['Concur', 'Accounting'], ['Certify', 'Accounting'],
  ['Avalara', 'Accounting'], ['TaxJar', 'Accounting'], ['Vertex', 'Accounting'],
  // Mortgage / Lending
  ['Calyx Path', 'Mortgage'], ['Mortgage Cadence', 'Mortgage'], ['LoanOrigination.com', 'Mortgage'],
  ['Tavant', 'Mortgage'], ['Temenos', 'Mortgage'], ['Finastra', 'Mortgage'], ['Black Knight', 'Mortgage'],
  ['ICE Mortgage Technology', 'Mortgage'], ['Arive', 'Mortgage'], ['LoanFactory', 'Mortgage'],
  ['BeSmartee', 'Mortgage'], ['Maxwell', 'Mortgage'], ['MortgageHippo', 'Mortgage'],
  ['LoanLogics', 'Mortgage'], ['ComplianceEase', 'Mortgage'], ['Ellie Mae Compass', 'Mortgage'],
  ['MeridianLink', 'Mortgage'], ['LoanScorecard', 'Mortgage'], ['LoanBeam Verify', 'Mortgage'],
  ['Docutech', 'Mortgage'], ['ClosingCorp', 'Mortgage'], ['SoftPro', 'Mortgage'],
  ['Qualia', 'Mortgage'], ['ResWare', 'Mortgage'], ['RamQuest', 'Mortgage'],
  // Legal
  ['Thomson Reuters HighQ', 'Legal'], ['Relativity', 'Legal'], ['Everlaw', 'Legal'],
  ['Logikcull', 'Legal'], ['Disco', 'Legal'], ['CS Disco', 'Legal'], ['iManage', 'Legal'],
  ['NetDocuments', 'Legal'], ['Worldox', 'Legal'], ['Litera', 'Legal'], ['ContractPodAi', 'Legal'],
  ['Ironclad', 'Legal'], ['DocuSign CLM', 'Legal'], ['LinkSquares', 'Legal'], ['Spellbook', 'Legal'],
  ['CoCounsel', 'Legal'], ['Harvey AI', 'Legal'], ['Casetext', 'Legal'], ['Westlaw', 'Legal'],
  ['LexisNexis', 'Legal'], ['Fastcase', 'Legal'], ['Docketwise', 'Legal'], ['ImmigrationTracker', 'Legal'],
  ['PracticePanther Billing', 'Legal'], ['Tabs3', 'Legal'], ['PCLaw', 'Legal'], ['Juris', 'Legal'],
  ['Centerbase', 'Legal'], ['GrowPath', 'Legal'], ['Case Status', 'Legal'], ['MyCase Intake', 'Legal'],
  // Dental / Medical niches
  ['Curve Hero', 'Dental'], ['Denticon', 'Dental'], ['MacPractice', 'Dental'],
  ['AbelDent', 'Dental'], ['ClearDent', 'Dental'], ['Tracker', 'Dental'], ['EXACT', 'Dental'],
  ['SOE Exact', 'Dental'], ['PracticeWEB', 'Dental'], ['DentalSymphony', 'Dental'],
  ['YAPI', 'Dental'], ['Legwork', 'Dental'], ['Demandforce', 'Dental'], ['Lighthouse 360', 'Dental'],
  ['PatientPop', 'Healthcare'], ['Doctible', 'Healthcare'], ['NexHealth', 'Healthcare'],
  ['Solutionreach Dental', 'Dental'], ['Modento', 'Dental'], ['Dental Intelligence', 'Dental'],
  ['Archy', 'Dental'], ['Dentally Practice', 'Dental'], ['Pearl AI', 'Dental'],
  ['Overjet', 'Dental'], ['VideaHealth', 'Dental'], ['Diagnocat', 'Dental'],
  // Real estate
  ['RE/MAX Ignite', 'Real Estate'], ['Keller Williams Command', 'Real Estate'],
  ['eXp Collaboration Hub', 'Real Estate'], ['Compass CRM', 'Real Estate'],
  ['MoxiWorks', 'Real Estate'], ['Inside Real Estate', 'Real Estate'],
  ['Brivity', 'Real Estate'], ['Ylopo', 'Real Estate'], ['Structurely', 'Real Estate'],
  ['Homebot', 'Real Estate'], ['SmartZip', 'Real Estate'], ['Propertybase', 'Real Estate'],
  ['Salesforce Real Estate Cloud', 'Real Estate'], ['Rex', 'Real Estate'],
  ['ListReports', 'Real Estate'], ['CMA Wizard', 'Real Estate'], ['Cloud CMA', 'Real Estate'],
  ['RPR', 'Real Estate'], ['Realist', 'Real Estate'], ['CoreLogic', 'Real Estate'],
  ['ATTOM', 'Real Estate'], ['HouseCanary', 'Real Estate'], ['Redfin Partner', 'Real Estate'],
  ['ShowingTime Plus', 'Real Estate'], ['ShowingDesk', 'Real Estate'],
  ['Skyslope Forms', 'Real Estate'], ['TransactionManager', 'Real Estate'],
  // Home services / Field service
  ['Jobber Plus', 'Home Services'], ['ServiceTitan Phones', 'Home Services'],
  ['ServiceFusion', 'Home Services'], ['FieldPulse', 'Home Services'],
  ['FieldAware', 'Home Services'], ['ServiceDesk Plus', 'Home Services'],
  ['Fergus', 'Home Services'], ['Tradify', 'Home Services'], ['AroFlo', 'Home Services'],
  ['ServiceM8 Plus', 'Home Services'], ['GorillaDesk', 'Home Services'],
  ['ZenMaid', 'Home Services'], ['Launch27', 'Home Services'], ['MaidCentral', 'Home Services'],
  ['LawnPro Software', 'Home Services'], ['Real Green', 'Home Services'],
  ['LMN', 'Home Services'], ['Arborgold', 'Home Services'], ['SingleOps', 'Home Services'],
  ['Aspire', 'Home Services'], ['PestPac', 'Home Services'], ['FieldRoutes', 'Home Services'],
  ['GorillaDesk Pest', 'Home Services'], ['ServiceCEO', 'Home Services'],
  ['Improveit 360', 'Home Services'], ['LeadPerfection', 'Home Services'],
  ['MarketSharp', 'Home Services'], ['SalesRabbit', 'Home Services'],
  // Agency / Creative
  ['FunctionFox', 'Agency'], ['Mavenlink', 'Agency'], ['Kantata', 'Agency'],
  ['BigTime', 'Agency'], ['Kimble', 'Agency'], ['Projector PSA', 'Agency'],
  ['Ten Thousand Feet', 'Agency'], ['Resource Guru', 'Agency'], ['Float.com', 'Agency'],
  ['Forecast.app', 'Agency'], ['Runn', 'Agency'], ['10000ft', 'Agency'],
  ['Agencybloc', 'Agency'], ['Function Point X', 'Agency'], ['WorkflowMax', 'Agency'],
  ['StudioCloud', 'Creative'], ['StudioPlus', 'Creative'], ['Fundy Designer', 'Creative'],
  ['Aftershoot', 'Creative'], ['Imagen AI', 'Creative'], ['Lightroom', 'Creative'],
  ['Capture One', 'Creative'], ['Pic-Time', 'Creative'], ['CloudSpot', 'Creative'],
  ['Pass', 'Creative'], ['Proof', 'Creative'], ['Carousel', 'Creative'],
  // Recruitment
  ['iCIMS', 'Recruitment'], ['Taleo', 'Recruitment'], ['SuccessFactors', 'Recruitment'],
  ['Workday Recruiting', 'Recruitment'], ['SmartRecruiters', 'Recruitment'],
  ['Jobvite', 'Recruitment'], ['Greenhouse Harvest', 'Recruitment'],
  ['LeverTRM', 'Recruitment'], ['Gem', 'Recruitment'], ['SeekOut', 'Recruitment'],
  ['HireEZ', 'Recruitment'], ['LinkedIn Recruiter', 'Recruitment'],
  ['Indeed Hire', 'Recruitment'], ['ZipRecruiter', 'Recruitment'],
  ['Manatal', 'Recruitment'], ['Recruiterbox', 'Recruitment'], ['Comeet', 'Recruitment'],
  ['Pinpoint', 'Recruitment'], ['Teamtailor', 'Recruitment'], ['Personio', 'Recruitment'],
  // Manufacturing / Inventory
  ['SAP Business One', 'Manufacturing'], ['SAP S/4HANA', 'Manufacturing'],
  ['Epicor', 'Manufacturing'], ['Infor', 'Manufacturing'], ['Syspro', 'Manufacturing'],
  ['Plex', 'Manufacturing'], ['JobBOSS', 'Manufacturing'], ['Global Shop Solutions', 'Manufacturing'],
  ['E2 Shop System', 'Manufacturing'], ['Shoptech E2', 'Manufacturing'],
  ['Odoo Manufacturing', 'Manufacturing'], ['Odoo Inventory', 'Manufacturing'],
  ['Ordoro', 'Manufacturing'], ['SkuVault', 'Manufacturing'], ['Skubana', 'Manufacturing'],
  ['Brightpearl', 'Manufacturing'], ['Linnworks', 'Manufacturing'], ['ChannelAdvisor', 'Manufacturing'],
  ['SellerCloud', 'Manufacturing'], ['Veeqo', 'Manufacturing'], ['ShipHero', 'Manufacturing'],
  ['Easyship', 'Manufacturing'], ['Pirate Ship', 'Manufacturing'], ['UPS WorldShip', 'Manufacturing'],
  // Ecommerce
  ['Shopify Plus', 'Ecommerce'], ['Shopify POS', 'Ecommerce'], ['PrestaShop', 'Ecommerce'],
  ['OpenCart', 'Ecommerce'], ['Volusion', 'Ecommerce'], ['Shift4Shop', 'Ecommerce'],
  ['Big Cartel', 'Ecommerce'], ['Ecwid', 'Ecommerce'], ['Sellfy', 'Ecommerce'],
  ['Gumroad', 'Ecommerce'], ['Lemon Squeezy', 'Ecommerce'], ['Paddle', 'Ecommerce'],
  ['FastSpring', 'Ecommerce'], ['Chargebee', 'Ecommerce'], ['Recurly', 'Ecommerce'],
  ['Zuora', 'Ecommerce'], ['Maxio', 'Ecommerce'], ['Stripe Billing', 'Ecommerce'],
  ['ReCharge', 'Ecommerce'], ['Bold Subscriptions', 'Ecommerce'], ['Ordergroove', 'Ecommerce'],
  ['Yotpo', 'Ecommerce'], ['Okendo', 'Ecommerce'], ['Loox', 'Ecommerce'],
  ['Judge.me', 'Ecommerce'], ['Stamped.io', 'Ecommerce'], ['Klaviyo SMS', 'Ecommerce'],
  ['Attentive', 'Ecommerce'], ['Postscript', 'Ecommerce'], ['Smartrr', 'Ecommerce'],
  // Marketing
  ['HubSpot Marketing Hub', 'Marketing'], ['Marketo', 'Marketing'], ['Pardot', 'Marketing'],
  ['Eloqua', 'Marketing'], ['Braze', 'Marketing'], ['Iterable', 'Marketing'],
  ['Customer.io', 'Marketing'], ['Omnisend', 'Marketing'], ['Drip', 'Marketing'],
  ['GetResponse', 'Marketing'], ['AWeber', 'Marketing'], ['Moosend', 'Marketing'],
  ['MailerLite', 'Marketing'], ['Emma', 'Marketing'], ['Benchmark Email', 'Marketing'],
  ['Unbounce', 'Marketing'], ['Instapage', 'Marketing'], ['Leadpages', 'Marketing'],
  ['ClickFunnels', 'Marketing'], ['Kartra', 'Marketing'], ['Kajabi', 'Marketing'],
  ['Teachable', 'Marketing'], ['Thinkific', 'Marketing'], ['Podia', 'Marketing'],
  ['Canva', 'Marketing'], ['Figma', 'Marketing'], ['Adobe Creative Cloud', 'Marketing'],
  ['Visme', 'Marketing'], ['Piktochart', 'Marketing'], ['Crello', 'Marketing'],
  ['CapCut', 'Marketing'], ['Descript', 'Marketing'], ['Riverside', 'Marketing'],
  // Scheduling / Booking
  ['Calendly Teams', 'Scheduling'], ['OnceHub', 'Scheduling'], ['ScheduleOnce', 'Scheduling'],
  ['Book Like A Boss', 'Scheduling'], ['Appointlet', 'Scheduling'], ['TimeTrade', 'Scheduling'],
  ['Shore', 'Scheduling'], ['Timely', 'Scheduling'], ['TimelyApp', 'Scheduling'],
  ['10to8', 'Scheduling'], ['Booksy', 'Scheduling'], ['Fresha', 'Scheduling'],
  ['Styleseat', 'Scheduling'], ['GlossGenius', 'Scheduling'], ['Square Appointments', 'Scheduling'],
  // Communication / Support
  ['Zendesk Support', 'Communication'], ['Zendesk Chat', 'Communication'],
  ['Freshchat', 'Communication'], ['Crisp', 'Communication'], ['Tidio', 'Communication'],
  ['LiveChat', 'Communication'], ['Olark', 'Communication'], ['Drift', 'Communication'],
  ['Qualified', 'Communication'], ['Clearbit Reveal', 'Communication'],
  ['Dialpad', 'Communication'], ['Nextiva', 'Communication'], ['8x8', 'Communication'],
  ['Vonage', 'Communication'], ['Grasshopper', 'Communication'], ['Google Voice', 'Communication'],
  ['WhatsApp Business', 'Communication'], ['Telegram Business', 'Communication'],
  ['Sinch', 'Communication'], ['MessageBird', 'Communication'], ['Bandwidth', 'Communication'],
  // Productivity / Collab
  ['Confluence', 'Productivity'], ['SharePoint', 'Productivity'], ['Quip', 'Productivity'],
  ['Craft', 'Productivity'], ['Roam Research', 'Productivity'], ['Obsidian', 'Productivity'],
  ['Logseq', 'Productivity'], ['Reflect', 'Productivity'], ['Mem', 'Productivity'],
  ['Miro', 'Productivity'], ['Mural', 'Productivity'], ['FigJam', 'Productivity'],
  ['Lucidchart', 'Productivity'], ['Whimsical', 'Productivity'], ['Excalidraw', 'Productivity'],
  ['Loom', 'Productivity'], ['Vidyard', 'Productivity'], ['Screencastify', 'Productivity'],
  // Project management
  ['Azure DevOps', 'Project Management'], ['GitHub Projects', 'Project Management'],
  ['GitLab', 'Project Management'], ['Shortcut', 'Project Management'], ['Clubhouse', 'Project Management'],
  ['Pivotal Tracker', 'Project Management'], ['Targetprocess', 'Project Management'],
  ['Aha!', 'Project Management'], ['Productboard', 'Project Management'],
  ['Pendo', 'Project Management'], ['Amplitude Experiment', 'Project Management'],
  ['LaunchDarkly', 'Project Management'], ['Optimizely', 'Project Management'],
  ['VWO', 'Project Management'], ['Hotjar Engage', 'Project Management'],
  // Automation / iPaaS
  ['Boomi', 'Automation'], ['MuleSoft', 'Automation'], ['Celigo', 'Automation'],
  ['Jitterbit', 'Automation'], ['SnapLogic', 'Automation'], ['Informatica', 'Automation'],
  ['Azure Logic Apps', 'Automation'], ['AWS AppFlow', 'Automation'],
  ['Cyclr', 'Automation'], ['Bolt', 'Automation'], ['Albato', 'Automation'],
  ['Integrately', 'Automation'], ['SyncSpider', 'Automation'], ['Unito', 'Automation'],
  ['Zapier Central', 'Automation'], ['Make AI Agents', 'Automation'],
  // Data / Analytics
  ['dbt', 'Data'], ['Fivetran', 'Data'], ['Airbyte', 'Data'], ['Stitch', 'Data'],
  ['Matillion', 'Data'], ['Talend', 'Data'], ['Alteryx', 'Data'], ['DataRobot', 'Data'],
  ['Mode', 'Data'], ['Hex', 'Data'], ['Observable', 'Data'], ['Superset', 'Data'],
  ['Redash', 'Data'], ['Grafana', 'Data'], ['Datadog', 'Data'], ['New Relic', 'Data'],
  ['Sentry', 'Data'], ['LogRocket', 'Data'], ['PostHog', 'Data'], ['Plausible', 'Data'],
  ['Fathom Analytics', 'Data'], ['Simple Analytics', 'Data'], ['Matomo', 'Data'],
  // HR / Payroll extras
  ['Workday HCM', 'Payroll'], ['UKG', 'Payroll'], ['Ultipro', 'Payroll'],
  ['Ceridian Dayforce', 'Payroll'], ['Paylocity', 'Payroll'], ['Paycom', 'Payroll'],
  ['Justworks', 'Payroll'], ['TriNet', 'Payroll'], ['Insperity', 'Payroll'],
  ['Zenefits', 'Payroll'], ['Namely', 'Payroll'], ['Hibob', 'Payroll'],
  ['Lattice', 'Payroll'], ['15Five', 'Payroll'], ['Culture Amp', 'Payroll'],
  ['Greenhouse Onboarding', 'Payroll'], ['WorkBright', 'Payroll'],
  // Property / Hospitality extras
  ['AppFolio Investment Management', 'Property Management'],
  ['Buildium Accounting', 'Property Management'], ['Rent Manager', 'Property Management'],
  ['PropertyRadar', 'Property Management'], ['Cozy', 'Property Management'],
  ['Avail', 'Property Management'], ['TurboTenant', 'Property Management'],
  ['Apartments.com', 'Property Management'], ['Zillow Rental Manager', 'Property Management'],
  ['Cloudbeds', 'Hospitality'], ['Opera PMS', 'Hospitality'], ['Mews', 'Hospitality'],
  ['RoomRaccoon', 'Hospitality'], ['Little Hotelier', 'Hospitality'],
  ['SiteMinder', 'Hospitality'], ['Cloudbeds MyAllocator', 'Hospitality'],
  // Misc SMB staples
  ['DocuSign eSignature', 'Productivity'], ['HelloSign', 'Productivity'], ['PandaDoc', 'Productivity'],
  ['Proposify', 'Productivity'], ['Qwilr', 'Productivity'], ['Better Proposals', 'Productivity'],
  ['Nitro Sign', 'Productivity'], ['Adobe Sign', 'Productivity'], ['SignNow', 'Productivity'],
  ['HelloSign Dropbox', 'Productivity'], ['BoldSign', 'Productivity'],
  ['Stripe Radar', 'Payments'], ['Stripe Tax', 'Payments'], ['Stripe Identity', 'Payments'],
  ['PayPal Complete Payments', 'Payments'], ['Venmo Business', 'Payments'],
  ['Cash App Business', 'Payments'], ['Wise Business', 'Payments'], ['Mercury', 'Payments'],
  ['Relay Financial', 'Payments'], ['Novo', 'Payments'], ['Bluevine', 'Payments'],
  // UK / EU niche
  ['FreeAgent Accounting', 'Accounting'], ['Crunch', 'Accounting'], ['Bright Accounting', 'Accounting'],
  ['QuickFile', 'Accounting'], ['Clear Books', 'Accounting'], ['IRIS Accounting', 'Accounting'],
  ['Sage 200', 'Accounting'], ['Iris OpenSpace', 'Accounting'], ['Xero Practice Manager', 'Accounting'],
  ['Receipt Bank Dext', 'Accounting'], ['AutoEntry', 'Accounting'], ['Hubdoc', 'Accounting'],
  ['Pennylane', 'Accounting'], ['Agicap', 'Accounting'], ['Sellsy', 'CRM'],
  ['Axonaut', 'CRM'], ['Evoliz', 'Accounting'], ['Indy France', 'Accounting'],
  // Construction
  ['Procore', 'Home Services'], ['PlanGrid', 'Home Services'], ['Bluebeam', 'Home Services'],
  ['Autodesk Construction IQ', 'Home Services'], ['Fieldwire', 'Home Services'],
  ['Buildertrend CRM', 'Home Services'], ['CoConstruct Pro', 'Home Services'],
  ['JobTread', 'Home Services'], ['Knowify', 'Home Services'], ['Stack', 'Home Services'],
  ['STACK Estimating', 'Home Services'], ['QUOTESoft', 'Home Services'],
  // Insurance / Finance niches
  ['AgencyBloc AMS', 'Insurance'], ['Applied Epic', 'Insurance'], ['Vertafore', 'Insurance'],
  ['HawkSoft', 'Insurance'], ['QQCatalyst', 'Insurance'], ['EZLynx', 'Insurance'],
  ['AMS360', 'Insurance'], ['Salesforce Financial Services Cloud', 'Insurance'],
  ['Guidewire', 'Insurance'], ['Duck Creek', 'Insurance'],
  // Education / Non-profit
  ['Blackbaud', 'Nonprofit'], ['Bloomerang', 'Nonprofit'], ['DonorPerfect', 'Nonprofit'],
  ['Neon CRM', 'Nonprofit'], ['Little Green Light', 'Nonprofit'], ['Kindful', 'Nonprofit'],
  ['Classy', 'Nonprofit'], ['Givebutter', 'Nonprofit'], ['Raisely', 'Nonprofit'],
  ['Canvas LMS', 'Education'], ['Blackboard', 'Education'], ['Moodle', 'Education'],
  ['Teachable School', 'Education'], ['Thinkific Plus', 'Education'],
  // Retail POS
  ['Shopify Retail', 'Ecommerce'], ['Lightspeed Retail', 'Ecommerce'],
  ['Square for Retail', 'Ecommerce'], ['Clover POS', 'Ecommerce'],
  ['Vend', 'Ecommerce'], ['Revel', 'Ecommerce'], ['TouchBistro Retail', 'Ecommerce'],
  ['NCR Silver', 'Ecommerce'], ['Heartland Retail', 'Ecommerce'],
  // More CRM / marketing long-tail
  ['Mautic', 'Marketing'], ['Ortto', 'Marketing'], ['Encharge', 'Marketing'],
  ['CustomerLabs', 'Marketing'], ['Hyperise', 'Marketing'], ['Mutiny', 'Marketing'],
  ['Warmly', 'Marketing'], ['Common Room', 'Marketing'], ['Pocus', 'Marketing'],
  ['Clay', 'Marketing'], ['rb2b', 'Marketing'], ['Factors.ai', 'Marketing'],
  ['Dreamdata', 'Marketing'], ['HockeyStack', 'Marketing'], ['Triblio', 'Marketing'],
  ['6sense', 'Marketing'], ['Demandbase', 'Marketing'], ['Terminus', 'Marketing'],
  // Vertical SMB long-tail
  ['Vetstoria', 'Healthcare'], ['ezyVet', 'Healthcare'], ['Instinct', 'Healthcare'],
  ['Shepherd Veterinary', 'Healthcare'], ['DaySmart Vet', 'Healthcare'],
  ['Mindbody Wellness', 'Healthcare'], ['Zenoti', 'Healthcare'], ['Boulevard', 'Healthcare'],
  ['Mangomint', 'Healthcare'], ['Squire', 'Healthcare'], ['Booker', 'Healthcare'],
  ['Phorest', 'Healthcare'], ['Shortcuts', 'Healthcare'], ['SalonIris', 'Healthcare'],
  ['Millenium', 'Healthcare'], ['Rosy Salon Software', 'Healthcare'],
  // Misc integrations people actually ask for
  ['Google Sheets', 'Productivity'], ['Google Drive', 'Productivity'],
  ['Microsoft Excel Online', 'Productivity'], ['Microsoft Outlook', 'Productivity'],
  ['Gmail', 'Productivity'], ['Yahoo Mail', 'Productivity'], ['iCloud Mail', 'Productivity'],
  ['Amazon S3', 'Data'], ['Azure Blob Storage', 'Data'], ['Google Cloud Storage', 'Data'],
  ['PostgreSQL', 'Data'], ['MySQL', 'Data'], ['MongoDB Atlas', 'Data'],
  ['Redis Cloud', 'Data'], ['Elasticsearch', 'Data'], ['Algolia', 'Data'],
  ['Typesense', 'Data'], ['Meilisearch', 'Data'],
  ['Webflow CMS', 'CMS'], ['Bubble', 'CMS'], ['Adalo', 'CMS'], ['Glide', 'CMS'],
  ['Softr', 'CMS'], ['Stacker', 'CMS'], ['Retool', 'CMS'], ['Appsmith', 'CMS'],
  ['Internal.io', 'CMS'], ['Budibase', 'CMS'],
  ['Custom API', 'Custom'], ['Webhook endpoint', 'Custom'], ['FTP / SFTP', 'Custom'],
  ['CSV export folder', 'Custom'], ['Shared network drive', 'Custom'],
  ['Microsoft Access', 'Custom'], ['FileMaker', 'Custom'], ['Lotus Notes', 'Custom'],
  ['AS400', 'Custom'], ['SAP ECC', 'Custom'], ['Oracle E-Business Suite', 'Custom'],
]

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function addApp(map, { name, category = 'Software', aliases = [] }) {
  if (!name || typeof name !== 'string') return
  const key = name.trim().toLowerCase()
  if (!key) return
  const existing = map.get(key)
  if (existing) {
    const aliasSet = new Set([...(existing.aliases || []), ...aliases])
    existing.aliases = [...aliasSet].filter((a) => a && a.toLowerCase() !== key)
    if (!existing.category || existing.category === 'Software') existing.category = category
    return
  }
  map.set(key, {
    name: name.trim(),
    slug: slugify(name.trim()),
    category,
    aliases: [...new Set(aliases)].filter((a) => a && a.toLowerCase() !== key),
  })
}

async function fetchComparEdge() {
  try {
    const res = await fetch(COMPAREDGE_URL, {
      headers: { Accept: 'application/json', 'User-Agent': 'promonet-catalog-builder/1.0' },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const products = data.products || data.tools || []
    console.log(`ComparEdge: fetched ${products.length} products`)
    return products
  } catch (err) {
    console.warn(`ComparEdge fetch skipped: ${err.message}`)
    return []
  }
}

function loadJson(relPath) {
  const full = path.join(root, relPath)
  if (!fs.existsSync(full)) return null
  return JSON.parse(fs.readFileSync(full, 'utf8'))
}

async function main() {
  const map = new Map()

  const comparedge = await fetchComparEdge()
  for (const p of comparedge) {
    if (p.discontinued) continue
    addApp(map, {
      name: p.name,
      category: p.categoryName || p.category || 'Software',
      aliases: p.slug ? [p.slug.replace(/-/g, ' ')] : [],
    })
  }

  const seed = loadJson('scripts/seed-niche-apps.json') || []
  for (const app of seed) addApp(map, app)

  const matrix = loadJson('src/data/matrix.json')
  if (matrix) {
    for (const crm of matrix.crms || []) {
      addApp(map, { name: crm.name, category: 'CRM', aliases: [crm.short, crm.slug].filter(Boolean) })
    }
    for (const [key, vertical] of Object.entries(matrix.verticals || {})) {
      const category = vertical.title || key
      for (const tool of vertical.tools || []) {
        addApp(map, { name: tool, category })
      }
    }
  }

  for (const [name, category] of EXTRA_APPS) {
    addApp(map, { name, category })
  }

  const apps = [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  const outPath = path.join(root, 'src/data/apps.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: apps.length,
        source: 'ComparEdge CC-BY-4.0 + Promonet niche seeds + matrix tools',
        apps,
      },
      null,
      2,
    ),
  )

  console.log(`Wrote ${apps.length} apps → ${path.relative(root, outPath)}`)
  if (apps.length < 1000) {
    console.warn(`Warning: catalog has ${apps.length} apps (target 1000+)`)
    process.exitCode = 0
  }
}

main()
