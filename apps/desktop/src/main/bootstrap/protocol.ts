/**
 * Protocol Registration
 *
 * Registers custom schemes for the application:
 * - attachment:// - Serves database attachments (images, backups)
 * - kisaki-plugin:// - Serves plugin resources
 * - kisaki:// - Deeplink protocol for external triggers
 *
 * The schemes must be registered before app.whenReady().
 * Protocol handlers are set up in their respective services.
 */

import { protocol } from 'electron'

const ATTACHMENT_SCHEME = 'attachment'
const PLUGIN_SCHEME = 'kisaki-plugin'
const DEEPLINK_SCHEME = 'kisaki'

/**
 * Register schemes as privileged.
 * Must be called before app.whenReady().
 *
 * Note: kisaki:// deeplink scheme is registered via app.setAsDefaultProtocolClient()
 * in the main entry point, not here.
 */
export function registerAttachmentScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: ATTACHMENT_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        bypassCSP: true,
        stream: true
      }
    },
    {
      scheme: PLUGIN_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        bypassCSP: true,
        corsEnabled: true
      }
    }
  ])
}

export { PLUGIN_SCHEME, DEEPLINK_SCHEME }
