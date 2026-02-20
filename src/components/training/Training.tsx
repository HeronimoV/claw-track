import { useState } from 'react';

interface Section {
  icon: string;
  title: string;
  items: { title: string; content: string }[];
}

const SECTIONS: Section[] = [
  {
    icon: '🎯',
    title: 'Sales Scripts & Cold Calling',
    items: [
      {
        title: 'Universal Cold Call Opening',
        content: `**Pattern Interrupt:** "Hey [Name], this is [Your Name] with ClawStart — I know I'm catching you out of the blue, so I'll be quick."

**Purpose Statement:** "I help [industry] businesses automate the stuff that eats up 15-20 hours a week — lead follow-up, scheduling, client communication. Most owners I talk to are losing money to missed calls and slow response times."

**Engagement Question:** "Quick question — how are you currently handling after-hours leads and client inquiries?"

**Key Rules:**
- Stand up before every call — they can hear your energy
- First 7 seconds determine everything
- Never ask "Is this a good time?" — assume authority
- Match their pace and tone within 10 seconds`,
      },
      {
        title: 'Real Estate Cold Call',
        content: `"Hey [Name], quick question — how many leads came into your brokerage last month that didn't get a response within 5 minutes? Studies show responding within 5 minutes makes you **21x more likely to convert**. What if every lead got an instant, personalized response — 24/7?"

**Pain Points:** Leads fall through cracks, 10-15 hrs/week on admin, calendar chaos, inconsistent follow-up.`,
      },
      {
        title: 'Law Firm Cold Call',
        content: `"[Name], every hour your attorneys spend on intake forms and scheduling is an hour they're not billing at $300+. What if your intake, scheduling, and client updates ran themselves — 24/7, no extra staff?"

**Pain Points:** Non-billable admin time, missed intake calls (40%+ after hours), client communication gaps, compliance overhead.`,
      },
      {
        title: 'Dental/Medical Cold Call',
        content: `"Quick question — what's your no-show rate running right now? Most practices I work with were at 15-20% before AI reminders. We typically cut that in half within 30 days."

**Pain Points:** No-shows, front desk overload, insurance follow-up, staff turnover ($5-8K per replacement).`,
      },
      {
        title: 'Gatekeeper Scripts',
        content: `**Receptionist Block:** "Totally understand — [Name] is busy. This is actually about saving their team 15-20 hours a week on admin work. Could you let them know [Your Name] from ClawStart called? I'll also shoot over a quick email."

**"Send info" Deflection:** "Happy to — but to send something relevant, I need 60 seconds with [Name] to understand their workflow. Otherwise I'm just sending a generic brochure, which isn't helpful for anyone."

**Voicemail Script:** "Hey [Name], [Your Name] with ClawStart. I work with [industry] businesses in [area] to automate operations — lead follow-up, scheduling, client communication. Most save 15-20 hours a week. Worth a quick chat to see if it applies to your business. My number is [number]. Again, that's [Your Name], [number]."`,
      },
    ],
  },
  {
    icon: '🔍',
    title: 'Discovery & Demo',
    items: [
      {
        title: 'Discovery Call Blueprint',
        content: `**Structure (30 min):**
1. **Rapport & Agenda** (3 min) — "I want to learn about your business, share what we do, and see if there's a fit."
2. **Situation Questions** (5 min) — Current tools, team size, daily workflow
3. **Problem Questions** (10 min) — "What's your biggest operational bottleneck?" "What happens when you miss a lead?"
4. **Implication Questions** (5 min) — "What does that cost you monthly?" "What happens if nothing changes in 6 months?"
5. **Need-Payoff** (5 min) — "If we could cut that admin time in half, what would that mean for your team?"
6. **Next Steps** (2 min) — Book the demo. Always.`,
      },
      {
        title: 'SPIN Selling Questions',
        content: `**Situation:** "Walk me through what happens when a new lead comes in." / "How many people handle client communication?"
**Problem:** "Where do things fall through the cracks?" / "What takes the most time that you wish was automated?"
**Implication:** "When leads don't get a response for hours, how many do you lose?" / "What's the cost of replacing a front desk person?"
**Need-Payoff:** "If every lead got a response in under 5 minutes, how would that impact your close rate?" / "What would you do with 15 extra hours per week?"`,
      },
      {
        title: 'Demo Flow',
        content: `1. **Recap their pain** — "Last time you mentioned [specific problem]. Let me show you exactly how we solve that."
2. **Live walkthrough** — Show real workflows for THEIR use case, not generic
3. **ROI moment** — "That task your team spends 3 hours on daily? Watch this."
4. **Social proof** — "A [similar business] saw [specific result] in the first month."
5. **Collison Install** — "Want me to set up a basic version right now? Takes 15 minutes."
6. **Close or book close** — "Based on what you've seen, does this make sense for [Company]?"`,
      },
    ],
  },
  {
    icon: '💪',
    title: 'Objection Handling',
    items: [
      {
        title: 'Price Objections',
        content: `**"It's too expensive"**
→ "Compared to what? A part-time admin is $2,000/month and can't work nights. This is $250/month and works 24/7. What's the ROI on just 2 more closed deals per year?"

**"We don't have the budget"**
→ "I hear you. Let me ask — how much are you spending on the problem this solves? Most clients find ClawStart pays for itself in month one through time saved and leads captured."

**"Competitor X is cheaper"**
→ "They might be — but are they building custom workflows for YOUR business, or selling a template? We deploy in 2 weeks with done-for-you setup. What's your time worth?"`,
      },
      {
        title: 'Timing Objections',
        content: `**"Not the right time"**
→ "Totally understand. Quick question — when IS the right time? Because every month without this, you're leaving [specific $] on the table. What if we start small with a 7-day pilot?"

**"We need to think about it"**
→ "Of course. What specifically do you need to think through? Let me address those right now so you have everything you need to make a decision."

**"Call me next quarter"**
→ "Happy to — but what changes next quarter? If anything, starting now means you're optimized before your busy season. Let me show you the pilot program."`,
      },
      {
        title: 'Trust & Tech Objections',
        content: `**"Does it actually work?"**
→ "Let me prove it. I'll set up a basic version right now — you'll see it working before we hang up. No commitment needed."

**"What about data security?"**
→ "All data is encrypted, access-controlled, and we sign NDAs. Your data is safer with automated systems than with human error and sticky notes."

**"We already use [other tool]"**
→ "Great — ClawStart integrates with your existing tools. It doesn't replace your CRM, it supercharges it. Think of it as the employee who actually keeps your CRM updated."`,
      },
    ],
  },
  {
    icon: '🏆',
    title: 'Closing Techniques',
    items: [
      {
        title: 'Core Closes',
        content: `**Assumptive Close:** "So we'll get you started with the Growth plan — should I send the agreement to this email or a different one?"

**Alternative Close:** "Would you prefer to start with the full deployment this month, or begin with the 7-day pilot first?"

**Urgency Close:** "We have 2 onboarding slots left for this month. After that, the next available start date is [3 weeks out]. Want me to lock one in?"

**Collison Install Close:** "Let me set this up right now while we're on the call — you'll see it working in 15 minutes. If you love it, we formalize. If not, nothing lost."

**ROI Close:** "You said missed leads cost you roughly $8,000/month. This is $250/month. Even if we only capture 10% of what you're missing, that's a 3:1 return. When do you want to start?"

**Puppy Dog Close (7-Day Pilot):** "Use it for a week. If you don't love it, walk away. But I'm betting you won't want to give it back."`,
      },
    ],
  },
  {
    icon: '📊',
    title: 'Pipeline & Process',
    items: [
      {
        title: 'Pipeline Stages',
        content: `1. **Prospecting** — Research, list building (10 min max per prospect)
2. **First Contact** — Cold call + email + LinkedIn (7-touch cadence over 30 days)
3. **Discovery** — Qualify with BANT, understand pain, book demo
4. **Demo/Proposal** — Live demo, Collison Install, send proposal within 24 hrs
5. **Negotiation** — Handle objections, offer pilot if needed
6. **Closed Won** — Signed agreement, begin onboarding
7. **Closed Lost** — Document reason, add to re-engagement nurture`,
      },
      {
        title: 'Follow-Up Cadence',
        content: `**7-Touch Cold Outreach (30 days):**
- Day 1: Call + Voicemail + Email
- Day 3: Email #2 (value-add, different angle)
- Day 5: Call #2
- Day 7: LinkedIn connection + message
- Day 10: Email #3 (case study or industry stat)
- Day 14: Call #3 + "breakup" email
- Day 21: Final email (re-engagement angle)

**Post-Demo Follow-Up:**
- Same day: Recap email with proposal
- Day 2: "Any questions?" check-in
- Day 5: Value-add (case study, ROI calculator)
- Day 7: Direct close attempt
- Day 14: Final follow-up or pilot offer`,
      },
      {
        title: 'Weekly Rhythm & KPIs',
        content: `**Daily:** 50+ dials, 20+ conversations, 3+ demos booked
**Weekly:** 15+ demos completed, 5+ proposals sent, 2+ closes
**Monthly KPIs:** $40K+ revenue, 60%+ demo-to-proposal rate, 40%+ proposal-to-close rate

**Weekly Schedule:**
- Mon: Pipeline review, week planning, power dial block
- Tue-Thu: Full dial blocks AM, demos PM
- Fri AM: Follow-ups & proposals, Fri PM: Pipeline cleanup & learning`,
      },
    ],
  },
  {
    icon: '⚔️',
    title: 'Competitive Intelligence',
    items: [
      {
        title: 'ClawStart vs. Competitors',
        content: `**Our Differentiators:**
- **Done-for-you deployment** — We build it FOR them, not hand them a tool
- **Collison Install** — Set up live on the call, they see it working immediately
- **Industry-specific** — Custom workflows per vertical, not one-size-fits-all
- **Human + AI** — We're the managed service layer, not just software
- **Speed** — 2-week deployment vs. months with enterprise tools
- **Price** — $250-750/mo vs. $2K+/mo for comparable services

**When they mention competitors:** "That's a great tool for [what it does]. The difference is we don't give you software and say 'good luck.' We build custom workflows for YOUR business and manage them. You get an operations team, not a login."`,
      },
      {
        title: 'Positioning Strategy',
        content: `**We are NOT:** A chatbot company, a SaaS tool, an AI toy
**We ARE:** An AI operations partner that deploys custom automation and manages it for you

**Elevator Pitch:** "ClawStart deploys AI assistants that handle your email, scheduling, lead follow-up, and client communication — 24/7. We set it up for you in 2 weeks, and it costs less than a part-time employee."

**The 10-Second Test:** If you can't explain what you do in 10 seconds, you'll lose them. Practice until it's effortless.`,
      },
    ],
  },
  {
    icon: '🚀',
    title: 'Growth Strategies',
    items: [
      {
        title: 'Referral Program',
        content: `**Client Referral:** 10% commission on first-year revenue for every referral that closes.
**Partner Referral:** MSPs, accountants, business coaches → formalize partnerships with rev share.
**Ask at these moments:** After positive ROI review, after compliment, after solving a problem quickly.
**Script:** "You mentioned this has been working well — do you know any other [industry] owners who'd benefit from the same thing? I'll take great care of them."`,
      },
      {
        title: 'AI Audit Lead Magnet',
        content: `**Offer:** "Free AI Operations Audit — we'll analyze your workflows and show you exactly where AI saves you 15+ hours/week."
- 30-minute call, structured assessment
- Deliver a 1-page report with specific automation opportunities
- Natural transition to proposal: "Want us to build this for you?"
**Conversion rate:** 40-60% of audits → proposals`,
      },
      {
        title: 'Local Domination Strategy',
        content: `**Own your city/region:**
- Target every business in your top 3 verticals within 50 miles
- Get 3-5 case studies per vertical per region
- Attend local chamber of commerce, BNI, industry meetups
- LinkedIn content targeting local business owners
- Google Business Profile optimized for "[city] AI automation"`,
      },
    ],
  },
  {
    icon: '📋',
    title: 'Industry Playbooks',
    items: [
      {
        title: 'Real Estate',
        content: `**Pitch:** Instant lead response 24/7, automated showing scheduling, transaction coordination
**Pain:** Leads die after 5 min, agents buried in admin (10-15 hrs/week), inconsistent follow-up
**ROI:** 2 extra closings/year = $16K revenue vs $8K annual cost. Time savings = $19-32K/year.`,
      },
      {
        title: 'Law Firms',
        content: `**Pitch:** Automated intake, scheduling, client updates — free attorneys to bill more hours
**Pain:** 40%+ calls after hours (missed intake), attorneys doing $25/hr admin work at $300+/hr rates
**ROI:** 5 extra billable hrs/week × $300/hr = $78K/year. One extra case/month from better intake = $5-50K.`,
      },
      {
        title: 'Dental/Medical',
        content: `**Pitch:** Cut no-shows in half, automate reminders & insurance follow-up, fix front desk bottleneck
**Pain:** 15-20% no-show rate, front desk overwhelmed, staff turnover ($5-8K per replacement)
**ROI:** Halving no-shows on 200 patients/month = 20 recovered appointments × $200 avg = $4K/month.`,
      },
      {
        title: 'Financial Advisory',
        content: `**Pitch:** Faster client onboarding, automated meeting prep, compliance-friendly communication
**Pain:** Each client worth $5-50K+/year in AUM fees, relationship-dependent, compliance overhead
**ROI:** Better follow-up retains 2-3 clients/year = $10-150K saved. Meeting prep automation = 5+ hrs/week.`,
      },
      {
        title: 'Marketing Agencies',
        content: `**Pitch:** Client communication automation, project tracking, lead nurture while you deliver
**Pain:** Juggling dozens of clients, client updates fall through cracks, new biz neglected during delivery
**ROI:** 1 new client/month from better follow-up = $2-10K MRR. Time saved = 15-20 hrs/week.`,
      },
      {
        title: 'B2B Sales / SaaS',
        content: `**Pitch:** CRM hygiene, lead scoring, automated follow-up sequences — every lead gets touched
**Pain:** Reps hate CRM data entry, leads go cold, inconsistent follow-up
**ROI:** 10% more leads converted from faster response = significant revenue lift.`,
      },
      {
        title: 'Construction',
        content: `**Pitch:** Bid follow-up, subcontractor communication, scheduling automation
**Pain:** 1-2 overwhelmed office staff, bid requests pile up, communication gaps
**ROI:** 2-3 more bids followed up/month = potentially $10-50K in new projects.`,
      },
      {
        title: 'E-Commerce',
        content: `**Pitch:** Customer service triage, vendor communication, order issue resolution
**Pain:** CS volume scales with orders, returns processing, inventory coordination
**ROI:** Faster CS response = better reviews = more sales. 15+ hrs/week saved.`,
      },
    ],
  },
];

