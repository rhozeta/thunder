# Onboarding Tour

This component provides an interactive onboarding experience for new users.

## Features

- **Interactive Tour**: Step-by-step guide through all major pages
- **Visual Previews**: Each step shows what the page looks like with key features
- **Progress Tracking**: Shows current step and allows navigation
- **Skippable**: Users can skip the tour at any time
- **Persistent**: Remembers if user has completed the tour
- **Resettable**: Easy reset option in sidebar

## How to Use

### Automatic Trigger
The tour automatically triggers on first login after a 1.5 second delay.

### Manual Reset
- Use the "Restart Tour" button in the sidebar Help section
- Or clear localStorage: `localStorage.removeItem('onboardingCompleted')`

### Testing
1. Clear your browser's localStorage for the site
2. Refresh the page
3. The tour should automatically appear

## Components

- `OnboardingModal.tsx`: Main tour component
- `useOnboarding.ts`: Hook for managing onboarding state
- `OnboardingResetButton.tsx`: Reset button component

## Customization

To customize the tour content, edit the `onboardingSteps` array in `OnboardingModal.tsx`:

```typescript
const onboardingSteps: OnboardingStep[] = [
  {
    id: 'dashboard',
    title: 'Dashboard - Your Command Center',
    description: 'Get a complete overview of your real estate business',
    pageName: 'Dashboard',
    icon: Home,
    features: [
      'Quick stats showing total contacts, properties, and deals',
      // ... more features
    ],
    tips: [
      'Check your dashboard daily for quick updates',
      // ... more tips
    ]
  },
  // ... more steps
]
```
