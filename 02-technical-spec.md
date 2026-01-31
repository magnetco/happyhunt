# Technical Specification: GiftOS Platform

## System Architecture Overview

GiftOS is a modern, AI-powered e-commerce platform built on a microservices architecture with a focus on scalability, performance, and AI/ML capabilities.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐           │
│  │ Web App  │  │ Mobile   │  │    Browser     │           │
│  │ Next.js  │  │   App    │  │   Extension    │           │
│  └──────────┘  └──────────┘  └────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│              (Authentication, Rate Limiting)                 │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Product    │  │     User     │  │      AI      │
│   Service    │  │   Service    │  │   Service    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │  │  Vector DB   │
│  + pgvector  │  │    Cache     │  │  (Pinecone)  │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Technology Stack

### Frontend

#### Web Application
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.0+
- **UI Library**: React 18+
- **Styling**: Tailwind CSS 3.4+
- **Component Library**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand or Jotai
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Analytics**: PostHog or Mixpanel

**Key Features**:
- Server-side rendering for SEO
- Incremental static regeneration for product pages
- Optimistic UI updates
- Progressive Web App (PWA) capabilities

#### Mobile Application
- **Framework**: React Native 0.73+ or Flutter 3.16+
- **State**: Redux Toolkit or Riverpod (Flutter)
- **Navigation**: React Navigation or Flutter Navigator
- **Storage**: AsyncStorage / Hive
- **Push Notifications**: Firebase Cloud Messaging

#### Browser Extension
- **Framework**: Plasmo (modern extension framework)
- **Manifest**: V3 (Chrome/Firefox/Safari compatible)
- **Language**: TypeScript
- **Build**: Vite
- **Storage**: chrome.storage.sync API

**Extension Capabilities**:
- Content script injection for product detection
- Background service worker for API calls
- Side panel UI (Chrome) or popup
- Context menu integration
- Keyboard shortcuts

### Backend

#### API Services
- **Primary**: Node.js 20+ with Express or Fastify
- **Alternative**: Python 3.11+ with FastAPI
- **Language**: TypeScript (Node) or Python
- **API Style**: RESTful + GraphQL (Apollo Server)
- **Documentation**: OpenAPI 3.1 (Swagger)
- **Validation**: Zod (TypeScript) or Pydantic (Python)

#### Microservices

**1. Product Service**
- Product catalog management
- Scraping orchestration
- Price tracking
- Availability checking
- Affiliate link generation

**2. User Service**
- Authentication (JWT + refresh tokens)
- Profile management
- Recipient profiles
- Occasion calendar
- Preferences

**3. AI Service**
- Conversational advisor (LLM integration)
- Visual search (computer vision)
- Recommendation engine
- Review sentiment analysis
- Natural language search

**4. Checkout Service**
- Cart management
- Multi-store routing
- Affiliate tracking
- Order history
- Price alerts

**5. Social Service**
- Group management
- Shared wishlists
- Purchase marking
- Group gifting (payments)
- Activity feeds

**6. Notification Service**
- Email (transactional + marketing)
- Push notifications
- SMS reminders
- In-app notifications

### Databases & Storage