const DOWNLOADS = [
  { name: 'Sales Training Manual', file: '/sales-training-manual.md' },
  { name: 'Sales Playbook', file: '/sales-playbook.md' },
  { name: 'Pipeline System', file: '/pipeline-system.md' },
  { name: 'Competitive Edge Playbook', file: '/competitive-edge-playbook.md' },
];

export default function Training() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSection = (i: number) => {
    const next = new Set(expanded);
    next.has(i) ? next.delete(i) : next.add(i);
    setExpanded(next);
  };

  const toggleItem = (key: string) => {
    const next = new Set(expandedItems);
    next.has(key) ? next.delete(key) : next.add(key);
    setExpandedItems(next);
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📚 Training & Resources</h1>
      </div>

      {/* Downloads */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">📥 Full Documents</h2>
        <div className="flex flex-wrap gap-3">
          {DOWNLOADS.map(d => (
            <a key={d.file} href={d.file} download className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition-all">
              📄 {d.name}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      {SECTIONS.map((section, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button onClick={() => toggleSection(i)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-all">
            <h2 className="text-base font-semibold text-gray-900">
              {section.icon} {section.title}
            </h2>
            <span className="text-gray-400 text-lg">{expanded.has(i) ? '▼' : '▶'}</span>
          </button>
          {expanded.has(i) && (
            <div className="px-5 pb-5 space-y-3">
              {section.items.map((item, j) => {
                const key = `${i}-${j}`;
                return (
                  <div key={key} className="border border-gray-100 rounded-lg overflow-hidden">
                    <button onClick={() => toggleItem(key)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-all">
                      <span className="text-sm font-medium text-gray-800">{item.title}</span>
                      <span className="text-gray-400 text-sm">{expandedItems.has(key) ? '−' : '+'}</span>
                    </button>
                    {expandedItems.has(key) && (
                      <div className="px-4 pb-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                        dangerouslySetInnerHTML={{
                          __html: item.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br/>')
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
