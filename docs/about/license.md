# License

## Dual Licensing Model

Sekha uses a **fair dual-license model** designed to support both open-source principles and sustainable development.

---

## Free & Open Source License

### AGPL-3.0 (GNU Affero General Public License v3.0)

**Who Can Use It Free:**

- ✅ **Individuals** - Personal projects, learning, experimentation
- ✅ **Students & Academics** - Research, education, coursework
- ✅ **Non-Profits** - Charitable organizations, NGOs
- ✅ **Small Businesses** - Companies with fewer than 50 employees
- ✅ **Open Source Projects** - Building on Sekha with compatible licenses

**Key Terms:**

1. **Free Forever** - No usage limits, no feature restrictions, no time limits
2. **Modify Freely** - Change, extend, and customize the code as needed
3. **Share Modifications** - If you distribute modified versions, you must:
   - Publish your modifications under AGPL-3.0
   - Provide source code to users
   - Maintain copyright and license notices
4. **Network Use = Distribution** - If you run a modified Sekha service that others access over a network, you must make your source code available

**What You Can Build:**

- Commercial products (if you open-source derivative works)
- SaaS applications (if you publish modifications)
- Internal tools (no distribution = no requirement to publish)
- Research prototypes
- Educational materials

**Example Use Cases:**

!!! example "Individual Developer"
    Sarah builds a personal AI assistant using Sekha for her career-spanning notes. She uses the LLM bridge and adds custom summarization logic.
    
    **License Status:** Free under AGPL-3.0 ✅  
    **Requirement:** None (personal use, not distributed)

!!! example "Startup (40 Employees)"
    TechCorp uses Sekha internally to power their customer support AI agents. They modify the context assembly algorithm and deploy it on their servers.
    
    **License Status:** Free under AGPL-3.0 ✅  
    **Requirement:** Internal use only - no publication needed

!!! example "Open Source SaaS"
    MemoryCloud builds a hosted Sekha service and makes their modifications public on GitHub under AGPL-3.0.
    
    **License Status:** Free under AGPL-3.0 ✅  
    **Requirement:** Publish modifications (already doing so) ✅

---

## Commercial License

### Sekha Enterprise License

**Who Needs a Commercial License:**

- ⚖️ **Large Companies** - 50+ employees
- ⚖️ **AI Vendors** - Companies building LLM products (OpenAI, Anthropic, etc.)
- ⚖️ **Closed-Source SaaS** - Want to offer Sekha without publishing modifications
- ⚖️ **Cloud Providers** - AWS, Azure, GCP offering managed Sekha
- ⚖️ **Enterprises** - Need legal certainty, indemnification, or support SLAs

### Pricing Tiers

**Usage-Based, Not Per-Seat** - Fair pricing that scales with your actual usage:

| Tier | Organization Size | Annual Price | Included API Calls | Overage Cost |
|------|------------------|--------------|-------------------|-------------|
| **Startup** | 51-200 employees | $5,000/year | 10 million/year | $0.001/call |
| **Business** | 201-1,000 employees | $25,000/year | 100 million/year | $0.0005/call |
| **Enterprise** | 1,000+ employees | $100,000/year | 500 million/year | $0.0002/call |
| **AI Vendor** | LLM providers | Custom pricing | Unlimited | Revenue share |

!!! info "Why Usage-Based?"
    We believe in fair pricing. You shouldn't pay per seat when only 20% of your organization uses Sekha. You pay for what you actually use.

### What You Get

**Legal Certainty:**

- ✅ Perpetual commercial use rights
- ✅ No copyleft obligations
- ✅ No source code publication requirements
- ✅ Legal indemnification
- ✅ Patent grant

**Enterprise Features:**

- ✅ Priority support (SLA-backed)
- ✅ Security patches & updates
- ✅ Architecture consultation
- ✅ Custom feature development (Enterprise tier)
- ✅ On-premise deployment assistance
- ✅ Compliance documentation (HIPAA, SOC2, ISO 27001)

**Deployment Flexibility:**

- Self-hosted on your infrastructure
- Managed cloud deployment
- Hybrid deployments
- Air-gapped environments

---

## Frequently Asked Questions

### Do I need a license for internal use?

