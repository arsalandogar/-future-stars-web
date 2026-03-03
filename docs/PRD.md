# Future Stars - Product Requirements Document

## Product Overview

**Future Stars** is a web platform that enables users to create professional-grade custom sports trading cards for young athletes. Users can upload photos, choose from various card templates, customize designs, and order physical printed cards.

**Tagline:** "Create professional-grade sports cards for the next generation of athletes."

---

## User Roles

### 1. Customers

Primary users who create and purchase cards.

**Capabilities:**

- Browse and select card templates
- Upload photos and customize cards
- Manage card collections
- Create card packs (bundles)
- Purchase cards and packs
- Manage account settings

### 2. Admins

Platform administrators who manage the system.

**Capabilities:**

- Manage users and orders
- Create and manage card templates
- Configure template types and tags
- Manage featured items
- Handle legal documents (Privacy Policy, Terms)
- View platform analytics

---

## Core Features

### 1. Home Page

The landing page for authenticated users.

**Components:**

- Hero section with headline "COLLECT YOUR MEMORIES"
- Card carousel showcasing example cards (3 visible at a time)
- Navigation arrows for carousel
- "Create a Card" primary CTA button
- Pagination dots (5 slides)

### 2. Template Browser (`/templates`)

Browse available card templates by category.

**Features:**

- Category filter pills: All Styles, Premium, Modern, Retro, Classic
- Horizontal scrolling rows per category
- "See All →" link for each category
- Template preview thumbnails

**Template Categories:**
| Category | Description |
|----------|-------------|
| Premium | High-end designs with premium aesthetics |
| Modern | Contemporary, clean designs |
| Retro | Vintage-style throwback designs |
| Classic | Traditional sports card layouts |

### 3. Card Editor (`/create-card`)

Full-featured card customization interface.

**Editor Tabs:**

| Tab           | Features                                                    |
| ------------- | ----------------------------------------------------------- |
| **Content**   | Player name, team, position, jersey number, stats, bio text |
| **Colors**    | Color scheme customization                                  |
| **Photo**     | Image upload, positioning, effects, filters                 |
| **Templates** | Switch between template styles                              |

**Photo Sub-tabs:**

- **Image**: Upload, Take Photo, Rotate, Delete
- **Position**: Adjust photo placement and scale
- **Effects**: Apply visual effects
- **Filters**: Color filters and adjustments

**Other Features:**

- Live card preview (front view)
- "Flip" button to see card back
- "Save Card" action button

### 4. My Cards (`/my-cards`)

User's card collection management.

**Tabs:**

- **Cards**: Individual card collection
- **Packs**: Bundled card packs

**Cards Tab Features:**

- Grid view of all created cards
- Card thumbnail with player name, team, date
- "Buy Cards" button
- "Filters" button
- "+" card to create new
- Click to preview card details

**Packs Tab Features:**

- List/grid view toggle
- Pack count display
- "Create Pack" button
- Pack items showing:
  - Pack thumbnail and name
  - Status (Created/Ordered) with date
  - "View Cards" expand link
  - "Add to Cart" button
  - Info banner for incomplete packs

### 5. Card Preview Modal

Detailed view when clicking a card.

**Features:**

- Card front and back display side-by-side
- "Share Card" action
- "Edit Card" action
- Created date
- Quantity selector (- / qty / +)
- "Buy this Card" button
- More options menu (⋮)

### 6. Create Pack (`/my-cards` → Create Pack)

Bundle multiple cards into a pack.

**Features:**

- "Select up to 20 cards" instruction
- Card selection grid with checkboxes
- Selection counter "X Cards Selected"
- "Cancel" link
- "Add to Cart" button (enabled when cards selected)

### 7. Delete Card Modal

Confirmation dialog for card deletion.

**Options:**

- Delete from My Cards (checkbox)
- Delete from Packs (checkbox)
- Cancel / Confirm buttons

### 8. Shopping Cart (`/cart`)

Purchase flow for cards and packs.

