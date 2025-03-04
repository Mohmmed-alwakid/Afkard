import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-anon-key';

// Mock React cache
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: Function) => fn,
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Mock Next.js components
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}));

jest.mock('next/draft-mode', () => ({
  draftMode: () => ({
    isEnabled: false,
  }),
}));

// Mock BroadcastChannel
class MockBroadcastChannel implements BroadcastChannel {
  name: string;
  onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null = null;
  onmessageerror: ((this: BroadcastChannel, ev: MessageEvent) => any) | null = null;

  constructor(name: string) {
    this.name = name;
  }

  addEventListener(type: string, listener: EventListener): void {}
  removeEventListener(type: string, listener: EventListener): void {}
  dispatchEvent(event: Event): boolean {
    return true;
  }
  postMessage(message: any): void {}
  close(): void {}
}

// Mock storage
class MockStorage implements Storage {
  private store: Record<string, string> = {};
  private _length: number = 0;

  get length(): number {
    return this._length;
  }

  clear(): void {
    this.store = {};
    this._length = 0;
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
    this._length = Object.keys(this.store).length;
  }

  removeItem(key: string): void {
    delete this.store[key];
    this._length = Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

// Mock crypto
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => arr,
    subtle: {
      digest: jest.fn(),
    },
    randomUUID: () => '00000000-0000-0000-0000-000000000000',
  },
});

// Mock TextDecoder
class MockTextDecoder implements TextDecoder {
  encoding: string;
  fatal: boolean;
  ignoreBOM: boolean;

  constructor(label?: string, options?: TextDecoderOptions) {
    this.encoding = label || 'utf-8';
    this.fatal = options?.fatal || false;
    this.ignoreBOM = options?.ignoreBOM || false;
  }

  decode(input?: ArrayBuffer | ArrayBufferView | null, options?: { stream?: boolean }): string {
    return '';
  }
}

// Apply mocks to global object
const mockLocalStorage = new MockStorage();
const mockSessionStorage = new MockStorage();

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });
Object.defineProperty(global, 'sessionStorage', { value: mockSessionStorage });
Object.defineProperty(global, 'BroadcastChannel', { value: MockBroadcastChannel });
Object.defineProperty(global, 'TextDecoder', { value: MockTextDecoder });

// Mock Headers
class MockHeaders implements Headers {
  private store: Map<string, string> = new Map();
  [Symbol.iterator]() {
    return this.entries();
  }

  constructor(init?: HeadersInit) {
    if (init) {
      if (init instanceof Headers) {
        init.forEach((value, key) => this.store.set(key.toLowerCase(), value));
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.store.set(key.toLowerCase(), value));
      } else {
        Object.entries(init).forEach(([key, value]) => this.store.set(key.toLowerCase(), value));
      }
    }
  }

  append(name: string, value: string): void {
    const key = name.toLowerCase();
    const existing = this.store.get(key);
    this.store.set(key, existing ? `${existing}, ${value}` : value);
  }

  delete(name: string): void {
    this.store.delete(name.toLowerCase());
  }

  get(name: string): string | null {
    return this.store.get(name.toLowerCase()) || null;
  }

  has(name: string): boolean {
    return this.store.has(name.toLowerCase());
  }

  set(name: string, value: string): void {
    this.store.set(name.toLowerCase(), value);
  }

  forEach(callback: (value: string, key: string, parent: Headers) => void): void {
    this.store.forEach((value, key) => callback(value, key, this));
  }

  *entries(): IterableIterator<[string, string]> {
    for (const [key, value] of this.store.entries()) {
      yield [key, value];
    }
  }

  *keys(): IterableIterator<string> {
    for (const key of this.store.keys()) {
      yield key;
    }
  }

  *values(): IterableIterator<string> {
    for (const value of this.store.values()) {
      yield value;
    }
  }

  getSetCookie(): string[] {
    const cookies = [];
    for (const [key, value] of this.entries()) {
      if (key.toLowerCase() === 'set-cookie') {
        cookies.push(value);
      }
    }
    return cookies;
  }
}

// Mock Request
class MockRequest {
  private _url: string;
  private _method: string;
  private _headers: Headers;
  private _body: BodyInit | null;

  constructor(input: string | URL, init?: RequestInit) {
    this._url = input.toString();
    this._method = init?.method || 'GET';
    this._headers = new MockHeaders(init?.headers);
    this._body = init?.body || null;
  }

  get url(): string {
    return this._url;
  }

  get method(): string {
    return this._method;
  }

  get headers(): Headers {
    return this._headers;
  }

  get body(): BodyInit | null {
    return this._body;
  }

  clone(): MockRequest {
    return new MockRequest(this._url, {
      method: this._method,
      headers: new Headers(this._headers),
      body: this._body,
    });
  }
}

// Setup global mocks
global.TextEncoder = TextEncoder;
global.Headers = MockHeaders as unknown as typeof Headers;
global.Request = MockRequest as unknown as typeof Request;

// Mock Next.js Request/Response
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url) => new MockRequest(url)),
  NextResponse: {
    redirect: jest.fn().mockImplementation((url) => new MockNextResponse()),
    next: jest.fn().mockImplementation(() => new MockNextResponse()),
    json: jest.fn().mockImplementation((data) => new MockNextResponse(JSON.stringify(data))),
  },
}));

// Mock NextResponse
class MockNextResponse {
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.ok = true;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.headers = new MockHeaders();
  }
  ok: boolean;
  status: number;
  statusText: string;
  headers: MockHeaders;
  json = jest.fn();
  text = jest.fn();
  blob = jest.fn();
  arrayBuffer = jest.fn();
  formData = jest.fn();
  clone = jest.fn();
}

// Clear storage and cookies before each test
beforeEach(() => {
  mockLocalStorage.clear();
  mockSessionStorage.clear();
  document.cookie = '';
}); 