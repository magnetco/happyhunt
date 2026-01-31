# Epics and User Stories: GiftOS

## Overview

This document details all user stories organized by epic, with acceptance criteria, technical requirements, and priority levels. Stories are designed to be implemented iteratively across 4 phases.

---

## Epic 1: Discovery & Capture
**Goal**: Enable users to discover and save gift ideas from anywhere on the web
**Priority**: P0 (MVP Critical)
**Estimated Duration**: 6-8 weeks

### Story 1.1: Visual Product Search
**Priority**: P1 (Phase 2)
**Story Points**: 13
**Dependencies**: Product catalog, vector database

**User Story**:
```
AS A gift giver
I WANT TO upload an inspiration photo
SO THAT I can find similar products across multiple stores
```

**Acceptance Criteria**:
- [ ] User can upload image from device or paste image URL
- [ ] System identifies products in the image
- [ ] Returns 20+ visually similar items from 10+ retailers
- [ ] Results can be filtered by price range ($0-$50, $50-$100, etc.)
- [ ] Results can be filtered by category (home, fashion, tech, etc.)
- [ ] Results can be filtered by occasion (birthday, wedding, etc.)
- [ ] User can save any result to wishlist with one click
- [ ] Search results load in <3 seconds
- [ ] Works on mobile and desktop

**Technical Requirements**:
- Computer vision model: CLIP ViT-B/32 for image embeddings
- Vector database: Pinecone or Milvus with 512-dim image vectors
- Image preprocessing: Resize to 224x224, normalize
- Similarity search: Cosine similarity, top-k=50, then re-rank
- API endpoint: `POST /api/ai/visual-search`

**API Contract**:
```typescript
POST /api/ai/visual-search
Request:
{
  imageUrl?: string,
  imageFile?: File,
  filters?: {
    priceMin?: number,
    priceMax?: number,
    category?: string,
    occasion?: string
  }
}

Response:
{
  results: Array<{
    productId: string,
    title: string,
    price: number,
    imageUrl: string,
    merchant: string,
    similarityScore: number
  }>,
  processingTimeMs: number
}
```

**UI Mockup Notes**:
- Drag-and-drop upload zone
- Pinterest-style grid of results
- Hover shows quick-add button
- Filter sidebar on left

---

### Story 1.2: Conversational Gift Advisor
**Priority**: P0 (MVP Critical)
**Story Points**: 21
**Dependencies**: LLM integration, product catalog

**User Story**:
```
AS A gift giver who's stuck
I WANT TO chat with an AI advisor
SO THAT I get personalized gift recommendations
```

**Acceptance Criteria**:
- [ ] User can start conversation from any page
- [ ] AI asks clarifying questions about:
  - Who the gift is for (relationship, age, interests)
  - What occasion (birthday, holiday, etc.)
  - Budget range
  - Any specific preferences or constraints
- [ ] AI researches current products and prices
- [ ] AI presents 3-5 curated recommendations with rationale
- [ ] Each recommendation shows product card (image, title, price, merchant)
- [ ] User can provide feedback: "More like this", "Not interested", "Too expensive"
- [ ] AI refines recommendations based on feedback
- [ ] User can save any recommendation to wishlist
- [ ] Conversation history is saved for future sessions
- [ ] Responses stream in real-time (not all at once)
- [ ] Mobile-friendly chat interface

**Technical Requirements**:
- LLM: GPT-4 Turbo or Claude 3 Opus
- Function calling for product search
- RAG (Retrieval Augmented Generation) with product knowledge base
- Conversation memory: Store in PostgreSQL `ai_conversations` table
- Streaming: Server-Sent Events (SSE) or WebSocket
- Context window management: Summarize old messages if >8K tokens

**System Prompt**:
```
You are a thoughtful gift advisor helping someone find the perfect gift. 
Your goal is to understand the recipient's tastes and the occasion, then 
recommend 3-5 specific products that would make great gifts.

Ask clarifying questions one at a time:
1. Who is this gift for? (relationship, age, interests)
2. What's the occasion?
3. What's your budget?
4. Any specific preferences? (hobbies, favorite colors, etc.)

Then use the search_products function to find relevant items. Present 
recommendations with clear reasoning for why each gift is a good fit.

Be conversational, empathetic, and concise. If the user seems uncertain, 
offer to explore different directions.
```

**API Contract**:
```typescript
POST /api/ai/advisor
Request:
{
  conversationId?: string, // null for new conversation
  message: string,
  context?: {
    recipientId?: string,
    occasion?: string,
    budget?: { min: number, max: number }
  }
}

Response (SSE stream):
{
  type: 'message' | 'function_call' | 'recommendation',
  content: string,
  recommendations?: Array<ProductCard>,
  conversationId: string
}
```

