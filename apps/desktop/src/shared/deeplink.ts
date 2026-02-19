/**
 * Deeplink Type Definitions
 *
 * Shared types for the kisaki:// deeplink protocol.
 * Used by both main and renderer processes.
 */

// =============================================================================
// Core Types
// =============================================================================

/** Deeplink action types */
export type DeeplinkAction = 'launch' | 'auth' | 'navigate' | 'scan'

/** Parsed deeplink structure */
export interface ParsedDeeplink {
  /** The action to perform */
  action: DeeplinkAction
  /** The resource path (everything after the action) */
  resource: string
  /** Query parameters */
  params: Record<string, string>
  /** Original raw URL */
  raw: string
}

/** Deeplink handling result */
export interface DeeplinkResult {
  /** Whether the action succeeded */
  success: boolean
  /** The action that was attempted */
  action: DeeplinkAction
  /** Human-readable message */
  message?: string
  /** Additional result data */
  data?: unknown
}

// =============================================================================
// Action-specific Parameter Types
// =============================================================================

/** Parameters for launch/game action */
export interface LaunchGameParams {
  gameId: string
}

/** Parameters for auth/callback action */
export interface AuthCallbackParams {
  /** OAuth provider name */
  provider: string
  /** Authorization code */
  code?: string
  /** State parameter for CSRF protection */
  state?: string
  /** Error code if auth failed */
  error?: string
  /** Error description */
  errorDescription?: string
}

/** Parameters for navigate action */
export interface NavigateParams {
  /** Route path to navigate to */
  route: string
  /** Additional query parameters */
  query?: Record<string, string>
}

/** Parameters for scan actions */
export interface ScanActionParams {
  /** Scan action type */
  action: 'start' | 'stop' | 'all'
  /** Scanner ID (optional, for specific scanner) */
  scannerId?: string
}

// =============================================================================
// IPC Event Payloads
// =============================================================================

/** Navigate event payload */
export interface DeeplinkNavigatePayload {
  route: string
  params: Record<string, string>
}

/** Auth callback event payload */
export interface DeeplinkAuthCallbackPayload {
  provider: string
  code: string
  state?: string
}

/** Auth error event payload */
export interface DeeplinkAuthErrorPayload {
  provider: string
  error: string
  errorDescription?: string
}
