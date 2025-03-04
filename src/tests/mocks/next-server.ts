import { NextRequest as BaseNextRequest, NextResponse as BaseNextResponse } from 'next/server'
import { RequestCookies, ResponseCookies } from 'next/dist/server/web/spec-extension/cookies'
import { NextURL } from 'next/dist/server/web/next-url'
import { INTERNALS } from 'next/dist/server/web/spec-extension/request'

export class MockNextURL extends NextURL {
  private _url: URL;
  private _basePath: string;
  private _pathname: string;

  constructor(input: string | URL, base?: string | URL) {
    super(input, base);
    this._url = typeof input === 'string' ? new URL(input, base) : input;
    this._basePath = '';
    this._pathname = this._url.pathname;
  }

  get pathname() {
    return this._pathname;
  }

  get basePath() {
    return this._basePath;
  }

  get searchParams() {
    return this._url.searchParams;
  }

  get search() {
    return this._url.search;
  }

  get host() {
    return this._url.host;
  }

  get hostname() {
    return this._url.hostname;
  }

  get port() {
    return this._url.port;
  }

  get protocol() {
    return this._url.protocol;
  }

  get origin() {
    return this._url.origin;
  }

  clone(): MockNextURL {
    return new MockNextURL(this._url);
  }
}

export class NextRequest {
  private _url: URL;
  private _basePath: string;
  private _headers: Headers;
  
  constructor(url: string, options: { headers?: HeadersInit, basePath?: string } = {}) {
    this._url = new URL(url);
    this._basePath = options.basePath || '';
    this._headers = new Headers(options.headers);
  }

  get url() {
    return this._url.toString();
  }

  get nextUrl() {
    return this._url;
  }

  get basePath() {
    return this._basePath;
  }

  get cookies() {
    return {
      getAll: () => [],
      get: () => undefined,
      set: () => {},
      delete: () => {},
    };
  }

  get headers() {
    return this._headers;
  }
}

export class NextResponse {
  public headers: Headers;
  public status: number;
  public statusText: string;
  private _url: URL;
  
  constructor(body: any, options: ResponseInit & { url?: string } = {}) {
    this.headers = new Headers(options.headers);
    this.status = options.status || 200;
    this.statusText = options.statusText || '';
    this._url = options.url ? new URL(options.url) : new URL('http://localhost');
  }

  static redirect(url: string | URL, init?: { status?: number }) {
    const response = new NextResponse(null, {
      status: init?.status || 307,
      url: url.toString(),
    });
    response.headers.set('Location', url.toString());
    return response;
  }

  static json(body: any, init?: ResponseInit) {
    const response = new NextResponse(JSON.stringify(body), init);
    response.headers.set('Content-Type', 'application/json');
    return response;
  }

  static next(options?: { headers?: HeadersInit; rewrite?: string; }) {
    const response = new NextResponse(null);
    if (options?.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        response.headers.set(key, value as string);
      }
    }
    return response;
  }
}