**UI Components**:
- Chat bubble interface (user vs. AI)
- Product cards embedded in chat
- Quick action buttons ("Save", "More like this")
- Typing indicator while AI responds
- Mobile: Full-screen modal
- Desktop: Side panel or modal

---

### Story 1.3: Browser Extension - Universal Capture
**Priority**: P0 (MVP Critical)
**Story Points**: 13
**Dependencies**: Backend API, product normalization

**User Story**:
```
AS A user browsing any online store
I WANT TO save products with one click
SO THAT I can build wishlists across all stores
```

**Acceptance Criteria**:
- [ ] Extension available for Chrome, Firefox, Safari
- [ ] Detects product pages automatically (shows badge on icon)
- [ ] One-click "Add to GiftOS" button appears on product pages
- [ ] Extracts: title, price, images, variants (size/color), availability
- [ ] User can assign to recipient and occasion before saving
- [ ] User can add notes
- [ ] Saves to cloud immediately (with loading state)
- [ ] Works on 1000+ major retailers (Amazon, Target, Etsy, Shopify stores, etc.)
- [ ] Graceful fallback if extraction fails (manual entry)
- [ ] Offline queue: Saves locally if no internet, syncs when online

**Technical Requirements**:
- Framework: Plasmo (supports Chrome, Firefox, Safari)
- Manifest V3 for Chrome/Edge, V2 for Firefox
- Content script injection on all pages
- Product detection: Check for structured data (JSON-LD, microdata) or common selectors
- Extraction strategies:
  1. JSON-LD schema.org/Product
  2. OpenGraph meta tags
  3. CSS selectors (per-merchant patterns)
  4. Fallback: Manual entry form
- Storage: chrome.storage.sync for settings, IndexedDB for offline queue
- API: POST /api/products/capture

**Extraction Logic**:
```typescript
// Content script
async function detectProduct(): Promise<ProductData | null> {
  // Strategy 1: Structured data
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    const data = JSON.parse(jsonLd.textContent);
    if (data['@type'] === 'Product') {
      return normalizeStructuredData(data);
    }
  }
  
  // Strategy 2: OpenGraph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogPrice = document.querySelector('meta[property="og:price:amount"]');
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogTitle && ogPrice) {
    return {
      title: ogTitle.content,
      price: parseFloat(ogPrice.content),
      imageUrl: ogImage?.content,
      url: window.location.href
    };
  }
  
  // Strategy 3: Merchant-specific selectors
  const merchant = getMerchantFromDomain(window.location.hostname);
  if (merchant && MERCHANT_SELECTORS[merchant]) {
    return extractWithSelectors(MERCHANT_SELECTORS[merchant]);
  }
  
  return null; // Fallback to manual entry
}
```

**UI Components**:
- Popup: Quick-save form (recipient, occasion, notes)
- Side panel (Chrome): Full wishlist view
- Badge: Shows number of items in wishlist
- Settings page: Login, preferences, merchant patterns

---

### Story 1.4: Mobile Share Sheet Integration
**Priority**: P1 (Phase 2)
**Story Points**: 8
**Dependencies**: Mobile app, backend API

**User Story**:
```
AS A mobile user
I WANT TO share products from any app
SO THAT I can save gifts on the go
```

**Acceptance Criteria**:
- [ ] iOS Share Extension shows "Add to GiftOS" option
- [ ] Android Intent Filter shows "Add to GiftOS" option
- [ ] Works from Instagram, TikTok, Safari, Chrome, retail apps
- [ ] Same extraction logic as browser extension
- [ ] User can assign recipient/occasion in share sheet
- [ ] Saves to cloud immediately
- [ ] Offline queue with sync when online
- [ ] Shows confirmation toast after save

**Technical Requirements**:
- iOS: Share Extension target in Xcode
- Android: Intent Filter for ACTION_SEND
- Shared code: React Native module for extraction
- API: Same as extension (POST /api/products/capture)

