// Ambient declaration for @supabase/supabase-js so TypeScript compiles cleanly
// whether @supabase/supabase-js is installed or pending installation.

declare module "@supabase/supabase-js" {
  export interface PostgrestError {
    message: string;
    details: string;
    hint: string;
    code: string;
  }

  export interface PostgrestResponse<T> {
    data: T | null;
    error: PostgrestError | null;
    count?: number | null;
    status: number;
    statusText: string;
  }

  export interface PostgrestSingleResponse<T> {
    data: T | null;
    error: PostgrestError | null;
    count?: number | null;
    status: number;
    statusText: string;
  }

  export interface PostgrestFilterBuilder<T> extends PromiseLike<PostgrestResponse<T>> {
    select(columns?: string): PostgrestFilterBuilder<T>;
    order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): PostgrestFilterBuilder<T>;
    eq(column: string, value: unknown): PostgrestFilterBuilder<T>;
    neq(column: string, value: unknown): PostgrestFilterBuilder<T>;
    gt(column: string, value: unknown): PostgrestFilterBuilder<T>;
    gte(column: string, value: unknown): PostgrestFilterBuilder<T>;
    lt(column: string, value: unknown): PostgrestFilterBuilder<T>;
    lte(column: string, value: unknown): PostgrestFilterBuilder<T>;
    in(column: string, values: unknown[]): PostgrestFilterBuilder<T>;
    single(): PromiseLike<PostgrestSingleResponse<T extends (infer U)[] ? U : T>>;
    maybeSingle(): PromiseLike<PostgrestSingleResponse<(T extends (infer U)[] ? U : T) | null>>;
  }

  export interface PostgrestQueryBuilder<T> {
    select(columns?: string): PostgrestFilterBuilder<T[]>;
    insert(values: Partial<T> | Partial<T>[]): PostgrestFilterBuilder<T[]>;
    upsert(values: Partial<T> | Partial<T>[], options?: { onConflict?: string; ignoreDuplicates?: boolean }): PostgrestFilterBuilder<T[]>;
    update(values: Partial<T>): PostgrestFilterBuilder<T[]>;
    delete(): PostgrestFilterBuilder<T[]>;
  }

  export interface SupabaseClient {
    from<T = Record<string, unknown>>(table: string): PostgrestQueryBuilder<T>;
    auth: unknown;
    storage: unknown;
  }

  export interface SupabaseClientOptions<SchemaName> {
    auth?: Record<string, unknown>;
    global?: Record<string, unknown>;
    db?: { schema?: SchemaName };
  }

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: SupabaseClientOptions<string>,
  ): SupabaseClient;
}
