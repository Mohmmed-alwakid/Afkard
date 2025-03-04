export function cookies() {
  return {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };
}

export function headers() {
  return new Headers();
}

export const draftMode = jest.fn(() => ({
  enable: jest.fn(),
  disable: jest.fn(),
  isEnabled: false,
})); 