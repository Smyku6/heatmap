# 🚀 Enterprise TypeScript Migration Plan
## Roadmap do poziomu Enterprise za 3-6 miesięcy

---

## 📊 AKTUALNY STATUS

### ✅ Zrobione (Week 1-2):
- [x] TypeScript setup z strict mode
- [x] Wszystkie komponenty React (.tsx)
- [x] Store Zustand z typami
- [x] Podstawowe type definitions (src/types/index.ts)
- [x] Build działa bez błędów
- [x] **PHASE 1.1**: Wszystkie utils migrowane do .ts (tcxParser, pitchDetection, perspectiveTransform)
- [x] **PHASE 1.1**: Wszystkie config migrowane do .ts (pitches, performances)
- [x] **PHASE 1.2**: Enhanced TypeScript configuration (gradual migration)
- [x] **PHASE 1.2**: CSS module type declarations (vite-env.d.ts)
- [x] **PHASE 1.2**: Fixed type definition conflicts (GoalDimensions, PenaltyBoxDimensions, SatelliteData)

### 🔄 W trakcie (Phase 1.2 - Strict Configuration):
- [~] 21 błędów TypeScript do naprawienia przed włączeniem wszystkich strict rules
  - Głównie: implicit any, null checks, type narrowing

### ⚠️ Do zrobienia (Phase 1.3+):
- [ ] Naprawić pozostałe 21 błędów kompilacji
- [ ] Włączyć wszystkie strict rules (noImplicitAny, strictNullChecks, etc.)
- [ ] Type guards i type narrowing (Phase 1.3)
- [ ] Brak zaawansowanych TypeScript patterns (Phase 2)
- [ ] ESLint + TypeScript rules (Phase 3)

---

## 🎯 FAZA 1: Fundamenty Enterprise (Week 2-3)

### 1.1 Migrate Remaining Files to TypeScript
**Priority: HIGH** 🔴

#### Config Files:
```typescript
// src/config/pitches.ts
export interface PitchConfig {
  id: string;
  name: string;
  location: string;
  dimensions: { width: number; length: number };
  corners: {
    topLeft: { lat: number; lon: number };
    topRight: { lat: number; lon: number };
    bottomLeft: { lat: number; lon: number };
    bottomRight: { lat: number; lon: number };
  };
  satellite?: {
    url: string;
    transforms: Record<OrientationType, SatelliteTransform>;
  };
}

export const PITCHES: Record<string, PitchConfig> = { ... }
export const DEFAULT_PITCH_ID: string = 'orlik-kopernika';
```

#### Utils Files:
```typescript
// src/utils/tcxParser.ts
export function parseTCX(tcxContent: string): TrackPoint[]
export function prepareVisualizationData(
  points: TrackPoint[],
  segmentType: SegmentType,
  pitchId: string,
  orientation: OrientationType,
  sprintSettings: SprintSettings | null
): VisualizationData

// src/utils/pitchDetection.ts
export function autoDetectPitch(points: TrackPoint[]): string | null
export function calculatePitchCenter(corners: PitchCorners): { lat: number; lon: number }

// src/utils/perspectiveTransform.ts
export function transformPoint(
  point: { lat: number; lon: number },
  corners: PitchCorners,
  canvasSize: { width: number; height: number }
): { x: number; y: number }
```

**Benefit:**
- 100% type coverage w projekcie
- Autocomplete dla wszystkich funkcji
- Compile-time errors w utils

---

### 1.2 Strict TypeScript Configuration
**Priority: HIGH** 🔴

#### Enhanced tsconfig.json:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Dodatkowe checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Import/Export
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,

    // Type checking
    "skipLibCheck": false  // Sprawdzaj również .d.ts files
  }
}
```

**Benefit:**
- Maximum type safety
- Catch więcej błędów w compile time
- Enterprise-level strictness

---

### 1.3 Type Guards & Type Narrowing
**Priority: MEDIUM** 🟡

```typescript
// src/utils/typeGuards.ts
export function isSession(obj: unknown): obj is Session {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'rawPoints' in obj &&
    'pitchId' in obj
  );
}

export function isTrackPoint(obj: unknown): obj is TrackPoint {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'lat' in obj &&
    'lon' in obj &&
    'time' in obj
  );
}

export function isDurationObject(
  duration: unknown
): duration is { formatted: string; seconds: number } {
  return (
    typeof duration === 'object' &&
    duration !== null &&
    'formatted' in duration &&
    'seconds' in duration
  );
}

// Użycie:
function formatDuration(duration: string | { formatted: string; seconds: number }): string {
  if (isDurationObject(duration)) {
    return duration.formatted;
  }
  return duration;
}
```

**Benefit:**
- Runtime type validation
- Bezpieczniejszy kod
- Lepsze error handling

---

## 🎯 FAZA 2: Advanced TypeScript Patterns (Week 4-5)

### 2.1 Generic Types & Utility Types
**Priority: MEDIUM** 🟡

```typescript
// src/types/utils.ts

