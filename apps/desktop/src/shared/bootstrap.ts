/**
 * Bootstrap Arguments
 *
 * Parsed early bootstrap arguments used by the main process.
 */

export interface BootstrapArgs {
  /** Print help and exit */
  help: boolean

  /** Print version and exit */
  version: boolean

  /** Development plugin path from --dev-plugin CLI argument */
  devPlugin: string | undefined
}
