/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  readonly VITE_WHATSAPP_NUMBER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// JsBarcode for print receipts
declare global {
  interface Window {
    JsBarcode: (selector: string, value: string, options?: any) => void;
  }
}