// Generic API Response
export type ApiResponse<T> = {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: Date;
};

// Generic State Handler
export type StateHandler<T> = {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  reset: () => void;
};

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

// Przykład użycia:
export type PartialSessionUpdate = DeepPartial<Session>;
export type ReadonlyPitchConfig = DeepReadonly<PitchConfig>;
```

**Benefit:**
- Reusable type patterns
- Type transformations
- Better API contracts

---

### 2.2 Discriminated Unions
**Priority: MEDIUM** 🟡

```typescript
// src/types/state.ts

// Loading States
export type LoadingState<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

// File Upload States
export type FileUploadState =
  | { type: 'idle' }
  | { type: 'selecting' }
  | { type: 'parsing'; progress: number }
  | { type: 'success'; sessionId: string }
  | { type: 'error'; message: string };

// Action Types (dla reducers)
export type SessionAction =
  | { type: 'ADD_SESSION'; payload: Session }
  | { type: 'REMOVE_SESSION'; payload: string }
  | { type: 'UPDATE_SESSION'; payload: { id: string; updates: Partial<Session> } }
  | { type: 'CLEAR_ALL' };

// Użycie w komponencie:
function handleFileState(state: FileUploadState) {
  switch (state.type) {
    case 'idle':
      return <UploadButton />;
    case 'parsing':
      return <ProgressBar progress={state.progress} />;
    case 'success':
      return <SuccessMessage sessionId={state.sessionId} />;
    case 'error':
      return <ErrorMessage message={state.message} />;
  }
}
```

**Benefit:**
- Type-safe state machines
- Exhaustive checking
- Better error handling

---

### 2.3 Branded Types (Type Safety++)
**Priority: LOW** 🟢

```typescript
// src/types/branded.ts

// Prevent mixing different ID types
export type SessionId = string & { readonly brand: unique symbol };
export type PitchId = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };

// Factory functions
export function createSessionId(id: string): SessionId {
  return id as SessionId;
}

export function createPitchId(id: string): PitchId {
  return id as PitchId;
}

// Użycie:
function loadSession(sessionId: SessionId) { ... }
function loadPitch(pitchId: PitchId) { ... }

// ❌ Compile error - nie możesz pomylić typów:
const pitchId = createPitchId('orlik-1');
loadSession(pitchId); // ERROR!

// ✅ OK:
const sessionId = createSessionId('session-123');
loadSession(sessionId); // OK!
```

**Benefit:**
- Prevent ID mix-ups
- Better type safety
- Self-documenting code

---

## 🎯 FAZA 3: Enterprise Tooling (Week 6-7)

### 3.1 ESLint + TypeScript Rules
**Priority: HIGH** 🔴

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

```json
// .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/strict-boolean-expressions": "warn",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn"
  }
}
```

**Benefit:**
- Automatic code quality
- Prevent common errors
- Team consistency

---

### 3.2 Prettier + TypeScript Integration
**Priority: MEDIUM** 🟡

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

**Benefit:**
- Consistent formatting
- No style debates
- Auto-format on save

---

### 3.3 Husky + lint-staged (Pre-commit Hooks)
**Priority: MEDIUM** 🟡

```bash
npm install --save-dev husky lint-staged
npx husky install
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "tsc --noEmit"
    ]
  }
}
```

**Benefit:**
- Prevent bad commits
- Auto-fix before commit
- Type check before push

---

## 🎯 FAZA 4: Advanced Patterns (Week 8-10)

### 4.1 Dependency Injection Pattern
**Priority: LOW** 🟢

```typescript
// src/services/SessionService.ts
export interface ISessionService {
  loadSession(id: SessionId): Promise<Session>;
  saveSession(session: Session): Promise<void>;
  deleteSession(id: SessionId): Promise<void>;
}

export class SessionService implements ISessionService {
  constructor(
    private storage: IStorageProvider,
    private parser: ITCXParser
  ) {}

  async loadSession(id: SessionId): Promise<Session> {
    const data = await this.storage.get(id);
    return this.parser.parse(data);
  }
}

// Użycie w komponencie:
const sessionService = new SessionService(
  new LocalStorageProvider(),
  new TCXParser()
);
```

**Benefit:**
- Testable code
- Swappable dependencies
- Clean architecture

---

### 4.2 Repository Pattern
**Priority: LOW** 🟢

```typescript
// src/repositories/SessionRepository.ts
export class SessionRepository {
  private readonly storageKey = 'sessions';

