/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BANGUMI_API_ACCESS_TOKEN: string
  readonly VITE_YMGAL_API_CLIENT_ID: string
  readonly VITE_YMGAL_API_CLIENT_SECRET: string
  readonly VITE_IGDB_API_CLIENT_ID: string
  readonly VITE_IGDB_API_CLIENT_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
