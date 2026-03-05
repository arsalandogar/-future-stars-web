# Laws of UX — Complete Reference

All 30 principles from [lawsofux.com](https://lawsofux.com), organized by category.

## Table of Contents

- [Heuristics](#heuristics) — Core usability principles
- [Principles](#principles) — Cognitive and behavioral patterns
- [Gestalt](#gestalt) — Visual perception laws
- [Cognitive Biases](#cognitive-biases) — Systematic thinking patterns

---

## Heuristics

### Aesthetic-Usability Effect

Users perceive aesthetically pleasing design as more usable.

**Takeaways:**

- Beautiful design triggers positive emotional responses, making users believe it works better
- Users show greater tolerance for minor usability issues in visually appealing products
- Attractive design can mask usability problems during testing — be careful not to let polish hide real issues

**Origin:** Kurosu & Kashimura (1995) at Hitachi tested 26 ATM interfaces with 252 participants. Visual appeal correlated more with _perceived_ ease than _actual_ ease of use.

**Apply when:** Deciding how much visual polish to invest in. Remember: aesthetics aren't superficial — they directly affect perceived usability.

---

### Doherty Threshold

Productivity soars when a computer and its users interact at a pace (<400ms) that ensures neither has to wait on the other.

**Takeaways:**

- System feedback should arrive within 400ms to maintain flow
- Use animation and skeleton states to improve perceived performance during loading
- Progress bars make waits feel shorter, even if imprecise
- Sometimes a brief intentional delay can increase perceived value (e.g., "searching..." for instant results)

**Origin:** Doherty & Thadani (1982) at IBM established the 400ms threshold, replacing the old 2-second standard.

**Apply when:** Evaluating loading states, API response handling, transitions, optimistic updates. Any interaction that might feel sluggish.

---

### Fitts's Law

The time to acquire a target is a function of the distance to and size of the target.

**Takeaways:**

- Make interactive targets (buttons, links, inputs) large enough to click/tap easily
- Place important actions close to where the user's attention or cursor already is
- Don't put destructive actions (delete) right next to constructive actions (save)
- Edge and corner positions on screens are easy to reach (infinite target size on screen edges)

**Apply when:** Sizing buttons, positioning CTAs, designing toolbars, placing form actions, mobile tap targets (minimum 44x44px).

---

### Hick's Law

The time to make a decision increases with the number and complexity of choices.

**Takeaways:**

- Minimize choices at critical decision points
- Break complex tasks into smaller steps (progressive disclosure)
- Highlight recommended options to guide users
- Use progressive onboarding — don't show all features at once
- Don't oversimplify to the point of hiding necessary options

**Origin:** Hick & Hyman (1952) studied how stimulus quantity affects reaction time.

**Examples:** Google's minimal homepage. Apple TV remote moving complexity to the screen. Slack's bot-driven onboarding.

**Apply when:** Designing navigation, settings pages, onboarding flows, forms with many options, dashboards.

---

### Jakob's Law

Users spend most of their time on other sites. They prefer your site to work the same way as those sites.

**Takeaways:**

- Users transfer expectations from familiar products to yours — leverage this
- Use established conventions (navigation placement, form patterns, icon meanings)
- When redesigning, allow a transition period with the old version available
- Study competitors and common patterns in your domain before innovating

**Origin:** Jakob Nielsen, co-founder of Nielsen Norman Group.

**Examples:** Toggle switches mirroring physical switches. YouTube's gradual 2017 redesign with opt-in preview.

**Apply when:** Designing any interaction pattern. Before innovating, ask: "Is there an established convention for this?"

---

### Miller's Law

The average person can keep 7 (plus or minus 2) items in working memory.

**Takeaways:**

- Don't use "7 items" as a hard rule for UI limits — that's a misapplication
- DO use chunking: break content into meaningful groups of ~5 items
- Individual capacity varies based on context and familiarity
- Phone numbers, credit card fields, and step indicators all use chunking effectively

**Origin:** George Miller (1956), "The Magical Number Seven, Plus or Minus Two."

**Apply when:** Designing navigation menus, form layouts, dashboards, data tables, step indicators. Group related items rather than presenting flat lists.

---

### Occam's Razor

Among competing solutions that work equally well, the simplest one is best.

**Takeaways:**

- Analyze and eliminate unnecessary elements that don't support user tasks
- Simplify without removing essential functionality
- When in doubt, remove rather than add

**Apply when:** Reviewing any interface for bloat. Deciding between design approaches of different complexity.

---

### Pareto Principle

Roughly 80% of effects come from 20% of causes.

**Takeaways:**

- Focus effort on the features and flows that serve the majority of users
- Identify and optimize the critical 20% of functionality that drives 80% of usage
- Use analytics to find the most-used paths and prioritize them

**Apply when:** Prioritizing which parts of an interface to improve. Deciding where to invest design effort.

---

### Parkinson's Law

Any task will expand to fill the available time.

**Takeaways:**

- Constrain task scope to reduce time spent — shorter forms, fewer steps
- Set clear expectations about time required (e.g., "This takes ~2 minutes")
- Deadlines and progress indicators help users stay focused

**Apply when:** Designing multi-step flows, onboarding processes, or any task where the user might lose focus.

---

### Postel's Law

Be liberal in what you accept, and conservative in what you send.

**Takeaways:**

- Accept diverse input formats (with/without dashes in phone numbers, various date formats)
- Translate user input to meet system requirements behind the scenes
- Set clear boundaries but provide helpful feedback when input doesn't match
- Output should be clean, consistent, and standardized

**Origin:** Jon Postel's Robustness Principle for TCP implementations.

**Apply when:** Designing forms, search inputs, filters, any user input handling. Be forgiving.

---

### Tesler's Law (Law of Conservation of Complexity)

Every system has an irreducible amount of complexity that cannot be eliminated — only moved.

**Takeaways:**

- Some complexity is inherent — the question is whether the system or user bears it
- Designers and developers should absorb complexity so users don't have to
- Design for real user behavior, not idealized rational actors
- Provide contextual guidance for complex tasks

**Origin:** Larry Tesler at Xerox PARC, mid-1980s.

**Apply when:** Deciding where complexity lives. Smart defaults, auto-detection, and contextual help all shift complexity from user to system.

---

## Principles

### Goal-Gradient Effect

The tendency to approach a goal increases with proximity to the goal.

**Takeaways:**

- Show progress toward completion (progress bars, step indicators)
- Give users a head start when possible (pre-filled fields, started progress bars)
- Break long processes into visible milestones

**Apply when:** Multi-step forms, onboarding flows, loyalty programs, profile completion.

---

### Paradox of the Active User

Users never read manuals — they start using software immediately.

**Takeaways:**

- Don't rely on documentation or tutorials — users will skip them
- Make interfaces self-explanatory through clear labels, good defaults, and inline help
- Progressive disclosure is better than upfront training

**Apply when:** Designing any new feature or flow. Assume users will click around without reading instructions.

---

### Peak-End Rule

People judge an experience by its most intense moment and its ending, not the average.

**Takeaways:**

- Design the peak moments of your flow to be delightful
- End flows on a positive note (confirmation screens, success animations)
- Negative peaks are remembered more strongly than positive ones — fix frustrating moments first

**Origin:** Kahneman et al. (1993).

**Examples:** Mailchimp's celebration animation after sending a campaign. Uber reducing perceived wait times.

**Apply when:** Designing flow endings (confirmations, success states), error handling, checkout experiences.

---

### Serial Position Effect

Users best remember the first and last items in a series.

**Takeaways:**

- Place the most important items at the beginning and end of lists
- Navigation: put key items first and last
- In content, front-load and conclude with the most important information

**Apply when:** Ordering navigation items, designing lists, structuring onboarding steps.

---

### Zeigarnik Effect

People remember uncompleted tasks better than completed ones.

**Takeaways:**

- Use progress indicators to leverage this effect (incomplete profiles, unfinished setups)
- Incomplete tasks create mental tension that motivates completion
- But don't abuse this — too many incomplete indicators create anxiety

**Apply when:** Profile completion flows, onboarding checklists, learning paths. Use sparingly.

---

## Gestalt

### Law of Common Region

Elements sharing a clearly defined boundary are perceived as a group.

**Takeaways:**

- Use cards, borders, and background colors to group related content
- Clear boundaries override proximity — items in a box feel related even if spaced apart

**Apply when:** Card layouts, form sections, grouped settings, dashboards with distinct panels.

---

### Law of Proximity

Objects near each other are perceived as a group.

**Takeaways:**

- Related items should be close together; unrelated items should have clear spacing
- Spacing is often more effective than borders for creating groups
- Inconsistent spacing creates confusion about relationships

**Apply when:** Form layouts, navigation grouping, content sections, button groups.

---

### Law of Pragnanz (Simplicity)

People perceive complex images in their simplest form.

**Takeaways:**

- Users will interpret your UI in the simplest way possible
- Reduce visual complexity — if it can be misread, it will be
- Use familiar shapes and patterns

**Apply when:** Icon design, data visualization, any complex layout. Simplify until the meaning is unambiguous.

---

### Law of Similarity

Similar-looking elements are perceived as related.

**Takeaways:**

- Style related items consistently (same color, size, shape)
- Differentiate unrelated items visually
- Breaking similarity draws attention (see Von Restorff Effect)

**Apply when:** Lists, grids, navigation items, action buttons. Consistent styling = perceived grouping.

---

### Law of Uniform Connectedness

Visually connected elements are perceived as more related than disconnected ones.

**Takeaways:**

- Use lines, arrows, or shared backgrounds to show relationships
- Connecting elements (like timeline lines between steps) reinforces sequence

**Apply when:** Timelines, step indicators, flow diagrams, connected form fields.

---

## Cognitive Biases

### Cognitive Bias (General)

Systematic errors in thinking that influence perception and decision-making.

**Takeaways:**

- Be aware that users don't behave rationally — they take shortcuts
- Design with cognitive biases in mind, not against them
- Use biases ethically to guide users toward good decisions

**Apply when:** Always. Every design decision should account for how people actually think, not how they should think.

---

### Choice Overload

People get overwhelmed with too many options.

**Takeaways:**

- Fewer options = more conversions (the jam study: 6 vs 24 options)
- If many options are necessary, provide filters, categories, or recommendations
- Default selections reduce decision fatigue

**Apply when:** Product listings, settings pages, plan selection, any picker with many items.

---

### Chunking

Breaking information into smaller, meaningful groups.

**Takeaways:**

- Group related items together (form fields, menu items, content sections)
- Use visual separators (spacing, lines, headings) to define chunks
- Each chunk should be a coherent unit of meaning

**Apply when:** Long forms, data-heavy interfaces, content organization, phone/card number inputs.

---

### Cognitive Load

The mental effort required to understand and interact with an interface.

**Takeaways:**

- Reduce intrinsic load: simplify the task itself
- Reduce extraneous load: remove unnecessary visual noise, redundant information
- Increase germane load: help users build mental models through clear structure

**Apply when:** Every design decision. The most common UX problem is asking users to think too much.

---

### Flow

A mental state of full immersion and focus during an activity.

**Takeaways:**

- Remove interruptions and unnecessary friction from task flows
- Provide clear goals and immediate feedback at each step
- Match challenge to user skill level — not too easy, not too hard

**Apply when:** Designing focused workflows (editors, creation tools, checkout). Minimize distractions.

---

### Mental Model

What a user thinks they know about how a system works.

**Takeaways:**

- Match your interface to users' existing mental models
- When you must break expectations, provide clear guidance
- User research reveals mental models — don't assume yours matches theirs

**Apply when:** Any novel interaction pattern. Test assumptions about how users expect things to work.

---

### Selective Attention

People focus on stimuli relevant to their current goal, filtering out the rest.

**Takeaways:**

- Don't expect users to notice elements outside their current focus
- Important alerts need to interrupt the user's current flow to be seen
- Banner blindness is real — users ignore anything that looks like an ad

**Apply when:** Placing notifications, warnings, promotions. If it's important, put it in the user's direct path.

---

### Von Restorff Effect (Isolation Effect)

The distinctive item among similar items is most remembered.

**Takeaways:**

- Make the primary CTA visually distinct from secondary actions
- Use restraint — if everything is highlighted, nothing stands out
- Don't rely solely on color for distinction (accessibility)
- Be mindful of motion sensitivity when using animation for emphasis

**Origin:** Hedwig von Restorff (1933).

**Apply when:** CTA design, pricing tables (highlighting recommended plan), important messages, key navigation items.

---

### Working Memory

The cognitive system that temporarily holds information needed for current tasks.

**Takeaways:**

- Don't make users remember information across screens — display it
- Persist user input and selections visibly
- Minimize the need to hold multiple things in mind simultaneously

**Apply when:** Multi-step flows, comparison interfaces, any task where the user needs to reference earlier information.
