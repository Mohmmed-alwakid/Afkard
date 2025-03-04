// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

// Mock Request and Response for Next.js
if (!global.Request) {
  global.Request = class Request {
    constructor(input: string | URL, init?: RequestInit) {
      return new URL(input.toString());
    }
  } as any;
}

if (!global.Response) {
  global.Response = class Response {
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
        ...init,
      };
    }
  } as any;
}

// Mock Headers for Next.js
if (!global.Headers) {
  global.Headers = class Headers {
    constructor(init?: HeadersInit) {}
    append(name: string, value: string): void {}
    delete(name: string): void {}
    get(name: string): string | null { return null; }
    has(name: string): boolean { return false; }
    set(name: string, value: string): void {}
    forEach(callback: (value: string, name: string) => void): void {}
  } as any;
}

// Mock URL for Next.js
if (!global.URL) {
  global.URL = class URL {
    constructor(url: string, base?: string | URL) {
      this.href = url;
      this.pathname = '/';
      this.search = '';
      this.hash = '';
      this.host = 'localhost:3000';
      this.hostname = 'localhost';
      this.port = '3000';
      this.protocol = 'http:';
      this.origin = 'http://localhost:3000';
    }
    href: string;
    pathname: string;
    search: string;
    hash: string;
    host: string;
    hostname: string;
    port: string;
    protocol: string;
    origin: string;
    toString() { return this.href; }
  } as any;
}

// Mock FormData for Next.js
if (!global.FormData) {
  global.FormData = class FormData {
    append(name: string, value: string | Blob, fileName?: string): void {}
    delete(name: string): void {}
    get(name: string): FormDataEntryValue | null { return null; }
    getAll(name: string): FormDataEntryValue[] { return []; }
    has(name: string): boolean { return false; }
    set(name: string, value: string | Blob, fileName?: string): void {}
    forEach(callback: (value: FormDataEntryValue, key: string) => void): void {}
  } as any;
} 