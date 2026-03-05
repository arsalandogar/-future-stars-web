---
name: laws-of-ux
description: >
  Apply the 30 Laws of UX (lawsofux.com) when reviewing, designing, or building user interfaces.
  Use this skill whenever the user asks to review UI/UX, audit a design, improve usability, build a
  new page or component, redesign an interface, or asks about UX principles. Also activate when you
  notice UI code that could benefit from UX improvements — even if the user doesn't explicitly mention
  "laws of UX" or "usability". Covers Hick's Law, Fitts's Law, Jakob's Law, Miller's Law, and 26
  other research-backed principles. This is about cognitive/behavioral UX principles, not visual
  design systems or accessibility audits.
---

# Laws of UX

Apply research-backed UX principles from [lawsofux.com](https://lawsofux.com) when reviewing or building interfaces. These 30 laws cover how people perceive, decide, remember, and interact — use them to catch usability issues and guide design decisions.

## Workflow

### 1. Analyze

Read the relevant UI code (components, pages, styles). Identify which UX laws apply — both violations and things done well. Reference `references/laws.md` for the full list with definitions, takeaways, and examples.

Focus on the laws most relevant to the specific UI. A simple button doesn't need all 30 laws examined. Common high-impact ones to check first:

- **Hick's Law** — Too many choices? Can options be reduced or staged?
- **Fitts's Law** — Are interactive targets large enough and close to where the user's attention is?
- **Jakob's Law** — Does this follow conventions users expect from similar products?
- **Miller's Law** — Is information chunked into digestible groups (aim for 5-9 items)?
- **Cognitive Load** — Is the interface asking the user to think too hard?
- **Doherty Threshold** — Will interactions feel responsive (<400ms)?
- **Peak-End Rule** — Are the most critical moments (and the end of a flow) handled well?
- **Tesler's Law** — Is complexity absorbed by the system rather than pushed to the user?

### 2. Present findings

Before making any changes, present a clear summary of findings to the user. Structure it as:

```
## UX Review

### Issues Found
1. **[Law Name]**: What's wrong and why it matters for the user.
   - Suggested fix: concrete, actionable change.

### What's Working Well
- Brief mention of good patterns already in place.

### Recommended Changes
- Prioritized list of changes, most impactful first.
```

Keep it practical — explain the "why" in plain language, not academic jargon. The law name gives credibility; the explanation gives understanding.

### 3. Implement after approval

Only make changes after the user approves. When implementing:

- Make the minimum changes needed to address the UX issue
- Don't refactor surrounding code or add unrelated improvements
- If a fix requires significant restructuring, flag it and let the user decide

## When building new UI

When creating new components or pages (not reviewing existing ones), weave these principles into the design naturally rather than producing a formal review. The most relevant laws for new builds:

- **Jakob's Law** — Follow established conventions. Don't reinvent navigation, form patterns, or common interactions.
- **Hick's Law** — Start simple. Progressive disclosure over showing everything at once.
- **Law of Proximity / Common Region** — Group related elements visually. Use spacing and containers meaningfully.
- **Fitts's Law** — Make primary actions large and easy to reach. Don't put destructive actions next to constructive ones.
- **Postel's Law** — Be forgiving with user input. Accept variations, give clear feedback.
- **Serial Position Effect** — Put the most important items first or last in lists/navigation.
- **Von Restorff Effect** — Make the primary action visually distinct, but don't overdo it.
- **Aesthetic-Usability Effect** — Polish matters. Users trust and forgive well-designed interfaces more.

## Reference

For the complete list of all 30 laws with definitions, key takeaways, origins, and practical examples, read `references/laws.md`.
