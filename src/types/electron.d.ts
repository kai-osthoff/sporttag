declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      getVersion: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
    };
  }
}

export {};
