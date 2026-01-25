# License

Sekha is available under a **dual license** structure: open source for personal and non-commercial use, and commercial licensing for businesses.

---

## Open Source License (AGPL-3.0)

**For personal, educational, and non-commercial use**

Sekha is licensed under the [GNU Affero General Public License v3.0 (AGPL-3.0)](https://www.gnu.org/licenses/agpl-3.0.en.html).

### What This Means

✅ **You CAN:**

- Use Sekha freely for personal projects
- Use Sekha in educational settings (universities, boot camps, courses)
- Modify the source code for your own needs
- Deploy Sekha on your own infrastructure
- Contribute improvements back to the project
- Use Sekha in open-source projects (also under AGPL or compatible licenses)

⚠️ **You MUST:**

- **Disclose source code** - If you modify Sekha, you must make your modifications available under AGPL-3.0
- **Provide network access** - If you run a modified version on a server (e.g., SaaS), you must provide users access to the modified source code
- **Preserve copyright notices** - Keep all existing copyright and license notices intact
- **License derivatives under AGPL** - Any derivative work must also be licensed under AGPL-3.0

❌ **You CANNOT:**

- Use Sekha in **commercial/proprietary software** without a commercial license
- Offer Sekha as a **paid service** without a commercial license
- Use Sekha in a **closed-source commercial product**
- Remove or modify license notices

---

## Commercial License

**For businesses, SaaS providers, and proprietary software**

If you want to:

- 💼 Use Sekha in a commercial product without releasing your source code
- ☁️ Offer Sekha as a paid SaaS service
- 🔒 Keep your modifications private
- 🛡️ Receive dedicated support and SLAs
- 🚢 Get priority feature development

**Contact us for a commercial license:**

- **Email:** [licensing@sekha.dev](mailto:licensing@sekha.dev)
- **Website:** [sekha.dev/licensing](https://sekha.dev/licensing)

### Commercial License Benefits

✅ **Use Sekha in closed-source products** - No obligation to disclose your source code  
✅ **Offer Sekha as a service** - Build SaaS products on top of Sekha  
✅ **Keep modifications private** - Your changes remain proprietary  
✅ **Dedicated support** - Priority email/Slack support  
✅ **Custom feature development** - We can build features for your use case  
✅ **Legal protection** - Indemnification and warranty coverage  
✅ **Influence roadmap** - Input on future development priorities  

### Pricing

Commercial licensing is priced based on:

- **Team size** - Number of developers/users
- **Deployment scale** - Self-hosted vs. SaaS, traffic volume
- **Support level** - Standard vs. enterprise support
- **Feature requirements** - Custom development needs

**Contact us for a quote:** [licensing@sekha.dev](mailto:licensing@sekha.dev)

---

## Why Dual Licensing?

### Sustaining Open Source Development

Sekha is a complex, production-grade system that requires ongoing development, maintenance, and support. The dual license model allows us to:

1. **Keep the core open source** - Individual developers, researchers, and students can use Sekha freely
2. **Fund development** - Commercial licenses provide revenue to sustain full-time development
3. **Prevent exploitation** - Companies using Sekha to generate revenue should contribute back financially or via code
4. **Ensure quality** - Commercial support contracts fund testing, security audits, and documentation

### Fair Use Examples

✅ **Free (AGPL-3.0):**

- Personal AI assistant for your own use
- University research project studying AI memory
- Open-source chatbot framework (also licensed under AGPL)
- Internal company tool with source code disclosed to employees
- Non-profit organization managing volunteer knowledge

❌ **Requires Commercial License:**

- SaaS product: "AI Memory as a Service" (paid subscriptions)
- Enterprise software with Sekha embedded (closed-source)
- Consulting firm deploying Sekha for clients (without code disclosure)
- Mobile app using Sekha backend (sold on app stores)
- Startup building a proprietary AI platform with Sekha

---

## Frequently Asked Questions

### Can I use Sekha at my company?

**Yes**, if:

- It's for **internal use only** (not customer-facing)
- You disclose the source code (including modifications) to your employees
- Your company is non-profit or educational

**No (requires commercial license)**, if:

- You're building a **product or service** for customers
- You want to keep your modifications **private**
- You're offering Sekha as a **paid service**

---

### Can I contribute to Sekha?

**Absolutely!** We welcome contributions.

By contributing, you agree to:

- License your contributions under AGPL-3.0
- Grant Sekha AI the right to relicense your contributions under commercial licenses (dual licensing)

This ensures we can continue offering both open-source and commercial options.

See [CONTRIBUTING.md](https://github.com/sekha-ai/sekha-controller/blob/main/CONTRIBUTING.md) for details.

---

### Can I fork Sekha and create a proprietary version?

**No**, not without a commercial license.

Under AGPL-3.0, any fork or derivative work must also be licensed under AGPL-3.0, meaning:

- You must disclose your source code
- If you run it on a server, users must have access to the source
- You cannot sell it as closed-source software

If you want to create a proprietary version, contact us for a commercial license.

---

### What about the SDKs and MCP server?

All Sekha components follow the same dual license:

- **sekha-controller** (Rust core): AGPL-3.0 / Commercial
- **sekha-llm-bridge** (Python LLM ops): AGPL-3.0 / Commercial
- **sekha-python-sdk**: AGPL-3.0 / Commercial
- **sekha-js-sdk**: AGPL-3.0 / Commercial
- **sekha-mcp**: AGPL-3.0 / Commercial
- **sekha-vscode**: AGPL-3.0 / Commercial
- **sekha-cli**: AGPL-3.0 / Commercial

If you need a commercial license for the controller, it covers all ecosystem components.

---

### How does AGPL differ from MIT or Apache licenses?

**MIT/Apache** (permissive):

- ✅ Use in closed-source products without disclosure
- ✅ No requirement to contribute back
- ❌ No protection against proprietary forks

**AGPL-3.0** (copyleft):

- ❌ Cannot use in closed-source products (without commercial license)
- ✅ Ensures improvements benefit the community
- ✅ **Network copyleft** - Even SaaS usage requires source disclosure

**Why we chose AGPL:**

We want individuals and researchers to use Sekha freely, while ensuring companies that profit from Sekha either:

1. Contribute back to open source (via code disclosure), OR
2. Support development financially (via commercial license)

---

### Can I use Sekha in a GPLv3 project?

**Yes!** AGPL-3.0 is compatible with GPLv3.

Your project must be licensed under GPLv3 or AGPL-3.0, and you must comply with both licenses' requirements.

---

### Can I use Sekha in an MIT-licensed project?

**No**, not for the combined work.

AGPL-3.0 is **not compatible** with permissive licenses like MIT or Apache when you distribute the combined work. The entire project would need to be under AGPL-3.0.

**Alternative:** Get a commercial license, which allows integration with MIT/Apache projects without AGPL obligations.

---

### What if I'm a startup or indie developer?

We offer **discounted commercial licenses** for:

- 🌱 **Startups** (<10 employees, <$1M revenue)
- 👤 **Indie developers** (solo founders, side projects)
- 🎓 **Educational institutions** (universities, boot camps)

Contact us: [licensing@sekha.dev](mailto:licensing@sekha.dev)

---

### Can I self-host Sekha without a commercial license?

**Yes**, as long as:

- It's for **personal or internal use**
- You're not offering it as a **paid service** to others
- If modified, you provide source access to users (AGPL requirement)

**Example allowed:** Running Sekha on your own server for your personal AI assistant  
**Example not allowed:** Offering "Sekha Hosting as a Service" to customers (requires commercial license)

---

## License Text

### AGPL-3.0 Full Text

The complete AGPL-3.0 license text is available at:

- **Official AGPL-3.0:** [https://www.gnu.org/licenses/agpl-3.0.en.html](https://www.gnu.org/licenses/agpl-3.0.en.html)
- **Sekha LICENSE file:** [https://github.com/sekha-ai/sekha-controller/blob/main/LICENSE](https://github.com/sekha-ai/sekha-controller/blob/main/LICENSE)

### Copyright Notice

```
Copyright (c) 2025-2026 Sekha AI Project

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
```

---

## Contact

**Licensing Questions:**  
[licensing@sekha.dev](mailto:licensing@sekha.dev)

**General Inquiries:**  
[hello@sekha.dev](mailto:hello@sekha.dev)

**Website:**  
[sekha.dev](https://sekha.dev)

---

## Summary

| Use Case | License Required |
|----------|------------------|
| Personal AI assistant | AGPL-3.0 (free) |
| Academic research | AGPL-3.0 (free) |
| Open-source project (AGPL) | AGPL-3.0 (free) |
| Internal company tool (source disclosed) | AGPL-3.0 (free) |
| SaaS product for customers | **Commercial** |
| Closed-source commercial software | **Commercial** |
| Consulting/agency deploying for clients | **Commercial** |
| Mobile/desktop app (paid) | **Commercial** |

**When in doubt:** Contact us at [licensing@sekha.dev](mailto:licensing@sekha.dev) - we're happy to help clarify your use case!
