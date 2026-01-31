# GiftOS Prototype - AI Gift Advisor

This is an interactive prototype of the GiftOS AI Gift Advisor feature, showcasing the conversational interface for finding perfect gifts.

## Features Demonstrated

- **Conversational AI Interface**: Chat-based interaction with simulated AI responses
- **Product Recommendations**: Visual product cards with ratings, prices, and merchant info
- **Quick Actions**: Pre-defined prompts to get started quickly
- **Modern UI**: Beautiful gradient design with smooth animations
- **Responsive Layout**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the prototype directory:
```bash
cd prototype
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Try the Demo

The prototype simulates an AI conversation flow:

1. **Start**: The AI greets you and asks who you're shopping for
2. **Provide details**: Type something like "I need a gift for my mom"
3. **Occasion**: The AI asks about the occasion (e.g., "It's her birthday")
4. **Budget & Interests**: Share budget and interests (e.g., "Around $50-100, she loves reading and cozy things")
5. **Recommendations**: The AI suggests 3 personalized gift ideas with product cards

### Quick Actions

Click any of the quick action buttons to see pre-filled prompts:
- Gift for Mom
- Birthday Gift
- Group Gift
- Surprise Me

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icon library

## Project Structure

```
prototype/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main chat interface
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Top navigation
│   ├── ChatMessage.tsx     # Message bubbles
│   ├── ProductCard.tsx     # Product recommendations
│   └── QuickActions.tsx    # Quick action buttons
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Key Components

### ChatMessage
Displays user and AI messages with avatars, timestamps, and optional product recommendations.

### ProductCard
Shows product details including:
- Product image with save button
- Title, rating, and reviews
- Merchant name
- Price and view button
- Gift-worthiness indicator

### QuickActions
Pre-defined prompts to help users get started quickly with common gift scenarios.

## Customization

### Colors
Edit `tailwind.config.ts` to change the color scheme:
```typescript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Simulated Responses
Edit the `simulateAIResponse` function in `app/page.tsx` to customize the conversation flow and product recommendations.

## Future Enhancements

This prototype demonstrates core functionality. The production version would include:

- Real AI integration (GPT-4/Claude API)
- Actual product database with live data
- User authentication and profiles
- Save to wishlist functionality
- Price tracking and alerts
- Visual search capability
- Multi-store checkout routing

## Notes

- This is a **visual prototype** with simulated AI responses
- Product images are from Unsplash (placeholder)
- No backend or database required to run
- Designed to showcase UX and interaction patterns

## License

Proprietary - GiftOS Platform
