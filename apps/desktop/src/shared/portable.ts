/**
 * Portable mode types
 */

/** Portable status information */
export interface PortableStatus {
  isPortable: boolean
  portablePath: string
  defaultUserDataPath: string
  currentUserDataPath: string
}

/** Pending switch target */
export type PortableSwitchTarget = 'portable' | 'normal'
