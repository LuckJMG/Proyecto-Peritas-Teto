export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn(`No se pudo leer ${key} de localStorage:`, error);
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`No se pudo guardar ${key} en localStorage:`, error);
    }
  },

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error eliminando ${key} de localStorage:`, error);
    }
  }
};