#### Primary Database: PostgreSQL 16+
**Schema Design**:

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipients (people you buy gifts for)
CREATE TABLE recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100),
  birthday DATE,
  sizes JSONB, -- {shirt: 'M', shoe: '10', etc}
  preferences JSONB, -- interests, favorite colors, etc
  taste_vector vector(1536), -- AI-generated taste embedding
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255), -- merchant's product ID
  merchant VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  image_urls TEXT[],
  product_url TEXT NOT NULL,
  affiliate_url TEXT,
  category VARCHAR(100),
  availability VARCHAR(50),
  embedding vector(1536), -- semantic search
  image_embedding vector(512), -- visual search (CLIP)
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Items (user's wishlist items)
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  recipient_id UUID REFERENCES recipients(id),
  occasion VARCHAR(100), -- 'birthday', 'christmas', 'wedding', etc
  board_id UUID REFERENCES boards(id),
  priority INTEGER DEFAULT 5, -- 1-10 scale
  notes TEXT,
  price_alert_threshold DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boards (Pinterest-like collections)
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_collaborative BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groups (families/friend circles)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES users(id),
  invite_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Members
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Purchase Claims (who's buying what)
CREATE TABLE purchase_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_item_id UUID REFERENCES saved_items(id) ON DELETE CASCADE,
  claimed_by UUID REFERENCES users(id),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  purchased_at TIMESTAMPTZ,
  UNIQUE(saved_item_id) -- only one person can claim
);

-- Group Gifts
CREATE TABLE group_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  organizer_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES recipients(id),
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  deadline TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'funded', 'completed', 'cancelled'
  stripe_account_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Gift Contributions
CREATE TABLE gift_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_gift_id UUID REFERENCES group_gifts(id) ON DELETE CASCADE,
  contributor_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id VARCHAR(255),
  contributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price History (for alerts & predictions)
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Conversations
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL, -- [{role: 'user', content: '...'}, ...]
  context JSONB, -- recipient info, occasion, budget, etc
  recommendations JSONB, -- products suggested
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**:
```sql
-- Vector similarity search
CREATE INDEX ON products USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON products USING ivfflat (image_embedding vector_cosine_ops);
CREATE INDEX ON recipients USING ivfflat (taste_vector vector_cosine_ops);

-- Standard indexes
CREATE INDEX ON saved_items(user_id, created_at DESC);
CREATE INDEX ON saved_items(recipient_id);
CREATE INDEX ON products(merchant, external_id);
CREATE INDEX ON price_history(product_id, recorded_at DESC);
```

#### Cache Layer: Redis 7+
**Use Cases**:
- Session storage (JWT refresh tokens)
- Rate limiting (per-user, per-IP)
- Real-time data (price changes, availability)
- Job queues (BullMQ)
- Pub/sub (real-time notifications)
- Leaderboards (trending products)

**Key Patterns**:
```
user:session:{user_id} -> JWT data (TTL: 7 days)
rate_limit:{ip}:{endpoint} -> request count (TTL: 1 minute)
product:price:{product_id} -> current price (TTL: 1 hour)
trending:products -> sorted set (score = popularity)
```

#### Vector Database: Pinecone or Milvus
**Collections**:
1. **product_embeddings** (1536 dimensions, OpenAI text-embedding-3)
   - Semantic search on product titles/descriptions
   - ~10M vectors at scale

2. **image_embeddings** (512 dimensions, CLIP ViT-B/32)
   - Visual similarity search
   - ~10M vectors at scale

3. **taste_profiles** (1536 dimensions, aggregated from saved items)
   - Recipient preference matching
   - ~1M vectors at scale

**Metadata Filters**:
- Category, price range, merchant, availability
- Enables hybrid search (vector + filters)

#### Search Engine: Elasticsearch 8+ or Typesense
**Indexes**:
- **products**: Full-text search on titles, descriptions
- **reviews**: Searchable review content
- **users**: User/recipient search within groups

**Features**:
- Fuzzy matching for typos
- Synonym handling
- Faceted search (category, price, brand)
- Autocomplete suggestions

#### Object Storage: AWS S3 or Cloudflare R2
**Buckets**:
- `user-uploads`: Profile pictures, board covers
- `product-images`: Cached product images
- `scraped-data`: Raw HTML/JSON from scraping

### AI/ML Infrastructure

#### Large Language Models (LLMs)
**Primary**: OpenAI GPT-4 Turbo or Anthropic Claude 3 Opus

**Use Cases**:
1. **Conversational Gift Advisor**
   - System prompt with gift-giving expertise
   - Function calling for product search
   - Streaming responses for better UX

2. **Review Summarization**
   - Extract key pros/cons
   - Generate "gift-worthiness" insights
   - Sentiment analysis

3. **Natural Language Search**
   - Query understanding and expansion
   - Intent classification

**Implementation**:
```typescript
// Conversational advisor with function calling
const tools = [
  {
    name: "search_products",
    description: "Search for products matching criteria",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        category: { type: "string" },
        priceMin: { type: "number" },
        priceMax: { type: "number" }
      }
    }
  }
];

const response = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: conversationHistory,
  tools: tools,
  stream: true
});
```

#### Embedding Models
**Text**: OpenAI text-embedding-3-large (3072 dims, can reduce to 1536)
**Images**: OpenAI CLIP ViT-B/32 (512 dims)

**Pipeline**:
1. Product ingestion → generate embeddings → store in vector DB
2. User query → generate embedding → similarity search
3. Return top-k results with metadata

#### Computer Vision
**Model**: CLIP (Contrastive Language-Image Pre-training)

**Visual Search Flow**:
```python
# User uploads image
image = preprocess_image(uploaded_file)

# Generate embedding
with torch.no_grad():
    image_features = clip_model.encode_image(image)
    image_embedding = image_features.cpu().numpy()

# Search vector DB
results = pinecone_index.query(
    vector=image_embedding.tolist(),
    top_k=20,
    include_metadata=True,
    filter={"availability": "in_stock"}
)
```

#### Recommendation Engine
**Approaches**:

1. **Collaborative Filtering**
   - User-item matrix (saved items, purchases)
   - Matrix factorization (ALS algorithm)
   - "Users like you also saved..."

2. **Content-Based Filtering**
   - Product embeddings similarity
   - Recipient taste profile matching
   - "More like this"

3. **Hybrid Model**
   - Combine collaborative + content-based
   - Weighted ensemble (70% collaborative, 30% content)

4. **Contextual Bandits**
   - Occasion-aware recommendations
   - Budget constraints
   - Real-time learning from clicks

**Tech Stack**:
- **Training**: PyTorch, scikit-learn
- **Serving**: TorchServe or Modal
- **Feature Store**: Feast or Redis
- **Experimentation**: A/B testing with PostHog

#### Sentiment Analysis
**Model**: Fine-tuned BERT or DistilBERT

**Pipeline**:
```python
# Aggregate reviews for a product
reviews = fetch_reviews(product_id)

# Batch sentiment analysis
sentiments = sentiment_model.predict(reviews)

# Generate summary
summary = {
    "overall_sentiment": calculate_weighted_sentiment(sentiments),
    "positive_aspects": extract_aspects(reviews, sentiment="positive"),
    "negative_aspects": extract_aspects(reviews, sentiment="negative"),
    "gift_worthiness_score": calculate_gift_score(sentiments, aspects)
}
```

### Data Pipeline & ETL

#### Product Scraping Architecture
**Components**:
1. **Scraper Orchestrator** (Celery or Temporal)
2. **Scraper Workers** (Playwright/Puppeteer)
3. **Data Normalizer** (Python/Node.js)
4. **Embedding Generator** (Python + GPU)
5. **Storage Layer** (PostgreSQL + Vector DB)

**Scraping Strategy**:
```
Priority 1: Merchant APIs (if available)
Priority 2: Structured data (JSON-LD, microdata)
Priority 3: DOM scraping (CSS selectors)
Priority 4: AI extraction (GPT-4 Vision for images)
```

**Scraper Example**:
```typescript
// Playwright-based scraper
async function scrapeProduct(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(url);
  
  // Try structured data first
  const jsonLd = await page.evaluate(() => {
    const script = document.querySelector('script[type="application/ld+json"]');
    return script ? JSON.parse(script.textContent) : null;
  });
  
  if (jsonLd?.['@type'] === 'Product') {
    return normalizeStructuredData(jsonLd);
  }
  
  // Fallback to DOM scraping
  const product = await page.evaluate(() => ({
    title: document.querySelector('h1')?.textContent,
    price: document.querySelector('[itemprop="price"]')?.textContent,
    images: Array.from(document.querySelectorAll('img[itemprop="image"]'))
      .map(img => img.src)
  }));
  
  await browser.close();
  return normalizeProduct(product);
}
```

**Scraping Schedule**:
- High-priority products (saved by users): Every 4 hours
- Medium-priority (trending): Daily
- Low-priority (catalog): Weekly
- Price tracking: Every 1 hour for items with alerts

#### Background Jobs (Celery/BullMQ)
**Job Types**:
1. **Scraping Jobs**
   - `scrape_product(url)`
   - `update_product_prices(product_ids)`
   - `check_availability(product_ids)`

2. **AI Jobs**
   - `generate_embeddings(product_id)`
   - `analyze_reviews(product_id)`
   - `update_taste_profile(recipient_id)`

3. **Notification Jobs**
   - `send_price_alert(user_id, product_id)`
   - `send_occasion_reminder(user_id, occasion_id)`
   - `send_weekly_digest(user_id)`

4. **Maintenance Jobs**
   - `cleanup_expired_claims()`
   - `update_trending_products()`
   - `backup_database()`

### External Integrations

#### Affiliate Networks
**Networks**:
- Rakuten Advertising
- CJ Affiliate (Commission Junction)
- ShareASale
- Amazon Associates
- Impact

**Link Generation**:
```typescript
function generateAffiliateLink(productUrl: string, network: string): string {
  const affiliateIds = {
    rakuten: process.env.RAKUTEN_AFFILIATE_ID,
    cj: process.env.CJ_AFFILIATE_ID,
    amazon: process.env.AMAZON_ASSOCIATE_TAG
  };
  
  // Example for Amazon
  if (productUrl.includes('amazon.com')) {
    const url = new URL(productUrl);
    url.searchParams.set('tag', affiliateIds.amazon);
    return url.toString();
  }
  
  // For other networks, use their link wrapping APIs
  return wrapWithAffiliateNetwork(productUrl, network);
}
```

#### Payment Processing: Stripe
**Use Cases**:
- Group gifting (Stripe Connect)
- Premium subscriptions (Stripe Billing)
- One-time purchases (future integrated checkout)

**Implementation**:
```typescript
// Create group gift payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: contributionAmount * 100, // cents
  currency: 'usd',
  metadata: {
    group_gift_id: groupGiftId,
    contributor_id: userId
  },
  transfer_data: {
    destination: organizerStripeAccountId // Stripe Connect
  }
});
```

#### Email: Resend or SendGrid
**Email Types**:
- Transactional: Welcome, password reset, purchase confirmation
- Notifications: Price alerts, occasion reminders, group gift updates
- Marketing: Weekly digest, gift guides, product recommendations

#### SMS: Twilio
**Use Cases**:
- Urgent reminders (gift deadline in 24 hours)
- Two-factor authentication
- Group gift contribution notifications

#### Analytics: PostHog or Mixpanel
**Events to Track**:
- User actions: `product_saved`, `board_created`, `ai_advisor_used`
- Conversions: `product_clicked`, `affiliate_link_clicked`, `purchase_completed`
- Engagement: `session_started`, `search_performed`, `recommendation_accepted`

### Security & Compliance

#### Authentication & Authorization
**Strategy**: JWT with refresh tokens

**Flow**:
1. User logs in → receive access token (15 min) + refresh token (7 days)
2. Access token in Authorization header for API calls
3. Refresh token stored in httpOnly cookie
4. Refresh endpoint to get new access token

**Implementation**:
```typescript
// JWT payload
interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

// Middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

#### Data Privacy (GDPR/CCPA)
**Requirements**:
- User consent for data collection
- Right to access (export user data)
- Right to deletion (anonymize/delete account)
- Data portability (JSON export)
- Cookie consent management

**Implementation**:
```typescript
// GDPR data export
async function exportUserData(userId: string) {
  const [user, recipients, savedItems, boards, groups] = await Promise.all([
    db.users.findById(userId),
    db.recipients.findByUserId(userId),
    db.savedItems.findByUserId(userId),
    db.boards.findByUserId(userId),
    db.groups.findByMemberId(userId)
  ]);
  
  return {
    user: sanitize(user),
    recipients: recipients.map(sanitize),
    savedItems: savedItems.map(sanitize),
    boards: boards.map(sanitize),
    groups: groups.map(sanitize),
    exportedAt: new Date().toISOString()
  };
}
```

#### FTC Affiliate Disclosure
**Requirements**:
- Clear and conspicuous disclosure
- Close to affiliate links
- Understandable language

**Implementation**:
```tsx
// Disclosure component
function AffiliateDisclosure() {
  return (
    <div className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded">
      <InfoIcon className="inline mr-2" />
      We may earn a commission when you purchase through our links. 
      This helps keep GiftOS free.
      <a href="/affiliate-policy" className="underline ml-1">Learn more</a>
    </div>
  );
}
```

#### Rate Limiting
**Strategy**: Token bucket algorithm via Redis

**Limits**:
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- AI endpoints: 10 requests/minute
- Scraping: 1 request/second per domain

#### PCI Compliance
**Strategy**: Never store payment data (use Stripe)
- All payments through Stripe (PCI Level 1 certified)
- No credit card data touches our servers
- Stripe.js for client-side tokenization

### Performance & Scalability

#### Caching Strategy
**Layers**:
1. **CDN** (Cloudflare): Static assets, images
2. **Redis**: API responses, product data, user sessions
3. **Browser**: Service worker, IndexedDB for offline

**Cache Invalidation**:
- Product data: 1 hour TTL, invalidate on scrape
- User data: Invalidate on mutation
- Search results: 5 minute TTL

#### Database Optimization
**Techniques**:
- Read replicas for analytics queries
- Connection pooling (PgBouncer)
- Prepared statements
- Query optimization (EXPLAIN ANALYZE)
- Partitioning (price_history by month)

#### API Performance
**Targets**:
- P50: <100ms
- P95: <500ms
- P99: <1s

**Techniques**:
- Response compression (gzip/brotli)
- Pagination (cursor-based)
- Field selection (GraphQL or sparse fieldsets)
- Batch endpoints (DataLoader pattern)

#### Monitoring & Observability
**Tools**:
- **APM**: Datadog or New Relic
- **Errors**: Sentry
- **Logs**: Loki or CloudWatch
- **Metrics**: Prometheus + Grafana
- **Uptime**: UptimeRobot or Pingdom

**Key Metrics**:
- Request rate, error rate, latency (RED)
- Database query performance
- AI API latency and costs
- Scraper success rate
- Cache hit rate

### Deployment & DevOps

#### Infrastructure
**Hosting**:
- **Frontend**: Vercel (Next.js optimized)
- **Backend**: Railway, Render, or AWS ECS
- **Database**: Supabase, Neon, or AWS RDS
- **Redis**: Upstash or AWS ElastiCache
- **Vector DB**: Pinecone (managed)

#### CI/CD Pipeline
**Tools**: GitHub Actions

**Workflow**:
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel deploy --prod
  
  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: railway up
```

#### Environment Management
**Environments**:
- **Development**: Local (Docker Compose)
- **Staging**: Preview deployments (Vercel/Railway)
- **Production**: Multi-region (US-East, US-West, EU)

#### Disaster Recovery
**Strategy**:
- Daily database backups (7-day retention)
- Point-in-time recovery (PITR)
- Multi-region replication
- Incident response playbook

### Development Workflow

#### Monorepo Structure
```
giftos/
├── apps/
│   ├── web/              # Next.js web app
│   ├── mobile/           # React Native app
│   ├── extension/        # Browser extension
│   └── api/              # Backend API
├── packages/
│   ├── ui/               # Shared UI components
│   ├── db/               # Database schema & migrations
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Shared utilities
├── services/
│   ├── scraper/          # Product scraping service
│   ├── ai/               # AI/ML service
│   └── worker/           # Background jobs
└── infrastructure/
    ├── docker/           # Docker configs
    └── terraform/        # Infrastructure as code
```

#### Testing Strategy
**Levels**:
1. **Unit Tests**: Jest, Vitest (80% coverage target)
2. **Integration Tests**: Supertest (API), Playwright (E2E)
3. **AI Tests**: Evaluation datasets for recommendation quality
4. **Load Tests**: k6 or Artillery

#### Code Quality
**Tools**:
- **Linting**: ESLint, Prettier
- **Type Checking**: TypeScript strict mode
- **Security**: Snyk, npm audit
- **Code Review**: GitHub PRs with required approvals

## API Specifications

### REST Endpoints

#### Products
```
GET    /api/products              # Search products
GET    /api/products/:id          # Get product details
POST   /api/products/scrape       # Scrape new product
GET    /api/products/:id/similar  # Visual/semantic similar products
```

#### Saved Items
```
GET    /api/saved-items           # User's saved items
POST   /api/saved-items           # Save a product
PATCH  /api/saved-items/:id       # Update saved item
DELETE /api/saved-items/:id       # Remove saved item
```

#### AI
```
POST   /api/ai/advisor            # Conversational gift advisor
POST   /api/ai/visual-search      # Upload image for search
POST   /api/ai/recommendations    # Get personalized recommendations
GET    /api/ai/review-summary/:id # AI-summarized reviews
```

#### Groups
```
GET    /api/groups                # User's groups
POST   /api/groups                # Create group
POST   /api/groups/:id/invite     # Invite member
GET    /api/groups/:id/wishlists  # All group member wishlists
```

### GraphQL Schema (Alternative)
```graphql
type Product {
  id: ID!
  title: String!
  description: String
  price: Float!
  imageUrls: [String!]!
  merchant: String!
  affiliateUrl: String!
  similarProducts(limit: Int = 10): [Product!]!
}

type SavedItem {
  id: ID!
  product: Product!
  recipient: Recipient
  occasion: String
  notes: String
  isClaimed: Boolean!
}

type Query {
  products(query: String, category: String, priceRange: PriceRange): [Product!]!
  savedItems(recipientId: ID, occasion: String): [SavedItem!]!
  recommendations(recipientId: ID, occasion: String, limit: Int): [Product!]!
}

type Mutation {
  saveProduct(productId: ID!, recipientId: ID, occasion: String): SavedItem!
  claimPurchase(savedItemId: ID!): PurchaseClaim!
}
```

## Conclusion

This technical specification provides a comprehensive blueprint for building GiftOS as a modern, scalable, AI-powered e-commerce platform. The architecture prioritizes:

1. **Modularity**: Microservices enable independent scaling and development
2. **AI-First**: LLMs, embeddings, and ML models are core infrastructure
3. **Performance**: Caching, CDN, and optimization at every layer
4. **Security**: JWT auth, data privacy, PCI compliance via Stripe
5. **Scalability**: Horizontal scaling, managed services, multi-region

The stack leverages proven technologies (PostgreSQL, Redis, Next.js) while incorporating cutting-edge AI capabilities (GPT-4, CLIP, vector search) to deliver a best-in-class user experience.