**No, if you're under 50 employees.** AGPL-3.0 allows internal use without distribution requirements.

**Yes, if you're 50+ employees.** Commercial license provides legal clarity for enterprise use.

### What counts as "distribution"?

 Under AGPL-3.0, **network use counts as distribution**. If external users access your Sekha deployment:

- ✅ **Internal-only:** Your employees use Sekha → No distribution
- ⚠️ **External SaaS:** Customers use your Sekha-powered service → Distribution
- ⚠️ **API access:** Third parties call your modified Sekha API → Distribution

If you distribute, you must publish your modifications under AGPL-3.0.

### Can I build a SaaS product with Sekha?

**Yes, in two ways:**

1. **Open-Source SaaS:** Publish your modifications under AGPL-3.0 (free)
2. **Closed-Source SaaS:** Get a commercial license (paid)

### What if I exceed my API call limit?

Overages are charged automatically at the published per-call rate. No surprises—you'll receive monthly usage reports.

### Can I switch from AGPL to Commercial later?

**Yes!** Contact us anytime. We'll backdate the license to your first deployment date (no retroactive fees for internal use).

### Do you offer startup discounts?

Yes. Startups under 2 years old with <$1M revenue qualify for 50% off the first year.

### What about government/education/non-profit use?

**Educational institutions and non-profits:** Free under AGPL-3.0, regardless of size.

**Government agencies:** Contact us for public sector pricing.

---

## Revenue Allocation

We're committed to transparency. Here's how commercial license revenue is used:

- **50%** - Core development team (hire full-time maintainers)
- **25%** - Community grants (contributor bounties, open-source sponsorships)
- **15%** - Infrastructure (CI/CD, hosting, testing, documentation)
- **10%** - Legal & governance (trademark protection, compliance audits)

All financials are published quarterly via [Open Collective](https://opencollective.com/sekha).

---

## Alternative Funding

We also accept:

- **GitHub Sponsors:** Individual donations
- **Open Collective:** Transparent community funding
- **Corporate Sponsorships:** Logo placement, prioritized feature requests
- **Grants:** Mozilla, NLNet, GitHub Accelerator, university research grants

---

## How to Get a Commercial License

### Step 1: Contact Sales

Email: [hello@sekha.dev](mailto:hello@sekha.dev)

Include:

- Company name and size (employee count)
- Expected usage (API calls/month estimate)
- Deployment model (cloud, on-premise, hybrid)
- Timeline for production use

### Step 2: License Agreement

We'll send a standard enterprise license agreement. Legal review typically takes 1-2 weeks.

### Step 3: License Key

Upon agreement signature, you'll receive:

- Enterprise license key (JWT format)
- Support portal access
- Architecture consultation session

### Step 4: Deployment

Add your license key to `config.toml`:

```toml
[license]
key = "sekha_enterprise_your-key-here"
```

The controller validates the key and unlocks enterprise features.

---

## Enforcement

### AGPL Enforcement

We use standard DMCA takedowns for AGPL violations:

1. Detect violation (non-compliance, closed-source distribution)
2. Request compliance (15-day cure period)
3. Legal action if necessary

### Commercial License Enforcement

**Audit Rights:** Enterprise tier customers grant annual audit rights to verify usage.

**Grace Period:** 30 days to purchase a license if accidental non-compliance is discovered.

**Good Faith:** We work with companies to resolve licensing issues fairly.

---

## Open Source Philosophy

We believe:

- **Your data is your intellectual property** - No vendor should own your AI memories
- **Open source drives innovation** - The best ideas come from collaborative development
- **Sustainable funding enables quality** - Commercial licenses fund long-term maintenance
- **Fairness matters** - Small users shouldn't subsidize large enterprises

---

## Questions?

Email: [hello@sekha.dev](mailto:hello@sekha.dev)  
License FAQ: [https://docs.sekha.dev/troubleshooting/faq](../troubleshooting/faq.md)  
Community: [Discord](https://discord.gg/sekha)

---

<div class="license-badges">
  <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="AGPL-3.0">
  <img src="https://img.shields.io/badge/Commercial-Available-green.svg" alt="Commercial License Available">
</div>

*Last updated: January 2026*