  async findAll(): Promise<Session[]> {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  async findById(id: SessionId): Promise<Session | null> {
    const sessions = await this.findAll();
    return sessions.find(s => s.id === id) ?? null;
  }

  async save(session: Session): Promise<void> {
    const sessions = await this.findAll();
    const index = sessions.findIndex(s => s.id === session.id);

    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(sessions));
  }

  async delete(id: SessionId): Promise<void> {
    const sessions = await this.findAll();
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }
}
```

**Benefit:**
- Separation of concerns
- Easy to swap storage
- Better testing

---

### 4.3 Builder Pattern
**Priority: LOW** 🟢

```typescript
// src/builders/SessionBuilder.ts
export class SessionBuilder {
  private session: Partial<Session> = {};

  withId(id: SessionId): this {
    this.session.id = id;
    return this;
  }

  withRawPoints(points: TrackPoint[]): this {
    this.session.rawPoints = points;
    return this;
  }

  withPitchId(pitchId: PitchId): this {
    this.session.pitchId = pitchId;
    return this;
  }

  build(): Session {
    if (!this.session.id || !this.session.rawPoints) {
      throw new Error('Session must have id and rawPoints');
    }
    return this.session as Session;
  }
}

// Użycie:
const session = new SessionBuilder()
  .withId(createSessionId('123'))
  .withRawPoints(points)
  .withPitchId(createPitchId('orlik-1'))
  .build();
```

**Benefit:**
- Fluent API
- Validation during build
- Immutable objects

---

## 🎯 FAZA 5: Testing & Documentation (Week 11-12)

### 5.1 Type Testing
**Priority: HIGH** 🔴

```bash
npm install --save-dev @typescript-eslint/utils tsd
```

```typescript
// src/__tests__/types.test.ts
import { expectType, expectError } from 'tsd';
import type { Session, SessionId } from '../types';

// Test that SessionId is not assignable to string
expectError<SessionId>('regular-string');

// Test that Session has required fields
expectType<Session>({
  id: createSessionId('123'),
  rawPoints: [],
  pitchId: createPitchId('orlik'),
  // ... all required fields
});
```

**Benefit:**
- Test your types
- Prevent type regressions
- Document type expectations

---

### 5.2 JSDoc Comments dla TypeScript
**Priority: MEDIUM** 🟡

```typescript
/**
 * Parses TCX file content and extracts GPS tracking points
 *
 * @param tcxContent - Raw XML content of TCX file
 * @returns Array of tracking points with GPS coordinates and metadata
 * @throws {Error} If TCX content is invalid or missing required fields
 *
 * @example
 * ```typescript
 * const tcx = await readFile('activity.tcx');
 * const points = parseTCX(tcx);
 * console.log(points.length); // Number of GPS points
 * ```
 */
export function parseTCX(tcxContent: string): TrackPoint[] {
  // ...
}

/**
 * Session representing a football training activity
 *
 * @remarks
 * Sessions are created from TCX files and contain GPS tracking data,
 * pitch information, and calculated metrics like distance and duration.
 *
 * @example
 * ```typescript
 * const session: Session = {
 *   id: createSessionId('123'),
 *   rawPoints: points,
 *   pitchId: createPitchId('orlik-kopernika'),
 *   activityDate: new Date(),
 *   totalDuration: '1h 30m 0s',
 *   totalDistance: 5000,
 *   totalAvgHeartRate: 145,
 *   totalPointCount: 1800,
 *   pitchInfo: { ... },
 *   visualizationData: { ... }
 * };
 * ```
 */
export interface Session {
  // ...
}
```

**Benefit:**
- Better IDE tooltips
- Documentation in code
- Examples for developers

---

### 5.3 Generated Documentation
**Priority: LOW** 🟢

```bash
npm install --save-dev typedoc
```

```json
// typedoc.json
{
  "entryPoints": ["src/types/index.ts", "src/store/useAppStore.ts"],
  "out": "docs/api",
  "plugin": ["typedoc-plugin-markdown"]
}
```

**Benefit:**
- Auto-generated docs
- Always up-to-date
- API reference for team

---

## 📦 FAZA 6: Advanced Store Typing (Week 13-14)

### 6.1 Typed Zustand Slices
**Priority: MEDIUM** 🟡

```typescript
// src/store/slices/sessionSlice.ts
export interface SessionSlice {
  sessions: Session[];
  currentSessionId: SessionId | null;
  addSession: (session: Session) => void;
  removeSession: (id: SessionId) => void;
  loadSession: (id: SessionId) => void;
}

export const createSessionSlice: StateCreator<
  AppState,
  [],
  [],
  SessionSlice
> = (set, get) => ({
  sessions: [],
  currentSessionId: null,
  addSession: (session) => set((state) => ({
    sessions: [session, ...state.sessions]
  })),
  // ...
});

