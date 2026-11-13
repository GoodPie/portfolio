// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  // Google tag queue, set up by the snippet in BaseLayout.astro
  interface Window {
    dataLayer: unknown[];
  }
}

export {};
