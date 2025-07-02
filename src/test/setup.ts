
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock para evitar errores con recharts en tests
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock para localStorage
const localStorageMock: Storage = {
  length: 0,
  key: () => null,
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
