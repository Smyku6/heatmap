/**
 * Branded Types - Type-safe ID handling
 *
 * Prevents mixing different ID types at compile time using TypeScript's
 * nominal typing through unique symbols.
 *
 * @example
 * ```typescript
 * const sessionId = createSessionId('123');
 * const pitchId = createPitchId('orlik');
 *
 * loadSession(sessionId);  // ✅ OK
 * loadSession(pitchId);    // ❌ Compile error!
 * loadSession('123');      // ❌ Compile error!
 * ```
 */

/**
 * Branded type helper
 *
 * Creates a branded type by intersecting the base type with a unique symbol.
 */
type Brand<K, T> = K & { __brand: T };

/**
 * Session ID - Unique identifier for training sessions
 *
 * Cannot be mixed with other ID types at compile time.
 */
export type SessionId = Brand<string, 'SessionId'>;

/**
 * Pitch ID - Unique identifier for football pitches
 *
 * Cannot be mixed with other ID types at compile time.
 */
export type PitchId = Brand<string, 'PitchId'>;

/**
 * User ID - Unique identifier for users (future use)
 *
 * Cannot be mixed with other ID types at compile time.
 */
export type UserId = Brand<string, 'UserId'>;

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Creates a branded SessionId from a string
 *
 * Use this factory function to create session IDs instead of using
 * raw strings directly.
 *
 * @param id - Raw string ID
 * @returns Branded SessionId
 *
 * @example
 * ```typescript
 * const sessionId = createSessionId(Date.now().toString());
 * store.addSession({ id: sessionId, ... });
 * ```
 */
export function createSessionId(id: string): SessionId {
  return id as SessionId;
}

/**
 * Creates a branded PitchId from a string
 *
 * Use this factory function to create pitch IDs instead of using
 * raw strings directly.
 *
 * @param id - Raw string ID (e.g., 'orlik-kopernika')
 * @returns Branded PitchId
 *
 * @example
 * ```typescript
 * const pitchId = createPitchId('lawendowe-wzgorze-orlik');
 * const pitch = getPitch(pitchId);
 * ```
 */
export function createPitchId(id: string): PitchId {
  return id as PitchId;
}

/**
 * Creates a branded UserId from a string
 *
 * Use this factory function to create user IDs instead of using
 * raw strings directly.
 *
 * @param id - Raw string ID
 * @returns Branded UserId
 *
 * @example
 * ```typescript
 * const userId = createUserId('user-123');
 * ```
 */
export function createUserId(id: string): UserId {
  return id as UserId;
}

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Type guard for SessionId
 *
 * Checks if a value is a valid session ID (string).
 * Note: This only validates the runtime type, not the brand.
 *
 * @param value - Value to check
 * @returns True if value is a string
 */
export function isSessionId(value: unknown): value is SessionId {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for PitchId
 *
 * Checks if a value is a valid pitch ID (string).
 * Note: This only validates the runtime type, not the brand.
 *
 * @param value - Value to check
 * @returns True if value is a string
 */
export function isPitchId(value: unknown): value is PitchId {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for UserId
 *
 * Checks if a value is a valid user ID (string).
 * Note: This only validates the runtime type, not the brand.
 *
 * @param value - Value to check
 * @returns True if value is a string
 */
export function isUserId(value: unknown): value is UserId {
  return typeof value === 'string' && value.length > 0;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Converts SessionId back to plain string
 *
 * Use sparingly - only when you need to interact with external APIs
 * that don't understand branded types.
 *
 * @param id - Branded SessionId
 * @returns Plain string
 */
export function sessionIdToString(id: SessionId): string {
  return id;
}

/**
 * Converts PitchId back to plain string
 *
 * Use sparingly - only when you need to interact with external APIs
 * that don't understand branded types.
 *
 * @param id - Branded PitchId
 * @returns Plain string
 */
export function pitchIdToString(id: PitchId): string {
  return id;
}

/**
 * Converts UserId back to plain string
 *
 * Use sparingly - only when you need to interact with external APIs
 * that don't understand branded types.
 *
 * @param id - Branded UserId
 * @returns Plain string
 */
export function userIdToString(id: UserId): string {
  return id;
}