**iOS Share Extension**:
```swift
// ShareViewController.swift
class ShareViewController: UIViewController {
  override func viewDidLoad() {
    super.viewDidLoad()
    
    if let item = extensionContext?.inputItems.first as? NSExtensionItem {
      if let attachments = item.attachments {
        for attachment in attachments {
          if attachment.hasItemConformingToTypeIdentifier("public.url") {
            attachment.loadItem(forTypeIdentifier: "public.url") { url, error in
              if let shareURL = url as? URL {
                self.captureProduct(from: shareURL)
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Epic 2: Organization & Intelligence
**Goal**: Help users organize saved items and leverage AI for better recommendations
**Priority**: P0 (MVP Critical)
**Estimated Duration**: 4-6 weeks

### Story 2.1: Recipient Profiles with Taste AI
**Priority**: P0 (MVP Critical)
**Story Points**: 13
**Dependencies**: User service, ML recommendation engine

**User Story**:
```
AS A gift giver
I WANT TO build profiles for people I buy gifts for
SO THAT I get better recommendations over time
```

**Acceptance Criteria**:
- [ ] User can create recipient profiles (name, relationship, birthday)
- [ ] Can add optional details: sizes (shirt, shoe, etc.), favorite colors, interests
- [ ] Can tag saved items by recipient
- [ ] AI learns taste preferences from saved items over time
- [ ] "Things they'd love" section shows auto-suggestions
- [ ] Can import birthdays from contacts (with permission)
- [ ] Privacy controls: Profiles are private by default
- [ ] Can share profile with family group (opt-in)
- [ ] Profile shows: upcoming occasion, gift history, budget spent

**Technical Requirements**:
- Database: `recipients` table with taste_vector column
- Taste vector generation:
  - Aggregate embeddings of all saved items for recipient
  - Weight recent items higher (exponential decay)
  - Normalize to unit vector
- Recommendation query:
  - Find products with similar taste_vector
  - Filter by occasion, price range
  - Exclude already-saved items
- Contact import: iOS Contacts API, Android Contacts Provider

**Taste Vector Algorithm**:
```python
def generate_taste_vector(recipient_id: str) -> np.ndarray:
    # Get all saved items for recipient
    saved_items = db.query(
        "SELECT product_id, created_at FROM saved_items WHERE recipient_id = %s",
        [recipient_id]
    )
    
    # Get product embeddings
    embeddings = []
    weights = []
    now = datetime.now()
    
    for item in saved_items:
        product = db.get_product(item.product_id)
        embedding = product.embedding
        
        # Time decay: Recent items weighted higher
        days_ago = (now - item.created_at).days
        weight = np.exp(-days_ago / 90)  # 90-day half-life
        
        embeddings.append(embedding)
        weights.append(weight)
    
    # Weighted average
    taste_vector = np.average(embeddings, axis=0, weights=weights)
    
    # Normalize
    taste_vector = taste_vector / np.linalg.norm(taste_vector)
    
    return taste_vector
```

**API Contract**:
```typescript
POST /api/recipients
Request:
{
  name: string,
  relationship?: string,
  birthday?: string, // ISO date
  sizes?: { shirt?: string, shoe?: string },
  interests?: string[]
}

GET /api/recipients/:id/recommendations
Response:
{
  recommendations: Array<ProductCard>,
  reasoning: string // "Based on 12 items you've saved for Sarah..."
}
```

---

### Story 2.2: Occasion Calendar & Smart Reminders
**Priority**: P0 (MVP Critical)
**Story Points**: 8
**Dependencies**: Notification service

**User Story**:
```
AS A user
I WANT TO track important gift occasions
SO THAT I never miss a birthday or holiday
```

**Acceptance Criteria**:
- [ ] Calendar view shows upcoming occasions
- [ ] Auto-detects birthdays from recipient profiles
- [ ] Can add custom occasions (anniversary, graduation, etc.)
- [ ] Smart reminders: 2 weeks, 1 week, 3 days before
- [ ] Shipping deadline warnings based on location
- [ ] Budget tracking per occasion
- [ ] Shows gift ideas for upcoming occasions
- [ ] Can mark occasion as "completed" after gift is given
- [ ] Recurring occasions (birthdays, anniversaries) auto-repeat

**Technical Requirements**:
- Database: `occasions` table
- Reminder scheduling: Celery beat or cron jobs
- Notification channels: Email, push, SMS (opt-in)
- Shipping deadline calculation:
  - User location → recipient location
  - Carrier API (USPS, UPS, FedEx) for estimates
  - Buffer: Add 2-3 days for safety

**Reminder Logic**:
```typescript
// Daily cron job
async function sendOccasionReminders() {
  const now = new Date();
  const twoWeeks = addDays(now, 14);
  const oneWeek = addDays(now, 7);
  const threeDays = addDays(now, 3);
  
  // Find occasions in reminder windows
  const occasions = await db.occasions.findUpcoming([
    twoWeeks, oneWeek, threeDays
  ]);
  
  for (const occasion of occasions) {
    const user = await db.users.findById(occasion.userId);
    const daysUntil = differenceInDays(occasion.date, now);
    
    // Check if we've already sent this reminder
    if (await hasReminderBeenSent(occasion.id, daysUntil)) {
      continue;
    }
    
    // Send reminder
    await sendEmail({
      to: user.email,
      subject: `${occasion.name} is in ${daysUntil} days`,
      template: 'occasion-reminder',
      data: {
        occasionName: occasion.name,
        recipientName: occasion.recipient.name,
        daysUntil,
        giftIdeas: await getRecommendations(occasion.recipientId)
      }
    });
    
    // Mark as sent
    await markReminderSent(occasion.id, daysUntil);
  }
}
```

---

### Story 2.3: AI-Powered Gift Boards (Pinterest-like)
**Priority**: P1 (Phase 2)
**Story Points**: 13
**Dependencies**: Product catalog, AI categorization

**User Story**:
```
AS A user
I WANT TO organize gifts into visual boards
SO THAT I can plan themed gifts or events
```

**Acceptance Criteria**:
- [ ] User can create unlimited boards
- [ ] Board examples: "Mom's 60th Birthday", "Wedding Registry", "Christmas 2026"
- [ ] Drag-and-drop products between boards
- [ ] Board has cover image (auto-selected or custom)
- [ ] Board has description and tags
- [ ] Boards can be public or private
- [ ] Collaborative boards: Invite others to add items
- [ ] AI suggests board organization ("These items would work well together")
- [ ] AI detects themes (e.g., "kitchen", "outdoor", "tech")
- [ ] Can share board via link
- [ ] Board analytics: Total value, most expensive item, price range

**Technical Requirements**:
- Database: `boards` table, `board_items` join table
- AI categorization: Cluster saved items by embedding similarity
- Theme detection: K-means clustering on product embeddings
- Collaborative: Real-time sync with WebSocket or polling

**AI Board Suggestions**:
```python
def suggest_board_organization(user_id: str) -> List[BoardSuggestion]:
    # Get all uncategorized saved items
    items = db.saved_items.find({
        "user_id": user_id,
        "board_id": None
    })
    
    # Get embeddings
    embeddings = [item.product.embedding for item in items]
    
    # Cluster into themes
    kmeans = KMeans(n_clusters=5)
    clusters = kmeans.fit_predict(embeddings)
    
    # Name clusters based on common categories
    suggestions = []
    for cluster_id in range(5):
        cluster_items = [items[i] for i, c in enumerate(clusters) if c == cluster_id]
        
        # Find most common category
        categories = [item.product.category for item in cluster_items]
        theme = Counter(categories).most_common(1)[0][0]
        
        suggestions.append({
            "theme": theme,
            "items": cluster_items,
            "suggestedName": f"{theme.title()} Gifts"
        })
    
    return suggestions
