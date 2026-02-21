# Plan: Mobile Optimization (Quick Task 001)

Optimize the UI for mobile screens, fixing overflows and improving touch interaction.

## Analysis
- **Nav.tsx**: Fixed layout with `flex gap-8` might overflow. Need to make it responsive.
- **LandingClient.tsx**: Large margins/padding might be too much for small screens.
- **PostCard.tsx**: Spacing for touch and handling potential overflow in titles/metadata.
- **globals.css**: Global font scaling and button sizes.
- **PostPageClient.tsx** & **write/page.tsx**: Need to check these for mobile readiness.

## Tasks
1. **Nav.tsx**: Update to handle small screens (e.g., hidden labels or reduced gap).
2. **LandingClient.tsx**: Adjust hero padding and font sizes.
3. **PostCard.tsx**: Optimize for mobile layout (stacking if necessary).
4. **globals.css**: Improve button padding for touch and global responsive tweaks.
5. **Write Page**: Ensure form fields are mobile-friendly.

## Verification
- Visual inspection of code for responsive Tailwind classes (`sm:`, `md:`, etc.).
- Ensure no fixed widths causing horizontal scroll.
