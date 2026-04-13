/**
 * Discriminated Union Types for Type-Safe State Management
 *
 * Provides type-safe state machines using discriminated unions.
 * Each state variant has a unique 'type' or 'status' discriminator
 * that TypeScript uses for exhaustive checking and type narrowing.
 *
 * @example
 * ```typescript
 * // Type-safe state handling with exhaustive checking
 * function renderState(state: LoadingState<User>) {
 *   switch (state.status) {
 *     case 'idle': return <div>Ready</div>;
 *     case 'loading': return <Spinner />;
 *     case 'success': return <UserProfile user={state.data} />;
 *     case 'error': return <ErrorMessage error={state.error} />;
 *   }
 * }
 * ```
 */

// ============================================
// LOADING STATES
// ============================================

/**
 * Generic loading state for async operations
 *
 * Represents the lifecycle of an async operation with four states:
 * - idle: Initial state, no operation started
 * - loading: Operation in progress
 * - success: Operation completed successfully with data
 * - error: Operation failed with error
 *
 * @template T - The type of successful data
 * @template E - The type of error (defaults to Error)
 *
 * @example
 * ```typescript
 * type SessionLoadingState = LoadingState<Session>;
 *
 * const [state, setState] = useState<SessionLoadingState>({ status: 'idle' });
 *
 * async function loadSession(id: string) {
 *   setState({ status: 'loading' });
 *   try {
 *     const data = await fetchSession(id);
 *     setState({ status: 'success', data });
 *   } catch (error) {
 *     setState({ status: 'error', error: error as Error });
 *   }
 * }
 * ```
 */
export type LoadingState<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

/**
 * Type guard to check if loading state is idle
 */
export function isIdle<T, E>(state: LoadingState<T, E>): state is { status: 'idle' } {
  return state.status === 'idle';
}

/**
 * Type guard to check if loading state is loading
 */
export function isLoading<T, E>(state: LoadingState<T, E>): state is { status: 'loading' } {
  return state.status === 'loading';
}

/**
 * Type guard to check if loading state is success
 */
export function isSuccess<T, E>(
  state: LoadingState<T, E>
): state is { status: 'success'; data: T } {
  return state.status === 'success';
}

/**
 * Type guard to check if loading state is error
 */
export function isError<T, E>(state: LoadingState<T, E>): state is { status: 'error'; error: E } {
  return state.status === 'error';
}

// ============================================
// FILE UPLOAD STATES
// ============================================

/**
 * File upload state machine
 *
 * Tracks the complete lifecycle of a file upload operation:
 * - idle: No file selected
 * - selecting: File picker is open
 * - parsing: File is being read and parsed
 * - success: File successfully parsed, session created
 * - error: Upload or parsing failed
 *
 * @example
 * ```typescript
 * const [uploadState, setUploadState] = useState<FileUploadState>({ type: 'idle' });
 *
 * function handleFileSelect(file: File) {
 *   setUploadState({ type: 'selecting' });
 *   const reader = new FileReader();
 *
 *   reader.onprogress = (e) => {
 *     const progress = (e.loaded / e.total) * 100;
 *     setUploadState({ type: 'parsing', progress });
 *   };
 *
 *   reader.onload = () => {
 *     const sessionId = createSession(reader.result);
 *     setUploadState({ type: 'success', sessionId });
 *   };
 *
 *   reader.onerror = () => {
 *     setUploadState({ type: 'error', message: 'Failed to read file' });
 *   };
 * }
 * ```
 */
export type FileUploadState =
  | { type: 'idle' }
  | { type: 'selecting' }
  | { type: 'parsing'; progress: number }
  | { type: 'success'; sessionId: string }
  | { type: 'error'; message: string };

/**
 * Type guard to check if upload state is idle
 */
export function isUploadIdle(state: FileUploadState): state is { type: 'idle' } {
  return state.type === 'idle';
}

/**
 * Type guard to check if upload state is parsing
 */
export function isUploadParsing(
  state: FileUploadState
): state is { type: 'parsing'; progress: number } {
  return state.type === 'parsing';
}

/**
 * Type guard to check if upload state is success
 */
export function isUploadSuccess(
  state: FileUploadState
): state is { type: 'success'; sessionId: string } {
  return state.type === 'success';
}

/**
 * Type guard to check if upload state is error
 */