```

---

## Epic 3: Coordination & Social
**Goal**: Enable families and groups to coordinate gift-giving
**Priority**: P1 (Phase 2)
**Estimated Duration**: 6-8 weeks

### Story 3.1: Group Gifting with Split Payments
**Priority**: P1 (Phase 2)
**Story Points**: 21
**Dependencies**: Stripe Connect integration

**User Story**:
```
AS A group of friends
WE WANT TO chip in for an expensive gift
SO THAT we can give something meaningful together
```

**Acceptance Criteria**:
- [ ] User can create group gift campaign for any product
- [ ] Set target amount and optional deadline
- [ ] Invite contributors via link, email, or SMS
- [ ] Contributors can pledge custom amounts or choose from suggestions
- [ ] Real-time progress bar shows funding status
- [ ] Payment via Stripe (credit card, Apple Pay, Google Pay)
- [ ] Funds held in escrow until goal met or deadline passes
- [ ] If goal met: Organizer receives funds to purchase gift
- [ ] If goal not met: Contributors can choose to proceed or get refund
- [ ] 5-8% platform fee (industry standard)
- [ ] Email notifications: Contribution received, goal reached, etc.
- [ ] Thank you message from organizer to contributors

**Technical Requirements**:
- Stripe Connect: Organizer creates Connect account
- Payment flow:
  1. Contributor pays → Stripe holds funds
  2. Goal reached → Transfer to organizer (minus platform fee)
  3. Goal not reached → Refund contributors
- Database: `group_gifts` and `gift_contributions` tables
- Webhook handling: Stripe payment events

**Stripe Integration**:
```typescript
// Create group gift
async function createGroupGift(data: GroupGiftData) {
  // Create Stripe Connect account for organizer
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email: data.organizerEmail,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    }
  });
  
  // Create group gift record
  const groupGift = await db.groupGifts.create({
    ...data,
    stripeAccountId: account.id,
    status: 'active'
  });
  
  return groupGift;
}

// Process contribution
async function contributeToGroupGift(groupGiftId: string, amount: number, contributorId: string) {
  const groupGift = await db.groupGifts.findById(groupGiftId);
  
  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: 'usd',
    application_fee_amount: Math.floor(amount * 0.07 * 100), // 7% platform fee
    transfer_data: {
      destination: groupGift.stripeAccountId
    },
    metadata: {
      group_gift_id: groupGiftId,
      contributor_id: contributorId
    }
  });
  
  return paymentIntent;
}

