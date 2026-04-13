# Discriminated Unions - Usage Examples

## 🎯 What are Discriminated Unions?

Discriminated unions (also called tagged unions) are a TypeScript pattern that provides type-safe state management using a common discriminator property (`type` or `status`).

### Key Benefits:
- ✅ **Exhaustive Checking** - TypeScript ensures you handle all cases
- ✅ **Type Narrowing** - Autocomplete knows exactly what properties exist
- ✅ **Runtime Safety** - No more `undefined is not an object` errors
- ✅ **Self-Documenting** - State machine is visible in the type

---

## 📚 Available Union Types

### 1. LoadingState<T, E>

Generic loading state for async operations.

```typescript
import { LoadingState, createLoadingState, createSuccessState } from '../types';

type SessionLoadingState = LoadingState<Session>;

const [state, setState] = useState<SessionLoadingState>({ status: 'idle' });

// Type-safe state transitions
async function loadSession(id: string) {
  setState(createLoadingState()); // { status: 'loading' }

  try {
    const data = await fetchSession(id);
    setState(createSuccessState(data)); // { status: 'success', data: Session }
  } catch (error) {
    setState({ status: 'error', error: error as Error });
  }
}

// Exhaustive rendering with type narrowing
function renderSession() {
  switch (state.status) {
    case 'idle':
      return <div>Click to load</div>;

    case 'loading':
      return <Spinner />;

    case 'success':
      // TypeScript knows state.data exists here!
      return <SessionCard session={state.data} />;

    case 'error':
      // TypeScript knows state.error exists here!
      return <ErrorMessage error={state.error} />;
  }
  // TypeScript will error if you miss a case! ✅
}
```

### 2. FileUploadState

Tracks file upload lifecycle with progress.

```typescript
import { FileUploadState } from '../types';

const [upload, setUpload] = useState<FileUploadState>({ type: 'idle' });

function handleFileSelect(file: File) {
  setUpload({ type: 'selecting' });

  const reader = new FileReader();

  reader.onprogress = (e) => {
    const progress = (e.loaded / e.total) * 100;
    setUpload({ type: 'parsing', progress }); // Type-safe!
  };

  reader.onload = () => {
    const sessionId = processFile(reader.result);
    setUpload({ type: 'success', sessionId });
  };

  reader.onerror = () => {
    setUpload({ type: 'error', message: 'Failed to read file' });
  };
}

// Render based on state
function renderUploadUI() {
  switch (upload.type) {
    case 'idle':
      return <UploadButton onClick={() => inputRef.current?.click()} />;

    case 'selecting':
      return <p>Opening file picker...</p>;

    case 'parsing':
      // TypeScript knows upload.progress exists!
      return <ProgressBar progress={upload.progress} />;

    case 'success':
      // TypeScript knows upload.sessionId exists!
      return <p>Created session: {upload.sessionId}</p>;

    case 'error':
      // TypeScript knows upload.message exists!
      return <ErrorAlert>{upload.message}</ErrorAlert>;
  }
}
```

### 3. FetchState<T, E>

Extended loading state with refresh capability.

```typescript
import { FetchState } from '../types';

type SessionsState = FetchState<Session[]>;

const [sessions, setSessions] = useState<SessionsState>({ status: 'idle' });

async function fetchSessions() {
  setSessions({ status: 'loading' });
  const data = await api.getSessions();
  setSessions({ status: 'success', data });
}

async function refreshSessions() {
  if (sessions.status === 'success') {
    // Keep showing old data while refreshing!
    setSessions({ status: 'refreshing', data: sessions.data });
    const data = await api.getSessions();
    setSessions({ status: 'success', data });
  }
}

function render() {
  switch (sessions.status) {
    case 'idle':
      return <button onClick={fetchSessions}>Load Sessions</button>;

    case 'loading':
      return <Spinner />;

    case 'success':
      return (
        <>
          <SessionsList sessions={sessions.data} />
          <button onClick={refreshSessions}>Refresh</button>
        </>
      );

    case 'refreshing':
      return (
        <>
          {/* Show old data while loading! */}
          <SessionsList sessions={sessions.data} opacity={0.5} />
          <RefreshSpinner />
        </>
      );

    case 'error':
      return <ErrorMessage error={sessions.error} />;
  }
}
```

### 4. ValidationState

Form field validation with async support.

