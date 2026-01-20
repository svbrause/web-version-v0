# Skin Type Minimalist - React + TypeScript

This is the React + TypeScript version of the skin type minimalist app, converted from vanilla JavaScript for better maintainability and componentization.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Edit `.env` and add your API keys (see [ENV_SETUP.md](./ENV_SETUP.md) for details)
   ```bash
   cp .env.example .env
   # Then edit .env with your actual API keys
   ```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
src/
├── components/
│   ├── screens/          # Screen components
│   │   ├── ConcernsScreen.tsx
│   │   ├── AreasScreen.tsx
│   │   ├── AgeScreen.tsx
│   │   ├── SkinTypeScreen.tsx
│   │   ├── SkinToneScreen.tsx
│   │   ├── EthnicBackgroundScreen.tsx
│   │   ├── ReviewScreen.tsx
│   │   ├── CelebrationScreen.tsx
│   │   ├── LeadCaptureScreen.tsx
│   │   └── ResultsScreen.tsx
│   ├── Header.tsx
│   ├── NextButton.tsx
│   └── ConsultationModal.tsx
├── context/
│   └── AppContext.tsx    # State management
├── constants/
│   └── data.ts          # Data constants
├── types/
│   └── index.ts         # TypeScript types
├── App.tsx              # Main app component
├── App.css              # Styles (copied from original)
├── main.tsx             # Entry point
└── index.css            # Base styles
```

## 🎯 Key Features

- **TypeScript**: Full type safety
- **React Context**: Centralized state management
- **Component-based**: Each screen is a separate component
- **Session Storage**: State persists across page refreshes
- **Same Styling**: Uses the original CSS file

## 🔧 Development

### Adding a New Screen

1. Create a new component in `src/components/screens/`
2. Add it to `App.tsx` routing logic
3. Update the `FORM_STEPS` constant if needed

### State Management

State is managed through React Context (`AppContext`). Access it in any component:

```tsx
import { useApp } from '../context/AppContext';

function MyComponent() {
  const { state, updateState, goToNextStep } = useApp();
  // ...
}
```

### Type Definitions

All types are defined in `src/types/index.ts`. Add new types there as needed.

## 📝 TODO / Next Steps

- [ ] Implement case matching logic in ResultsScreen
- [ ] Add treatment grouping functionality
- [ ] Implement "Not Sure" flow for skin type
- [ ] Add case detail modal
- [ ] Connect lead capture to backend
- [ ] Add form validation
- [ ] Implement case data loading from Airtable
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add unit tests

## 🐛 Known Issues

- Results screen needs full implementation of case matching
- Consultation modal needs backend integration
- Case data loading needs to be implemented
- "Not Sure" flow for skin type needs completion

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Vite Documentation](https://vitejs.dev)

## 📂 Location

This React project is located in the `skin-type-react/` folder, separate from the original vanilla JavaScript files in the parent directory.