// Webhook handler
async function handlePaymentSuccess(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const { group_gift_id, contributor_id } = paymentIntent.metadata;
  
  // Record contribution
  await db.giftContributions.create({
    groupGiftId: group_gift_id,
    contributorId: contributor_id,
    amount: paymentIntent.amount / 100,
    stripePaymentIntentId: paymentIntent.id
  });
  
  // Update group gift total
  const groupGift = await db.groupGifts.increment(
    group_gift_id,
    'current_amount',
    paymentIntent.amount / 100
  );
  
  // Check if goal reached
  if (groupGift.current_amount >= groupGift.target_amount) {
    await notifyGoalReached(groupGift);
  }
}
```

---

### Story 3.2: Purchase Marking & Duplicate Prevention
**Priority**: P0 (MVP Critical)
**Story Points**: 8
**Dependencies**: Group service, real-time sync

**User Story**:
```
AS A gift giver in a family group
I WANT TO mark items as "claimed" secretly
SO THAT others don't buy the same gift
```

**Acceptance Criteria**:
- [ ] "I'm buying this" button on saved items (when viewing group member's wishlist)
- [ ] Item shows as "claimed" to other group members (not recipient)
- [ ] Claimed by whom is visible to group (not recipient)
- [ ] Can unclaim if plans change
- [ ] Recipient never sees claim status
- [ ] Real-time updates: If someone else claims while you're viewing, you see it immediately
- [ ] Works across all stores (not store-specific)
- [ ] Mobile and desktop

**Technical Requirements**:
- Database: `purchase_claims` table with unique constraint
- Real-time: WebSocket or Server-Sent Events for live updates
- Permission logic:
  - Recipient: Cannot see claims on their own wishlist
  - Group members: Can see claims on others' wishlists
  - Claimer: Can unclaim their own claims

**Permission Check**:
```typescript
function canSeeClaim(viewerId: string, wishlistOwnerId: string, claimerId: string): boolean {
  // Recipient cannot see claims on their own wishlist
  if (viewerId === wishlistOwnerId) {
    return false;
  }
  
  // Group members can see who claimed
  if (areInSameGroup(viewerId, wishlistOwnerId)) {
    return true;
  }
  
  return false;
}

// API endpoint
app.get('/api/saved-items/:id', async (req, res) => {
  const item = await db.savedItems.findById(req.params.id);
  const claim = await db.purchaseClaims.findBySavedItemId(req.params.id);
  
  const response = {
    ...item,
    isClaimed: !!claim,
    claimedBy: canSeeClaim(req.user.id, item.userId, claim?.claimedBy)
      ? claim.claimedBy
      : null
  };
  
  res.json(response);
});
```

---

### Story 3.3: Shared Family/Friend Wishlists
**Priority**: P0 (MVP Critical)
**Story Points**: 13
**Dependencies**: Group service, user service

**User Story**:
```
AS A family member
I WANT TO see everyone's wishlists in one place
SO THAT gift-giving is easier year-round
```

**Acceptance Criteria**:
- [ ] User can create family/friend groups
- [ ] Invite members via email, link, or phone number
- [ ] See all group members' wishlists in one view
- [ ] Filter by person, occasion, price range
- [ ] Notification when someone adds to their list
- [ ] Privacy: Can hide specific items from group
- [ ] Can leave group
- [ ] Group admin can remove members

**Technical Requirements**:
- Database: `groups` and `group_members` tables
- Invite system: Generate unique invite code or email link
- Activity feed: Track when members add/remove items
- Notification: Email or push when new items added

**Group Dashboard**:
```typescript
// API endpoint
app.get('/api/groups/:id/wishlists', async (req, res) => {
  const group = await db.groups.findById(req.params.id);
  
  // Check membership
  if (!await isGroupMember(req.user.id, group.id)) {
    return res.status(403).json({ error: 'Not a group member' });
  }
  
  // Get all members
  const members = await db.groupMembers.findByGroupId(group.id);
  
  // Get wishlists for each member (excluding hidden items)
  const wishlists = await Promise.all(
    members.map(async (member) => {
      const items = await db.savedItems.find({
        userId: member.userId,
        hiddenFromGroup: false
      });
      
      return {
        member: member.user,
        items: items,
        upcomingOccasions: await db.occasions.findUpcoming(member.userId)
      };
    })
  );
  
  res.json({ group, wishlists });
});
```

---

## Epic 4: Checkout & Fulfillment
**Goal**: Make purchasing gifts as frictionless as possible
**Priority**: P0 (MVP Critical)
**Estimated Duration**: 4-6 weeks

### Story 4.1: Multi-Store Cart Routing (MVP)
**Priority**: P0 (MVP Critical)
**Story Points**: 13
**Dependencies**: Affiliate network integration

**User Story**:
```
AS A user ready to buy
I WANT TO checkout efficiently across multiple stores
SO THAT I don't have to manually visit each site
```

**Acceptance Criteria**:
- [ ] "Ready to Buy" view groups saved items by merchant
- [ ] Shows total per merchant and grand total
- [ ] One-click opens each merchant's cart (deep link if possible)
- [ ] Affiliate tracking on all links (FTC disclosure visible)
- [ ] Price/availability check before checkout
- [ ] Coupon auto-discovery (Honey-style)
- [ ] Order tracking: User can mark items as "purchased"
- [ ] Purchase history view

**Technical Requirements**:
- Affiliate link generation per network (Rakuten, CJ, ShareASale, Amazon)
- Deep linking:
  - Amazon: Add to cart via URL parameters
  - Shopify stores: /cart/add API
  - Others: Best effort, fallback to product page
- Price checking: Scrape or API call before checkout
- Coupon database: Integrate with RetailMeNot API or similar

**Checkout Flow**:
```typescript
// Generate checkout links
async function generateCheckoutLinks(savedItemIds: string[]) {
  const items = await db.savedItems.findByIds(savedItemIds);
  
  // Group by merchant
  const byMerchant = groupBy(items, item => item.product.merchant);
  
  const checkoutLinks = await Promise.all(
    Object.entries(byMerchant).map(async ([merchant, items]) => {
      // Check current prices
      const products = await refreshProductData(items.map(i => i.productId));
      
      // Find coupons
      const coupons = await findCoupons(merchant);
      
      // Generate affiliate links
      const links = items.map(item => ({
        productId: item.productId,
        affiliateUrl: generateAffiliateLink(item.product.productUrl, merchant)
      }));
      
      // Try to generate cart link
      const cartUrl = await generateCartUrl(merchant, products);
      
      return {
        merchant,
        items: products,
        coupons,
        cartUrl: cartUrl || null, // null means open products individually
        totalPrice: sum(products.map(p => p.price))
      };
    })
  );
  
  return checkoutLinks;
}