```typescript
import { ValidationState } from '../types';

const [email, setEmail] = useState('');
const [emailState, setEmailState] = useState<ValidationState>({ status: 'pristine' });

async function validateEmail(value: string) {
  setEmailState({ status: 'validating' });

  const errors: string[] = [];

  if (!value.includes('@')) {
    errors.push('Invalid email format');
  }

  const exists = await api.checkEmailExists(value);
  if (exists) {
    errors.push('Email already taken');
  }

  if (errors.length > 0) {
    setEmailState({ status: 'invalid', errors });
  } else {
    setEmailState({ status: 'valid' });
  }
}

function renderEmailInput() {
  return (
    <div>
      <input
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          validateEmail(e.target.value);
        }}
      />

      {emailState.status === 'validating' && <Spinner />}

      {emailState.status === 'valid' && (
        <p style={{ color: 'green' }}>✓ Valid email</p>
      )}

      {emailState.status === 'invalid' && (
        <ul style={{ color: 'red' }}>
          {emailState.errors.map((err, i) => (
            <li key={i}>✗ {err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 5. ModalState<T>

Modal/Dialog state with optional data payload.

```typescript
import { ModalState } from '../types';

type DeleteModalState = ModalState<{
  sessionId: string;
  sessionName: string;
}>;

const [modal, setModal] = useState<DeleteModalState>({ status: 'closed' });

function openDeleteModal(session: Session) {
  setModal({
    status: 'open',
    data: {
      sessionId: session.id,
      sessionName: session.name
    }
  });
}

function closeModal() {
  setModal({ status: 'closed' });
}

async function confirmDelete() {
  if (modal.status === 'open') {
    // TypeScript knows modal.data exists!
    await deleteSession(modal.data.sessionId);
    closeModal();
  }
}

function render() {
  return (
    <>
      <SessionsList onDelete={openDeleteModal} />

      {modal.status === 'open' && (
        <Dialog onClose={closeModal}>
          <h3>Delete Session</h3>
          <p>Are you sure you want to delete "{modal.data.sessionName}"?</p>
          <button onClick={confirmDelete}>Delete</button>
          <button onClick={closeModal}>Cancel</button>
        </Dialog>
      )}
    </>
  );
}
```

---

## 🎨 Advanced Patterns

### Combining Multiple States

```typescript
type AppState = {
  sessions: LoadingState<Session[]>;
  upload: FileUploadState;
  deleteModal: ModalState<{ sessionId: string }>;
};

const [appState, setAppState] = useState<AppState>({
  sessions: { status: 'idle' },
  upload: { type: 'idle' },
  deleteModal: { status: 'closed' }
});
```

### Using Helper Functions

```typescript
import {
  isSuccess,
  isError,
  createSuccessState,
  mapLoadingState
} from '../types';

// Type guards
if (isSuccess(state)) {
  console.log(state.data); // TypeScript knows this exists
}

if (isError(state)) {
  console.log(state.error); // TypeScript knows this exists
}

// Map data transformations
const userState: LoadingState<User> = { status: 'success', data: user };
const nameState = mapLoadingState(userState, u => u.name);
// nameState: LoadingState<string>
```

### Exhaustive Checking

```typescript
function handleState(state: LoadingState<string>): JSX.Element {
  switch (state.status) {
    case 'idle':
      return <div>Idle</div>;
    case 'loading':
      return <div>Loading</div>;
    case 'success':
      return <div>{state.data}</div>;
    case 'error':
      return <div>{state.error.message}</div>;
    // If you forget a case, TypeScript will error! ✅
  }
}
```

---

## ✅ Best Practices

### DO:
- ✅ Use discriminated unions for complex state machines
- ✅ Handle all cases in switch statements (exhaustive checking)
- ✅ Use type guards to narrow types before accessing properties
- ✅ Create helper functions for common state transitions
- ✅ Document state transitions in comments

### DON'T:
- ❌ Don't use optional flags like `isLoading?: boolean`
- ❌ Don't access properties without checking the discriminator
- ❌ Don't mix multiple state booleans (`isLoading && hasError`)
- ❌ Don't forget to handle all state variants

---

## 🚀 Real-World Example: FileSelector

See `src/components/FileSelector.tsx` for a complete implementation using `FileUploadState`.

Key highlights:
- Type-safe state transitions
- Progress tracking during file reading
- Error handling with messages
- Exhaustive rendering in switch statement
- Automatic TypeScript checking for all states

---

## 📖 Further Reading

- [TypeScript Handbook - Discriminated Unions](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#discriminating-unions)
- [Advanced TypeScript Patterns](https://www.typescriptlang.org/docs/handbook/advanced-types.html)
- [Type Guards and Type Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
