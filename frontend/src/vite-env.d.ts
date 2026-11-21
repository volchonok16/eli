/// <reference types="vite/client" />

interface Window {
  ym?: (counterId: number, method: string, ...args: unknown[]) => void;
  dataLayer?: unknown[];
}

declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