export function isUploadError(state: FileUploadState): state is { type: 'error'; message: string } {
  return state.type === 'error';
}

// ============================================
// DATA FETCHING STATES
// ============================================

/**
 * Data fetching state with optional refresh capability
 *
 * Extends LoadingState with a 'refreshing' state for when data
 * is being reloaded while existing data is still displayed.
 *
 * @template T - The type of fetched data
 *
 * @example
 * ```typescript
 * const [state, setState] = useState<FetchState<Session[]>>({ status: 'idle' });
 *
 * async function fetchSessions() {
 *   setState({ status: 'loading' });
 *   const sessions = await api.getSessions();
 *   setState({ status: 'success', data: sessions });
 * }
 *
 * async function refreshSessions() {
 *   if (state.status === 'success') {
 *     setState({ status: 'refreshing', data: state.data });
 *     const sessions = await api.getSessions();
 *     setState({ status: 'success', data: sessions });
 *   }
 * }
 * ```
 */
export type FetchState<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'refreshing'; data: T }
  | { status: 'error'; error: E };

// ============================================
// FORM VALIDATION STATES
// ============================================

/**
 * Form field validation state
 *
 * Represents validation status for a single form field:
 * - pristine: Field hasn't been touched
 * - validating: Async validation in progress
 * - valid: Field passes validation
 * - invalid: Field fails validation with error messages
 *
 * @example
 * ```typescript
 * const [emailState, setEmailState] = useState<ValidationState>({ status: 'pristine' });
 *
 * async function validateEmail(email: string) {
 *   setEmailState({ status: 'validating' });
 *
 *   const errors = [];
 *   if (!email.includes('@')) errors.push('Invalid email format');
 *
 *   const exists = await checkEmailExists(email);
 *   if (exists) errors.push('Email already taken');
 *
 *   if (errors.length > 0) {
 *     setEmailState({ status: 'invalid', errors });
 *   } else {
 *     setEmailState({ status: 'valid' });
 *   }
 * }
 * ```
 */
export type ValidationState =
  | { status: 'pristine' }
  | { status: 'validating' }
  | { status: 'valid' }
  | { status: 'invalid'; errors: string[] };

// ============================================
// MODAL/DIALOG STATES
// ============================================

/**
 * Modal/Dialog state with optional data payload
 *
 * Tracks modal open/closed state and associated data:
 * - closed: Modal is not visible
 * - open: Modal is visible with optional data payload
 *
 * @template T - The type of data passed to the modal
 *
 * @example
 * ```typescript
 * type DeleteModalState = ModalState<{ sessionId: string; sessionName: string }>;
 *
 * const [modal, setModal] = useState<DeleteModalState>({ status: 'closed' });
 *
 * function openDeleteModal(session: Session) {
 *   setModal({
 *     status: 'open',
 *     data: { sessionId: session.id, sessionName: session.name }
 *   });
 * }
 *
 * function closeModal() {
 *   setModal({ status: 'closed' });
 * }
 * ```
 */
export type ModalState<T = void> = { status: 'closed' } | { status: 'open'; data: T };

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Creates an idle loading state
 */
export function createIdleState<T, E = Error>(): LoadingState<T, E> {
  return { status: 'idle' };
}

/**
 * Creates a loading state
 */
export function createLoadingState<T, E = Error>(): LoadingState<T, E> {
  return { status: 'loading' };
}

/**
 * Creates a success loading state
 */
export function createSuccessState<T, E = Error>(data: T): LoadingState<T, E> {
  return { status: 'success', data };
}

/**
 * Creates an error loading state
 */
export function createErrorState<T, E = Error>(error: E): LoadingState<T, E> {
  return { status: 'error', error };
}

/**
 * Maps a loading state's data using a transformation function
 *
 * @example
 * ```typescript
 * const userState: LoadingState<User> = { status: 'success', data: user };
 * const nameState = mapLoadingState(userState, u => u.name);
 * // nameState: LoadingState<string>
 * ```
 */
export function mapLoadingState<T, U, E = Error>(
  state: LoadingState<T, E>,
  mapper: (data: T) => U
): LoadingState<U, E> {
  if (state.status === 'success') {
    return { status: 'success', data: mapper(state.data) };
  }
  return state as LoadingState<U, E>;
}
