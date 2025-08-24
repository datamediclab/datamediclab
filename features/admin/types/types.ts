// features/brand/types/types.ts
// 👉 Standardized, no `any`, with ApiResp union types

/** ISO 8601 date string (UTC or with offset). */
export type ISODateString = string;

/** Minimal brand reference for dropdowns / foreign keys. */
export interface BrandRef {
  id: number;
  name: string;
}

/** Canonical Brand entity as returned by the API. */
export interface Brand {
  id: number;
  name: string;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
}

/** Payloads for create/update operations (strict, no optional name). */
export interface BrandCreatePayload {
  name: string;
}

export interface BrandUpdatePayload {
  id: number;
  name: string;
}

/** Sorting options supported by list endpoint. */
export const BRAND_SORT_FIELDS = [
  'name',
  'createdAt',
  'updatedAt',
] as const;
export type BrandSortField = typeof BRAND_SORT_FIELDS[number];

export const SORT_DIRECTIONS = ['asc', 'desc'] as const;
export type SortDirection = typeof SORT_DIRECTIONS[number];

/** Query params used for listing brands with pagination and search. */
export interface BrandListQuery {
  q?: string; // free-text search by name
  page?: number; // 1-based
  pageSize?: number; // e.g., 10/20/50
  sortBy?: BrandSortField;
  sortDir?: SortDirection;
}

/** Generic pagination envelope. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** API response union pattern (no any). */
export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: string };
export type ApiResp<T> = ApiOk<T> | ApiErr;

/** Convenience aliases for common brand responses. */
export type BrandListOk = ApiOk<Paginated<Brand>>;
export type BrandListResp = ApiResp<Paginated<Brand>>;
export type BrandDetailOk = ApiOk<Brand>;
export type BrandDetailResp = ApiResp<Brand>;

/** Type guards */
export const isApiOk = <T>(r: ApiResp<T>): r is ApiOk<T> => r.ok === true;
export const isApiErr = <T>(r: ApiResp<T>): r is ApiErr => r.ok === false;