**Features:**

- "+ Add Pack" link
- "Checkout" button
- Cart items list:
  - Pack thumbnail and name
  - Status and date
  - Price
  - "View Cards" expand
  - Quantity controls (delete, -, qty, +)
  - Info banner for incomplete packs
- Summary: "X Packs Added" | "Total: $XX.XX"

### 9. Account (`/account`)

User profile and settings management.

**Sidebar Navigation:**

- **My Info** (expandable)
  - Account Details
  - Payment Methods
  - Shipping Addresses
  - Preferences
- **My Orders**
- **Help & Support**
- **Privacy Policy**
- **Log Out**

**Account Details Section:**

- Name, Phone, Email display
- "Edit" link
- "Manage your personal information and account settings" description

---

## Key User Flows

### Flow 1: Create a Card

```
Home → "Create a Card" → Select Template → Upload Photo →
Customize (Content, Colors, Photo) → Save Card → My Cards
```

### Flow 2: Create and Order a Pack

```
My Cards → Packs Tab → "Create Pack" → Select Cards (up to 20) →
"Add to Cart" → Cart → Adjust Quantities → "Checkout"
```

### Flow 3: Quick Purchase Single Card

```
My Cards → Click Card → Card Preview → Set Quantity →
"Buy this Card" → Cart → "Checkout"
```

### Flow 4: Browse and Use Templates

```
Templates → Filter by Category → Select Template →
Redirects to Card Editor with template applied
```

---

## Design System

### Theme

- **Mode**: Dark theme (primary)
- **Background**: Purple-to-black gradient
- **Text**: White/light gray on dark backgrounds

### Colors

| Element                   | Color                                               |
| ------------------------- | --------------------------------------------------- |
| Background gradient start | `#282373` (dark purple)                             |
| Background gradient end   | `#000000` (black)                                   |
| Primary accent            | `#5046FF` (indigo/purple)                           |
| Primary accent (alt)      | `#4F46E5` (indigo - header borders)                 |
| Secondary accent          | `#f97316` (orange - for highlights like "MEMORIES") |
| Text primary              | `#ffffff`                                           |
| Text secondary            | `#9ca3af` (gray)                                    |
| Border                    | `rgba(255,255,255,0.1)`                             |

### Typography

- **Font Family**: Poppins
- **Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Components

| Component        | Style                               |
| ---------------- | ----------------------------------- |
| Primary Button   | Purple filled, fully rounded (pill) |
| Secondary Button | Outlined or ghost, fully rounded    |
| Cards            | Rounded corners, subtle shadow      |
| Modals           | Dark background, centered           |
| Inputs           | Dark background, light border       |

### Spacing

- **Header height**: 76px
- **Page padding**: 16-24px (responsive)
- **Card gap**: 16-24px
- **Section spacing**: 32-48px

---

## Navigation Structure

### Customer Navigation (Header)

```
[Logo]  HOME | TEMPLATES | MY CARDS | ACCOUNT  [CREATE A CARD] [Cart]
```

### Admin Navigation (Sidebar)

```
Dashboard
Users
Orders
Templates
  ├── All Templates
  └── Template Types
Legal
  ├── Privacy Policy
  └── Terms & Conditions
Settings
  ├── Tags
  ├── Featured Items
  └── Configs
```

---

## Technical Considerations

### Authentication

- Shared authentication system for customers and admins
- Role-based routing (customers → customer layout, admins → admin layout)
- Protected routes requiring authentication

### Data Models (High-Level)

- **User**: Profile, role, preferences
- **Template**: Design, category, metadata
- **Card**: User-created card with template reference
- **Pack**: Bundle of cards
- **Order**: Purchase transaction

### API Integration

- Backend API at `api-development.futurestars.cards`
- OpenAPI spec available at `/api.json`

---

## Future Considerations

- Social sharing features
- Card trading/marketplace
- Team/organization accounts
- Bulk ordering discounts
- Card subscription plans
- Mobile app companion
