# Future Stars API Documentation

Base URL: `/api/v1`

## Table of Contents

- [Authentication](#authentication)
- [Templates](#templates)
- [Tags](#tags)
- [Cards](#cards)
- [Packs](#packs)
- [Cart Items](#cart-items)
- [Addresses](#addresses)
- [Orders](#orders)
- [Configs](#configs)
- [Featured Items](#featured-items)
- [Profile](#profile)

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

### Register

Create a new user account.

```
POST /api/v1/auth/register
```

**Request Body:**

| Field     | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| firstName | string | Yes      | First name (1-64 chars)      |
| lastName  | string | Yes      | Last name (1-64 chars)       |
| email     | string | Yes      | Valid email (must be unique) |
| password  | string | Yes      | Password (8-64 chars)        |
| userId    | number | No       | Guest user ID to upgrade     |

**Response:** `200 OK`

```json
{
  "token": "string",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user",
    "isAdmin": false,
    "isGuest": false,
    "fullName": "John Doe"
  }
}
```

### Login

Authenticate with email and password.

```
POST /api/v1/auth/login
```

**Request Body:**

| Field    | Type   | Required | Description           |
| -------- | ------ | -------- | --------------------- |
| email    | string | Yes      | User email            |
| password | string | Yes      | Password (8-64 chars) |

**Response:** `200 OK`

```json
{
  "token": "string",
  "user": { ... }
}
```

### Guest Login

Login as a guest user or retrieve existing guest session.

```
POST /api/v1/auth/guest
```

**Request Body:**

| Field  | Type   | Required | Description            |
| ------ | ------ | -------- | ---------------------- |
| userId | number | No       | Existing guest user ID |

**Response:** `200 OK`

```json
{
  "token": "string",
  "user": { ... },
  "isNewUser": true
}
```

### Google Login

Authenticate with Google OAuth.

```
POST /api/v1/auth/google
```

**Request Body:**

| Field | Type   | Required | Description        |
| ----- | ------ | -------- | ------------------ |
| token | string | Yes      | Google OAuth token |

**Response:** `200 OK`

```json
{
  "token": "string",
  "user": { ... },
  "isNewUser": false
}
```

### Apple Login

Authenticate with Apple Sign In.

```
POST /api/v1/auth/apple
```

**Request Body:**

| Field             | Type   | Required | Description              |
| ----------------- | ------ | -------- | ------------------------ |
| identityToken     | string | Yes      | Apple identity token     |
| user              | string | Yes      | Apple user identifier    |
| email             | string | No       | User email               |
| fullName          | object | No       | Name object (see below)  |
| authorizationCode | string | No       | Apple authorization code |

**fullName object:**

| Field      | Type   | Required | Description |
| ---------- | ------ | -------- | ----------- |
| givenName  | string | No       | First name  |
| familyName | string | No       | Last name   |
| middleName | string | No       | Middle name |
| namePrefix | string | No       | Name prefix |
| nameSuffix | string | No       | Name suffix |
| nickname   | string | No       | Nickname    |

**Response:** `200 OK`

```json
{
  "token": "string",
  "user": { ... },
  "isNewUser": false
}
```

### Request Phone OTP

Request OTP for phone number authentication.

```
POST /api/v1/auth/phone/request-otp
```

**Request Body:**

| Field | Type   | Required | Description                |
| ----- | ------ | -------- | -------------------------- |
| phone | string | Yes      | Phone number (10-20 chars) |

**Response:** `200 OK`

```json
{
  "message": "If this phone number is registered, you will receive an OTP",
  "expiresIn": 300
}
```

### Verify Phone OTP

Verify OTP and authenticate user.

```
POST /api/v1/auth/phone/verify-otp
```

**Request Body:**

| Field | Type   | Required | Description                |
| ----- | ------ | -------- | -------------------------- |
| phone | string | Yes      | Phone number (10-20 chars) |
| otp   | string | Yes      | 6-digit OTP code           |

**Response:** `200 OK`

```json
{
  "token": "string",
  "user": { ... }
}
```

### Merge Guest User

Merge guest user data into an existing user account (requires authentication as guest).

```
POST /api/v1/auth/merge-guest
```

**Headers:** `Authorization: Bearer <guest_token>`

**Request Body:**

| Field | Type   | Required | Description                |
| ----- | ------ | -------- | -------------------------- |
| phone | string | Yes      | Phone number (10-20 chars) |
| otp   | string | Yes      | 6-digit OTP code           |

**Response:** `200 OK`

```json
{
  "token": "string",
  "user": { ... },
  "message": "Guest data merged successfully"
}
```

---

## Profile

### Get Current User Profile

```
GET /api/v1/profile
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "user",
  "isAdmin": false,
  "isGuest": false,
  "fullName": "John Doe"
}
```

---

## Templates

### List Templates

Get paginated list of front-side templates.

```
GET /api/v1/templates
```

**Query Parameters:**

| Param  | Type   | Default | Description                                   |
| ------ | ------ | ------- | --------------------------------------------- |
| page   | number | 1       | Page number                                   |
| limit  | number | 20      | Items per page                                |
| search | string | -       | Search templates by name, description, or tag |
| tagIds | string | -       | Comma-separated tag IDs to filter by          |

**Response:** `200 OK`

```json
{
  "meta": {
    "total": 100,
    "perPage": 20,
    "currentPage": 1,
    "lastPage": 5
  },
  "data": [
    {
      "id": 1,
      "side": "front",
      "name": "basketball-card",
      "label": "Basketball Card",
      "description": "Professional basketball card template",
      "svgString": "<svg>...</svg>",
      "templateTypeId": 1,
      "frontendComponentName": "BasketballCard",
      "frontendComponentFileName": "basketball_card.tsx",
      "backTemplateId": 2,
      "attributes": [
        {
          "id": 1,
          "templateId": 1,
          "type": "string",
          "name": "playerName",
          "label": "Player Name",
          "defaultValue": "Player",
          "defaultColor": null
        }
      ],
      "backTemplate": {
        "id": 2,
        "side": "back",
        "name": "basketball-card-back",
        "attributes": [...]
      },
      "type": {
        "id": 1,
        "name": "sports"
      },
      "tags": [
        {
          "id": 1,
          "name": "basketball",
          "label": "Basketball"
        }
      ]
    }
  ]
}
```

### Get Template

Get a single template by ID.

```
GET /api/v1/templates/:id
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "side": "front",
  "name": "basketball-card",
  "label": "Basketball Card",
  "description": "Professional basketball card template",
  "svgString": "<svg>...</svg>",
  "templateTypeId": 1,
  "attributes": [...],
  "type": {...},
  "tags": [...]
}
```

### Create Template (Admin Only)

```
POST /api/v1/templates
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**

| Field                     | Type   | Required | Description                   |
| ------------------------- | ------ | -------- | ----------------------------- |
| side                      | string | Yes      | `front` or `back`             |
| name                      | string | Yes      | Template name (1-255 chars)   |
| label                     | string | No       | Display label (1-255 chars)   |
| description               | string | No       | Description (max 1000 chars)  |
| svgString                 | string | No       | SVG template string           |
| templateTypeId            | number | Yes      | Template type ID              |
| frontendComponentName     | string | No       | React component name          |
| frontendComponentFileName | string | No       | Component file name           |
| backTemplateId            | number | No       | ID of back template           |
| attributes                | array  | No       | Array of template attributes  |
| tagIds                    | array  | No       | Array of tag IDs to associate |

**attributes array item:**

| Field        | Type   | Required | Description                    |
| ------------ | ------ | -------- | ------------------------------ |
| type         | string | Yes      | `color`, `image`, or `string`  |
| name         | string | Yes      | Attribute name (1-255 chars)   |
| label        | string | Yes      | Display label (1-255 chars)    |
| defaultValue | string | No       | Default value (max 1000 chars) |
| defaultColor | string | No       | Default color (max 1000 chars) |

**Response:** `201 Created`

### Update Template (Admin Only)

```
PUT /api/v1/templates/:id
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:** Same as create, all fields optional.

**Response:** `200 OK`

---

## Tags

### List Tags

Get all tags.

```
GET /api/v1/tags
```

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "basketball",
    "label": "Basketball",
    "description": "Basketball related templates"
  }
]
```

### Get Tag

```
GET /api/v1/tags/:id
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "name": "basketball",
  "label": "Basketball",
  "description": "Basketball related templates"
}
```

### Create Tag (Admin Only)

```
POST /api/v1/tags
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**

| Field       | Type   | Required | Description                    |
| ----------- | ------ | -------- | ------------------------------ |
| name        | string | Yes      | Tag name (1-255 chars, unique) |
| label       | string | No       | Display label (1-255 chars)    |
| description | string | No       | Description (max 1000 chars)   |

**Response:** `201 Created`

### Update Tag (Admin Only)

```
PUT /api/v1/tags/:id
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:** Same as create, all fields optional.

**Response:** `200 OK`

### Delete Tag (Admin Only)

```
DELETE /api/v1/tags/:id
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `204 No Content`

---

## Cards

All card endpoints require authentication.

### List Cards

Get paginated list of user's cards.

```
GET /api/v1/cards
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Param             | Type    | Default | Description             |
| ----------------- | ------- | ------- | ----------------------- |
| page              | number  | 1       | Page number             |
| limit             | number  | 10      | Items per page          |
| hiddenFromGallery | boolean | -       | Filter by hidden status |

**Response:** `200 OK`

```json
{
  "meta": {
    "total": 50,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 5
  },
  "data": [
    {
      "id": 1,
      "userId": 1,
      "templateId": 1,
      "backTemplateId": 2,
      "svgString": "<svg>...</svg>",
      "backSvgString": "<svg>...</svg>",
      "hiddenFromGallery": false,
      "template": {
        "id": 1,
        "name": "basketball-card",
        "attributes": [...]
      },
      "backTemplate": {...},
      "values": [
        {
          "id": 1,
          "cardId": 1,
          "templateAttributeId": 1,
          "value": "Michael Jordan",
          "color": null
        }
      ],
      "zoomStates": [
        {
          "id": 1,
          "cardId": 1,
          "templateAttributeId": 2,
          "zoomScale": 1.5,
          "zoomOffsetX": 10,
          "zoomOffsetY": 20,
          "zoomRotation": 0
        }
      ]
    }
  ]
}
```

### Get Card

```
GET /api/v1/cards/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Create Card

Create a new card with values and images.

```
POST /api/v1/cards
```

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field          | Type   | Required | Description           |
| -------------- | ------ | -------- | --------------------- |
| templateId     | number | Yes      | Front template ID     |
| backTemplateId | number | Yes      | Back template ID      |
| values         | array  | Yes      | Array of card values  |
| images         | array  | Yes      | Array of image values |

**values array item:**

| Field               | Type   | Required | Description                 |
| ------------------- | ------ | -------- | --------------------------- |
| templateAttributeId | number | Yes      | Template attribute ID       |
| value               | string | No       | Text value (max 100 chars)  |
| color               | string | No       | Color value (max 100 chars) |
| fontSize            | number | No       | Font size                   |
| zoomScale           | number | No       | Image zoom scale            |
| zoomOffsetX         | number | No       | Image X offset              |
| zoomOffsetY         | number | No       | Image Y offset              |
| zoomRotation        | number | No       | Image rotation              |

**images array item:**

| Field               | Type   | Required | Description                           |
| ------------------- | ------ | -------- | ------------------------------------- |
| templateAttributeId | number | Yes      | Template attribute ID                 |
| value               | file   | Yes      | Image file (jpg, jpeg, png, max 40MB) |

**Response:** `201 Created`

### Create SVG Card

Create a card with pre-rendered SVG.

```
POST /api/v1/cards/svg
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field      | Type     | Required | Description              |
| ---------- | -------- | -------- | ------------------------ |
| templateId | number   | Yes      | Template ID              |
| svgString  | string   | Yes      | SVG string               |
| imageUrls  | string[] | Yes      | Array of image data URLs |

**Response:** `201 Created`

### Update Card

```
PUT /api/v1/cards/:id
```

**Headers:** `Authorization: Bearer <token>`

**Content-Type:** `multipart/form-data`

**Request Body:** Same as create, all fields optional.

**Response:** `200 OK`

### Update SVG Card

```
PUT /api/v1/cards/:id/svg
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field      | Type     | Required | Description              |
| ---------- | -------- | -------- | ------------------------ |
| templateId | number   | No       | Template ID              |
| svgString  | string   | No       | SVG string               |
| imageUrls  | string[] | No       | Array of image data URLs |

**Response:** `200 OK`

### Hide Card

Hide a card from gallery.

```
PATCH /api/v1/cards/:id/hide
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Unhide Card

Show a card in gallery.

```
PATCH /api/v1/cards/:id/unhide
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Delete Card

```
DELETE /api/v1/cards/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

## Packs

All pack endpoints require authentication.

### List Packs

Get paginated list of user's packs.

```
GET /api/v1/packs
```

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**

| Param | Type   | Default | Description    |
| ----- | ------ | ------- | -------------- |
| page  | number | 1       | Page number    |
| limit | number | 10      | Items per page |

**Response:** `200 OK`

```json
{
  "meta": {...},
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "My Pack #1",
      "packCards": [
        {
          "id": 1,
          "packId": 1,
          "cardId": 1,
          "quantity": 2,
          "card": {
            "id": 1,
            "svgString": "<svg>...</svg>",
            "template": {...},
            "values": [...]
          }
        }
      ]
    }
  ]
}
```

### Get Pack

```
GET /api/v1/packs/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Create Pack

```
POST /api/v1/packs
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field | Type   | Required | Description                         |
| ----- | ------ | -------- | ----------------------------------- |
| name  | string | No       | Pack name (auto-generated if empty) |
| cards | array  | Yes      | Array of pack cards                 |

**cards array item:**

| Field    | Type   | Required | Description       |
| -------- | ------ | -------- | ----------------- |
| cardId   | number | Yes      | Card ID           |
| quantity | number | Yes      | Quantity (min: 1) |

**Response:** `201 Created`

### Update Pack

```
PUT /api/v1/packs/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field | Type   | Required | Description         |
| ----- | ------ | -------- | ------------------- |
| name  | string | No       | Pack name           |
| cards | array  | No       | Array of pack cards |

**Response:** `200 OK`

### Remove Card from Pack

```
DELETE /api/v1/packs/:id/cards/:cardId
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

### Delete Pack

```
DELETE /api/v1/packs/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

## Cart Items

All cart endpoints require authentication.

### List Cart Items

Get all cart items with calculated prices.

```
GET /api/v1/cart-items
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "userId": 1,
    "packId": 1,
    "quantity": 2,
    "unitPrice": 1999,
    "totalPrice": 3998,
    "pack": {
      "id": 1,
      "name": "My Pack #1",
      "packCards": [...]
    }
  }
]
```

### Add to Cart

Add a pack to cart or increase quantity if already in cart.

```
POST /api/v1/cart-items
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field    | Type   | Required | Description           |
| -------- | ------ | -------- | --------------------- |
| packId   | number | Yes      | Pack ID to add        |
| quantity | number | No       | Quantity (default: 1) |

**Response:** `201 Created`

### Update Cart Item

Update cart item quantity.

```
PUT /api/v1/cart-items/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field    | Type   | Required | Description           |
| -------- | ------ | -------- | --------------------- |
| quantity | number | Yes      | New quantity (min: 1) |

**Response:** `200 OK`

### Delete Cart Item

```
DELETE /api/v1/cart-items/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

## Addresses

All address endpoints require authentication.

### List Addresses

Get all user addresses.

```
GET /api/v1/addresses
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "userId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US",
    "phone": "+1234567890",
    "isDefault": true
  }
]
```

### Get Address

```
GET /api/v1/addresses/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Create Address

```
POST /api/v1/addresses
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field        | Type    | Required | Description                       |
| ------------ | ------- | -------- | --------------------------------- |
| firstName    | string  | Yes      | First name (1-50 chars)           |
| lastName     | string  | No       | Last name (1-50 chars)            |
| addressLine1 | string  | Yes      | Address line 1 (1-255 chars)      |
| addressLine2 | string  | No       | Address line 2 (max 255 chars)    |
| city         | string  | Yes      | City (1-100 chars)                |
| state        | string  | Yes      | State (1-100 chars)               |
| postalCode   | string  | Yes      | Postal code                       |
| country      | string  | Yes      | Country code (ISO 3166-1 alpha-2) |
| phone        | string  | Yes      | Phone number (10-20 chars)        |
| isDefault    | boolean | No       | Set as default address            |

**Response:** `201 Created`

**Note:** Creating the first address for a guest user will upgrade them to a regular user. If the phone number is already associated with another account, an OTP will be sent for account merge.

### Update Address

```
PUT /api/v1/addresses/:id
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as create, all fields optional.

**Response:** `200 OK`

### Delete Address

```
DELETE /api/v1/addresses/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

### Set Default Address

```
PATCH /api/v1/addresses/:id/set-default
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Orders

All order endpoints require authentication.

### List Orders

Get all user orders.

```
GET /api/v1/orders
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "userId": 1,
    "stripePaymentIntentId": "pi_xxxxx",
    "totalAmount": 5997,
    "status": "paid",
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "addressLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US"
    },
    "lineItems": [
      {
        "id": 1,
        "orderId": 1,
        "quantity": 2,
        "unitPrice": 1999,
        "totalPrice": 3998,
        "packSnapshot": {
          "id": 1,
          "name": "My Pack #1",
          "cardSnapshots": [...]
        }
      }
    ]
  }
]
```

### Get Order

```
GET /api/v1/orders/:id
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Checkout

Create a new order from cart items.

```
POST /api/v1/orders/checkout
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

| Field             | Type     | Required | Description                         |
| ----------------- | -------- | -------- | ----------------------------------- |
| cartItemIds       | number[] | Yes      | Array of cart item IDs (1-50 items) |
| shippingAddressId | number   | No       | Shipping address ID                 |

**Response:** `201 Created`

```json
{
  "order": {
    "id": 1,
    "status": "created",
    "totalAmount": 5997,
    ...
  },
  "clientSecret": "pi_xxxxx_secret_xxxxx"
}
```

### Confirm Payment

Confirm payment after successful Stripe payment.

```
PATCH /api/v1/orders/:id/confirm-payment
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
{
  "id": 1,
  "status": "paid",
  ...
}
```

### Order Status Values

| Status               | Description                     |
| -------------------- | ------------------------------- |
| `created`            | Order created, awaiting payment |
| `payment_failed`     | Payment attempt failed          |
| `paid`               | Payment successful              |
| `processing`         | Order being processed           |
| `sent_to_production` | Sent to card production         |
| `shipped`            | Order shipped                   |
| `delivered`          | Order delivered                 |
| `cancelled`          | Order cancelled                 |
| `refunded`           | Order refunded                  |

---

## Configs

All config endpoints require authentication.

### List Configs

```
GET /api/v1/configs
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

```json
[
  {
    "name": "BASE_PRICE_PER_PACK",
    "value": "1999"
  }
]
```

### Get Config

```
GET /api/v1/configs/:name
```

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Create Config (Admin Only)

```
POST /api/v1/configs
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**

| Field | Type   | Required | Description                  |
| ----- | ------ | -------- | ---------------------------- |
| name  | string | Yes      | Config name (enum value)     |
| value | string | No       | Config value (max 255 chars) |

**Available Config Names:**

- `BASE_PRICE_PER_PACK`

**Response:** `201 Created`

### Update Config (Admin Only)

```
PUT /api/v1/configs/:name
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**

| Field | Type   | Required | Description                  |
| ----- | ------ | -------- | ---------------------------- |
| value | string | No       | Config value (max 255 chars) |

**Response:** `200 OK`

---

## Featured Items

### List Featured Items

Get all active featured items.

```
GET /api/v1/featured-items
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "title": "New Basketball Collection",
      "description": "Check out our latest basketball card templates",
      "ctaText": "View Collection",
      "imageUrl": "https://cdn.example.com/featured/basketball.jpg",
      "templateId": 1,
      "displayOrder": 1,
      "isActive": true,
      "template": {...}
    }
  ]
}
```

### Get Featured Item

```
GET /api/v1/featured-items/:id
```

**Response:** `200 OK`

### Create Featured Item (Admin Only)

```
POST /api/v1/featured-items
```

**Headers:** `Authorization: Bearer <admin_token>`

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field        | Type    | Required | Description                           |
| ------------ | ------- | -------- | ------------------------------------- |
| title        | string  | Yes      | Title (1-255 chars)                   |
| description  | string  | No       | Description                           |
| ctaText      | string  | No       | Call-to-action text (max 100 chars)   |
| image        | file    | No       | Image file (jpg, jpeg, png, max 10MB) |
| templateId   | number  | No       | Associated template ID                |
| displayOrder | number  | No       | Display order (min: 0)                |
| isActive     | boolean | No       | Active status                         |

**Response:** `201 Created`

### Update Featured Item (Admin Only)

```
PUT /api/v1/featured-items/:id
```

**Headers:** `Authorization: Bearer <admin_token>`

**Content-Type:** `multipart/form-data`

**Request Body:** Same as create, all fields optional.

**Response:** `200 OK`

### Delete Featured Item (Admin Only)

```
DELETE /api/v1/featured-items/:id
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response:** `204 No Content`

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request

```json
{
  "message": "Bad request description"
}
```

### 401 Unauthorized

```json
{
  "message": "You are not authorized to access this resource"
}
```

### 403 Forbidden

```json
{
  "message": "Access denied"
}
```

### 404 Not Found

```json
{
  "message": "Resource not found"
}
```

### 422 Validation Error

```json
{
  "errors": [
    {
      "message": "The email field must be a valid email address",
      "rule": "email",
      "field": "email"
    }
  ]
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

---

## Data Types

### User Object

| Field     | Type    | Description              |
| --------- | ------- | ------------------------ |
| id        | number  | User ID                  |
| firstName | string  | First name               |
| lastName  | string  | Last name                |
| email     | string  | Email address            |
| phone     | string  | Phone number             |
| role      | string  | `admin`, `user`, `guest` |
| isAdmin   | boolean | Is admin user            |
| isGuest   | boolean | Is guest user            |
| fullName  | string  | Full name (computed)     |

### Template Attribute Types

| Type     | Description            |
| -------- | ---------------------- |
| `color`  | Color picker attribute |
| `image`  | Image upload attribute |
| `string` | Text input attribute   |

### Template Side Values

| Value   | Description   |
| ------- | ------------- |
| `front` | Front of card |
| `back`  | Back of card  |