// Amazon cart URL
function generateAmazonCartUrl(products: Product[]): string {
  const asins = products.map(p => p.externalId).join(',');
  const quantities = products.map(() => '1').join(',');
  
  return `https://www.amazon.com/gp/aws/cart/add.html?` +
    `AssociateTag=${AMAZON_ASSOCIATE_TAG}&` +
    `ASIN.1=${asins}&Quantity.1=${quantities}`;
}
```

**FTC Disclosure UI**:
```tsx
function CheckoutDisclosure() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <InfoIcon className="text-blue-600 mt-0.5 mr-3" />
        <div className="text-sm text-gray-700">
          <strong>Affiliate Disclosure:</strong> We may earn a commission when 
          you purchase through our links. This helps keep GiftOS free for everyone.
          <a href="/affiliate-policy" className="text-blue-600 underline ml-1">
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

### Story 4.2: Price Drop Alerts & Smart Timing
**Priority**: P1 (Phase 2)
**Story Points**: 13
**Dependencies**: Price tracking system, ML prediction model

**User Story**:
```
AS A user
I WANT TO be notified when prices drop
SO THAT I can buy at the best time
```

**Acceptance Criteria**:
- [ ] Auto-track all saved items for price changes
- [ ] Email/push notification when price drops >10%
- [ ] Historical price chart (last 90 days)
- [ ] AI predicts best time to buy
- [ ] "Deal alert" badge on items with significant drops
- [ ] Can set custom price alert threshold
- [ ] Weekly digest of price drops across wishlist

**Technical Requirements**:
- Price scraping: Hourly for items with alerts, daily for others
- Database: `price_history` table
- ML model: LSTM or Prophet for price prediction
- Training data: Historical prices + seasonality + events
- Notification: Celery task checks for drops every hour

**Price Prediction Model**:
```python
# Train LSTM model on historical prices
def train_price_predictor(product_id: str):
    # Get historical prices
    prices = db.price_history.find({
        "product_id": product_id,
        "recorded_at": {"$gte": datetime.now() - timedelta(days=365)}
    })
    
    # Prepare time series
    df = pd.DataFrame(prices)
    df['date'] = pd.to_datetime(df['recorded_at'])
    df = df.set_index('date').resample('D').mean()
    
    # Add features
    df['day_of_week'] = df.index.dayofweek
    df['month'] = df.index.month
    df['is_holiday'] = df.index.isin(HOLIDAYS)
    
    # Train LSTM
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(30, 4)),
        LSTM(50),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')
    
    # Train on 30-day windows
    X, y = create_sequences(df, window=30)
    model.fit(X, y, epochs=50, batch_size=32)
    
    return model

# Predict next 30 days
def predict_best_buy_time(product_id: str) -> dict:
    model = load_model(product_id)
    current_price = get_current_price(product_id)
    
    # Predict next 30 days
    predictions = model.predict(last_30_days)
    
    # Find minimum
    min_idx = np.argmin(predictions)
    min_price = predictions[min_idx]
    
    # Calculate confidence
    confidence = 1 - (np.std(predictions) / np.mean(predictions))
    
    return {
        "current_price": current_price,
        "predicted_min_price": min_price,
        "days_until_min": min_idx,
        "confidence": confidence,
        "recommendation": "Wait" if min_price < current_price * 0.9 else "Buy now"
    }
}
```