// src/store/slices/uiSlice.ts
export interface UISlice {
  showHeatmap: boolean;
  showSprints: boolean;
  selectedSegment: SegmentType;
  setShowHeatmap: (show: boolean) => void;
  // ...
}

// Combine slices:
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (...a) => ({
        ...createSessionSlice(...a),
        ...createUISlice(...a),
      }),
      { name: 'heatmap-storage' }
    )
  )
);
```

**Benefit:**
- Better organization
- Smaller files
- Easier to maintain

---

### 6.2 Store Selectors z Reselect
**Priority: MEDIUM** 🟡

```typescript
// src/store/selectors.ts
import { createSelector } from 'reselect';

// Basic selectors
export const selectSessions = (state: AppState) => state.sessions;
export const selectCurrentSessionId = (state: AppState) => state.currentSessionId;

// Memoized selectors
export const selectCurrentSession = createSelector(
  [selectSessions, selectCurrentSessionId],
  (sessions, currentId) =>
    currentId ? sessions.find(s => s.id === currentId) : null
);

export const selectSessionsByPitch = createSelector(
  [selectSessions, (_: AppState, pitchId: PitchId) => pitchId],
  (sessions, pitchId) => sessions.filter(s => s.pitchId === pitchId)
);

// Użycie:
const currentSession = useAppStore(selectCurrentSession);
const orlinkSessions = useAppStore(state => selectSessionsByPitch(state, 'orlik-1'));
```

**Benefit:**
- Performance optimization
- Prevent unnecessary re-renders
- Reusable selectors

---

## 🎯 PRIORYTETYZACJA

### Must Have (Miesiąc 1-2):
1. ✅ Migrate utils & config to TypeScript
2. ✅ Strict tsconfig.json
3. ✅ ESLint + TypeScript rules
4. ✅ Type guards dla critical functions
5. ✅ JSDoc comments

### Should Have (Miesiąc 3-4):
1. Discriminated unions dla state
2. Generic types & utility types
3. Prettier integration
4. Pre-commit hooks
5. Store slices pattern

### Nice to Have (Miesiąc 5-6):
1. Branded types
2. Dependency injection
3. Repository pattern
4. Type testing
5. Generated documentation

---

## 📈 METRYKI SUKCESU

### Techniczne:
- [ ] 0 TypeScript errors
- [ ] 0 ESLint errors
- [ ] 100% type coverage (wszystkie pliki .ts/.tsx)
- [ ] < 5% any types w kodzie
- [ ] Build time < 500ms

### Code Quality:
- [ ] Wszystkie publiczne funkcje mają JSDoc
- [ ] Wszystkie komponenty mają prop types
- [ ] Type guards dla runtime validation
- [ ] No implicit any w całym projekcie

### Developer Experience:
- [ ] IDE autocomplete działa wszędzie
- [ ] Type errors widoczne od razu
- [ ] Documentation dostępna w IDE
- [ ] Pre-commit hooks działają

---

## 🚀 NASTĘPNE KROKI (Teraz!)

1. **Migrate utils to TypeScript** (2-3 godziny)
2. **Migrate config to TypeScript** (1 godzina)
3. **Add ESLint** (1 godzina)
4. **Type guards dla utils** (2 godziny)
5. **JSDoc comments** (2-3 godziny)

**Total Time:** ~10 godzin dla Phase 1

---

## 📋 REMAINING ISSUES (21 errors)

### Critical Fixes Needed Before Full Strict Mode:

**1. FileReader type safety (2 errors)**
- `src/components/FileSelector.tsx:27` - ArrayBuffer vs string type
- `src/components/SatelliteControls.tsx:98` - ArrayBuffer vs string type
- **Fix**: Add type guard for FileReader result

**2. HeatmapLayer type narrowing (6 errors)**
- Lines 34, 38, 57, 64, 65 - `unknown` type issues
- **Fix**: Add proper type annotations for heatmap data structures

**3. tcxParser type issues (11 errors)**
- Lines 254, 268-270, 325, 379, 416 - Arithmetic operations on unknown types
- Line 564 - SegmentData array type mismatch
- Line 568 - Distance should be object not number
- **Fix**: Add explicit types to helper functions

**4. Pitch component (1 error)**
- Line 338 - Arithmetic operation type
- **Fix**: Type guard for numeric values

**5. SquadMaker pitchCorners (1 error)**
- Type mismatch PitchCorner[] vs PitchCorners
- **Fix**: Use correct type from beginning

### Next Action Items:
1. Fix FileReader type safety with type guards
2. Add explicit return types to tcxParser helpers
3. Enable `noImplicitAny` after fixes
4. Enable `strictNullChecks` after null safety
5. Full strict mode enabled → Phase 1 complete! 🎉