---

### Story 4.3: Integrated Checkout (Phase 2 - Select Partners)
**Priority**: P2 (Phase 3)
**Story Points**: 34
**Dependencies**: Merchant partnerships, payment processing

**User Story**:
```
AS A user (future phase)
I WANT TO checkout once for multiple stores
SO THAT buying is frictionless
```

**Acceptance Criteria**:
- [ ] Single payment form for participating merchants
- [ ] Stored payment/shipping info (PCI compliant via Stripe)
- [ ] Order confirmation from each merchant
- [ ] Unified order tracking
- [ ] Returns handled per merchant policy
- [ ] Customer support escalation path

**Technical Requirements**:
- Merchant API integrations (start with Shopify partners)
- Payment orchestration: Stripe or similar
- Order management system
- Fulfillment coordination
- Customer support ticketing

**Note**: This is a Phase 3 feature requiring significant merchant partnerships. Start with affiliate model, add integrated checkout once we have leverage.

---

## Epic 5: AI-Enhanced Features
**Goal**: Leverage AI to provide unique value beyond basic shopping tools
**Priority**: P1 (Phase 2)
**Estimated Duration**: 4-6 weeks

### Story 5.1: Review Intelligence & Gift-Worthiness Scoring
**Priority**: P1 (Phase 2)
**Story Points**: 13
**Dependencies**: Review scraping, NLP models

**User Story**:
```
AS A gift giver
I WANT TO understand if a product makes a good gift
SO THAT I avoid disappointment
```

**Acceptance Criteria**:
- [ ] AI-summarized review insights (3-5 bullet points)
- [ ] "Gift-worthiness" score (1-10)
- [ ] Key pros/cons extraction
- [ ] Common complaints highlighted
- [ ] Sentiment trend over time
- [ ] "People say this is perfect for..." tags
- [ ] Works for products from any store

**Technical Requirements**:
- Review scraping: Aggregate from merchant site, Amazon, Google Shopping
- Sentiment analysis: Fine-tuned BERT or GPT-4
- Summarization: GPT-4 with structured output
- Gift-worthiness factors:
  - Quality mentions (durability, materials)
  - Packaging/presentation
  - Recipient reactions ("loved it", "perfect gift")
  - Return rate (if available)

**Review Analysis Pipeline**:
```python
async def analyze_reviews(product_id: str) -> ReviewInsights:
    # Scrape reviews
    reviews = await scrape_reviews(product_id)
    
    # Sentiment analysis
    sentiments = sentiment_model.predict([r.text for r in reviews])
    
    # Extract aspects
    aspects = extract_aspects(reviews)
    
    # Summarize with GPT-4
    summary = await openai.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{
            "role": "system",
            "content": "Summarize product reviews for someone considering this as a gift."
        }, {
            "role": "user",
            "content": f"Reviews:\n{format_reviews(reviews)}"
        }],
        response_format={"type": "json_object"}
    )
    
    # Calculate gift-worthiness score
    gift_score = calculate_gift_score(
        sentiments=sentiments,
        aspects=aspects,
        reviews=reviews
    )
    
    return {
        "summary": summary.choices[0].message.content,
        "gift_worthiness_score": gift_score,
        "positive_aspects": aspects["positive"],
        "negative_aspects": aspects["negative"],
        "sentiment_trend": calculate_trend(sentiments),
        "total_reviews": len(reviews)
    }

def calculate_gift_score(sentiments, aspects, reviews) -> float:
    # Base score from sentiment
    base_score = np.mean([s.score for s in sentiments]) * 10
    
    # Boost for gift-specific mentions
    gift_keywords = ["gift", "present", "loved it", "perfect", "packaging"]
    gift_mentions = sum(
        1 for r in reviews 
        if any(kw in r.text.lower() for kw in gift_keywords)
    )
    gift_boost = min(gift_mentions / len(reviews) * 2, 2)
    
    # Penalty for quality issues
    quality_issues = ["broke", "cheap", "returned", "disappointed"]
    issue_count = sum(
        1 for r in reviews
        if any(issue in r.text.lower() for issue in quality_issues)
    )
    quality_penalty = min(issue_count / len(reviews) * 3, 3)
    
    final_score = base_score + gift_boost - quality_penalty
    return max(1, min(10, final_score))
}
```

---

### Story 5.2: Occasion-Aware Recommendations
**Priority**: P1 (Phase 2)
**Story Points**: 13
**Dependencies**: Recommendation engine, occasion data

**User Story**:
```
AS A user
I WANT TO see gift suggestions for upcoming occasions
SO THAT I'm inspired and prepared
```

**Acceptance Criteria**:
- [ ] Homepage shows "Gifts for [Occasion] in [X] days"
- [ ] Personalized to recipient taste profile
- [ ] Budget-aware suggestions
- [ ] Trending gifts for that occasion
- [ ] "Others also bought" for similar recipients
- [ ] Can dismiss or save recommendations

**Technical Requirements**:
- Recommendation algorithm:
  - Recipient taste vector
  - Occasion category (birthday, wedding, etc.)
  - Budget constraints
  - Trending products for occasion
  - Collaborative filtering (similar users)
- Real-time: Update daily
- A/B testing: Experiment with different algorithms

---

### Story 5.3: Natural Language Search
**Priority**: P1 (Phase 2)
**Story Points**: 8
**Dependencies**: Semantic search, LLM

**User Story**:
```
AS A user
I WANT TO search using natural descriptions
SO THAT I can find gifts without knowing exact terms
```

**Acceptance Criteria**:
- [ ] Search like "something cozy for my mom who loves reading"
- [ ] AI interprets intent and preferences
- [ ] Returns relevant products across categories
- [ ] Can refine with follow-up queries
- [ ] Search history for inspiration

**Technical Requirements**:
- Query understanding: GPT-4 to extract:
  - Recipient attributes (mom, loves reading)
  - Gift attributes (cozy)
  - Budget (if mentioned)
  - Occasion (if mentioned)
- Semantic search: Generate embedding, search vector DB
- Re-ranking: LLM scores results by relevance

---

## Epic 6: Platform & Infrastructure
**Goal**: Build robust, scalable infrastructure to support all features
**Priority**: P0 (MVP Critical)
**Estimated Duration**: Ongoing

### Story 6.1: Product Catalog & Data Pipeline
**Priority**: P0 (MVP Critical)
**Story Points**: 21
**Dependencies**: None (foundational)

**Technical Requirements**:
- Scrape/API from 1000+ retailers
- Normalize product data
- Generate embeddings
- Real-time availability checking
- Price history tracking
- Affiliate link management
- Broken link detection & cleanup

---

### Story 6.2: Analytics & Insights Dashboard
**Priority**: P1 (Phase 2)
**Story Points**: 13

**Features**:
- User analytics (engagement, retention, conversion)
- Product analytics (popular items, categories)
- Revenue analytics (affiliate commissions, subscriptions)
- AI performance metrics

---

### Story 6.3: Compliance & Trust
**Priority**: P0 (MVP Critical)
**Story Points**: 8

**Requirements**:
- FTC affiliate disclosure
- GDPR/CCPA compliance
- PCI DSS (via Stripe)
- Terms of Service & Privacy Policy
- Cookie consent
- Accessibility (WCAG 2.1 AA)

---

## Implementation Roadmap

### Phase 1: MVP (Months 1-3)
**Goal**: Validate core value proposition

**Stories**:
- 1.3: Browser extension
- 2.1: Recipient profiles
- 2.2: Occasion calendar
- 3.2: Purchase marking
- 3.3: Shared wishlists
- 4.1: Multi-store cart routing
- 6.1: Product catalog
- 6.3: Compliance

**Success Metrics**:
- 10K users
- 50K products saved
- 5% conversion rate

### Phase 2: AI Core (Months 4-6)
**Goal**: Differentiate with AI features

**Stories**:
- 1.2: Conversational advisor
- 1.1: Visual search
- 5.1: Review intelligence
- 5.2: Occasion recommendations
- 5.3: Natural language search

**Success Metrics**:
- 50K users
- 85% AI recommendation acceptance
- 15 min avg session time

### Phase 3: Social & Monetization (Months 7-9)
**Goal**: Drive viral growth and revenue

**Stories**:
- 3.1: Group gifting
- 4.2: Price alerts
- 1.4: Mobile share sheet
- 2.3: Gift boards

**Success Metrics**:
- 200K users
- $500K revenue
- 3:1 LTV:CAC

### Phase 4: Scale & Optimize (Months 10-12)
**Goal**: Prepare for Series A

**Stories**:
- 4.3: Integrated checkout (select partners)
- Advanced AI features
- B2B corporate gifting
- International expansion

**Success Metrics**:
- 500K users
- $2M revenue
- Product-market fit validated

---

## Conclusion

This epic and story structure provides a clear roadmap for building GiftOS iteratively. Each story is independently valuable, testable, and contributes to the overall vision of becoming the operating system for modern gifting.

The phased approach allows us to:
1. **Validate quickly** with MVP
2. **Differentiate** with AI in Phase 2
3. **Scale** with viral features in Phase 3
4. **Monetize** sustainably across all phases

Total estimated development time: **12-15 months** to full product-market fit.
