// @ts-nocheck
import type { Category } from '@/lib/types'

export const typescriptCategory: Category = {
  id: 'typescript-advanced',
  title: 'Advanced TypeScript',
  description:
    'Generics, utility types, conditional types, mapped types, template literals, and discriminated unions. The type system is a programming language — learn to program in it.',
  icon: 'Code',
  concepts: [
    {
      id: 'generics',
      title: 'Generics',
      description:
        'Generics let you write functions, classes, and types that work with any type while preserving type safety. They are TypeScript\'s most powerful abstraction tool — the difference between a rigid function and a reusable one.',
      keyPoints: [
        'Generic type parameter <T> is a placeholder resolved by the caller — the function adapts to whatever type is passed',
        'Constraints (extends) limit what T can be: <T extends { id: string }> ensures T has an id property',
        'Default type parameters provide a fallback: <T = string> — caller can omit the type argument',
        'Generic functions vs generic types: function identity<T>(x: T): T vs type Box<T> = { value: T }',
        'Variance: TypeScript infers variance (covariance/contravariance) for generic types — affects assignability',
        'Multiple type parameters: <K extends string, V> for key-value relationships',
        'Type inference: TypeScript usually infers generic arguments — you rarely need to specify them explicitly',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Generics with constraints and defaults',
          code: `// Basic: type-safe identity
function identity<T>(value: T): T {
  return value
}
const num = identity(42) // T inferred as number
const str = identity('hello') // T inferred as string

// Constraint: T must have an id
function getById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id)
}

// Multiple type params: type-safe object property access
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const user = { name: 'Alice', age: 30 }
const name = getProperty(user, 'name') // type: string
const age = getProperty(user, 'age') // type: number
// getProperty(user, 'email') // Error: 'email' is not a key of user

// Default type parameter
interface ApiResponse<T = unknown> {
  data: T
  status: number
}
const response: ApiResponse = { data: 'anything', status: 200 } // T defaults to unknown
const typed: ApiResponse<User> = { data: user, status: 200 } // T is User

// Generic class
class TypedMap<K extends string, V> {
  private store = new Map<K, V>()
  set(key: K, value: V) { this.store.set(key, value) }
  get(key: K): V | undefined { return this.store.get(key) }
}`,
        },
      ],
      useCases: [
        'Utility functions that work with any type (identity, merge, pick, omit)',
        'API clients with typed responses: fetch<T>(url): Promise<T>',
        'Collection classes (Map, Set, Array wrappers) that preserve element types',
        'React hooks that infer return types from input: useState<T>',
      ],
      commonPitfalls: [
        'Using any instead of generics — loses type safety entirely',
        'Over-constraining generics — <T extends string> when T could be any type',
        'Not using inference — manually specifying type arguments that TypeScript can infer',
        'Generic type parameter sprawl — too many type parameters make the signature unreadable',
      ],
      interviewTips: [
        'Explain generics as "type-level parameters" — they parameterize types the way functions parameterize values',
        'Walk through keyof + generic: <T, K extends keyof T> is the foundation of type-safe property access',
        'Mention that React hooks are generic: useState<T>, useRef<T>, useContext<T>',
        'Discuss when NOT to use generics: if the function only works with one type, just use that type',
      ],
      relatedConcepts: [
        'utility-types',
        'conditional-types',
        'mapped-types',
        'type-guards',
      ],
      difficulty: 'intermediate',
      tags: ['typescript', 'generics', 'type-safety', 'abstraction'],
    },
    {
      id: 'utility-types',
      title: 'Utility Types',
      description:
        'TypeScript\'s built-in utility types transform existing types without redefining them. They are the standard library of the type system — memorize the common ones and know when to reach for each.',
      keyPoints: [
        'Partial<T> — all properties optional. Use for update functions where you only change some fields',
        'Required<T> — all properties required. Reverse of Partial',
        'Readonly<T> — all properties readonly. Use for immutable data structures',
        'Pick<T, K> — select a subset of properties. Use for API response shaping',
        'Omit<T, K> — remove properties. Use for creating types without sensitive fields',
        'Record<K, V> — object with keys K and values V. Use for dictionaries and lookup maps',
        'Exclude<T, U> — remove union members. Exclude<"a" | "b" | "c", "a"> = "b" | "c"',
        'Extract<T, U> — keep matching union members. Extract<string | number | boolean, number> = number',
        'NonNullable<T> — remove null and undefined from T',
        'ReturnType<T> — extract return type of a function type',
        'Parameters<T> — extract parameter types as a tuple',
        'InstanceType<T> — extract the instance type of a constructor/class',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Utility types in practice',
          code: `interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: Date
}

// Partial: update function accepts any subset of fields
function updateUser(id: string, updates: Partial<User>): User {
  return { ...getUser(id), ...updates }
}
updateUser('1', { name: 'New Name' }) // only name required

// Pick: API response excludes sensitive fields
type PublicUser = Pick<User, 'id' | 'name' | 'email'>

// Omit: same result, different approach
type SafeUser = Omit<User, 'password'>

// Record: typed dictionary
type UserRoles = Record<string, 'admin' | 'user' | 'guest'>
const roles: UserRoles = { alice: 'admin', bob: 'user' }

// ReturnType: extract return type from a function
async function fetchUsers(): Promise<User[]> { return [] }
type FetchResult = Awaited<ReturnType<typeof fetchUsers>> // User[]

// Readonly: immutable config
type Config = Readonly<{
  apiUrl: string
  timeout: number
}>
const config: Config = { apiUrl: 'https://api.example.com', timeout: 5000 }
// config.apiUrl = 'new' // Error: Cannot assign to 'apiUrl' because it is read-only

// Exclude/Extract: filter union types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type ReadonlyMethod = Extract<HttpMethod, 'GET'> // 'GET'
type MutatingMethod = Exclude<HttpMethod, 'GET'> // 'POST' | 'PUT' | 'DELETE' | 'PATCH'`,
        },
      ],
      useCases: [
        'Partial for update/patch operations where only some fields change',
        'Pick/Omit for API response types that expose a subset of the full model',
        'Record for typed dictionaries and lookup tables',
        'ReturnType/Parameters for inferring types from existing functions',
      ],
      commonPitfalls: [
        'Using Partial when Required would be better — Partial makes everything optional, which can hide bugs',
        'Deep Partial does not exist natively — Partial only affects top-level properties, not nested objects',
        'Confusing Pick and Omit — Pick selects what you want, Omit removes what you do not want',
        'Using Record<string, any> — use Record<string, unknown> for type-safe dictionaries',
      ],
      interviewTips: [
        'Know the six most common: Partial, Required, Readonly, Pick, Omit, Record — be able to use each from memory',
        'Explain Exclude vs Extract: Exclude removes matching members, Extract keeps them',
        'Mention ReturnType<typeof fn> as the way to extract types from existing code without duplication',
        'Discuss Awaited<T>: unwraps Promise<T> to T, works with nested promises',
      ],
      relatedConcepts: [
        'generics',
        'mapped-types',
        'conditional-types',
        'discriminated-unions',
      ],
      difficulty: 'intermediate',
      tags: ['typescript', 'utility-types', 'type-manipulation'],
    },
    {
      id: 'conditional-types',
      title: 'Conditional Types',
      description:
        'Conditional types are TypeScript\'s if/else at the type level: T extends U ? X : Y. Combined with the infer keyword, they can extract, transform, and filter types in ways that feel like pattern matching.',
      keyPoints: [
        'Syntax: T extends U ? TrueType : FalseType — if T is assignable to U, resolve to TrueType, else FalseType',
        'Distributive behavior: when T is a union, the conditional distributes over each member independently',
        'infer keyword: extracts a type from within a pattern — like regex capture groups but for types',
        'NonNullable<T> is a conditional type: T extends null | undefined ? never : T',
        'Recursive conditional types (TypeScript 4.5+) can process strings, tuples, and nested structures',
        'Conditional types are the foundation of Exclude, Extract, NonNullable, ReturnType, and Parameters',
        'Use sparingly — deeply nested conditional types are hard to read and debug',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Conditional types and infer',
          code: `// Basic conditional type
type IsString<T> = T extends string ? true : false
type A = IsString<string> // true
type B = IsString<number> // false

// Distributive: applies to each union member independently
type ToArray<T> = T extends unknown ? T[] : never
type C = ToArray<string | number> // string[] | number[] (not (string | number)[])

// infer: extract types from patterns
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
type D = UnwrapPromise<Promise<string>> // string
type E = UnwrapPromise<number> // number (not a promise, returns as-is)

// Extract function return type (how ReturnType works)
type MyReturnType<T> = T extends (...args: unknown[]) => infer R ? R : never
type F = MyReturnType<() => string> // string

// Extract array element type
type ElementOf<T> = T extends readonly (infer E)[] ? E : never
type G = ElementOf<string[]> // string
type H = ElementOf<[number, string]> // number | string

// Practical: type-safe event handler map
type EventMap = {
  click: { x: number; y: number }
  keydown: { key: string; code: string }
  scroll: { scrollY: number }
}

type EventHandler<K extends keyof EventMap> = (event: EventMap[K]) => void

function on<K extends keyof EventMap>(event: K, handler: EventHandler<K>) {
  // handler parameter type is inferred from the event name
}

on('click', (e) => console.log(e.x, e.y)) // e: { x: number; y: number }
on('keydown', (e) => console.log(e.key)) // e: { key: string; code: string }`,
        },
      ],
      useCases: [
        'Extracting inner types: Promise<T> → T, Array<T> → T, Response<T> → T',
        'Filtering union types: remove null, undefined, or specific members',
        'Type-safe event systems: infer handler type from event name',
        'API type transformations: convert request types to response types',
      ],
      commonPitfalls: [
        'Forgetting distributive behavior — wrap T in [T] to prevent distribution: [T] extends [U] ? X : Y',
        'Deeply nested conditionals — hard to read; extract into named types',
        'infer only works inside conditional types — cannot use it standalone',
        'Circular conditional types — TypeScript detects them but the error messages are cryptic',
      ],
      interviewTips: [
        'Walk through ReturnType implementation: T extends (...args: any[]) => infer R ? R : never',
        'Explain distributive behavior: conditional types automatically distribute over unions',
        'Describe infer as pattern matching: "extract the U from Promise<U>"',
        'Compare with runtime: conditional types are the type-level equivalent of ternary operators',
      ],
      relatedConcepts: [
        'generics',
        'mapped-types',
        'template-literal-types',
        'utility-types',
      ],
      difficulty: 'advanced',
      tags: ['typescript', 'conditional-types', 'infer', 'type-manipulation'],
    },
    {
      id: 'mapped-types',
      title: 'Mapped Types',
      description:
        'Mapped types iterate over keys to create new types — like Array.map but for type properties. Combined with keyof, as remapping, and template literal types, they can transform entire type shapes programmatically.',
      keyPoints: [
        'Syntax: { [K in keyof T]: NewType } — iterate over each key K in T and produce a new property type',
        'Modifiers: +readonly, -readonly, +?, -? — add or remove readonly and optional modifiers',
        'Partial<T> is { [K in keyof T]?: T[K] } — adds ? to every property',
        'Required<T> is { [K in keyof T]-?: T[K] } — removes ? from every property',
        'Key remapping (as): { [K in keyof T as NewKey]: T[K] } — rename or filter keys',
        'Template literal keys: { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] } — generate getter names',
        'Filter keys by value type: { [K in keyof T as T[K] extends Function ? never : K]: T[K] } — exclude methods',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Mapped types in action',
          code: `interface User {
  id: string
  name: string
  email: string
  age: number
}

// Make all properties nullable
type Nullable<T> = { [K in keyof T]: T[K] | null }
type NullableUser = Nullable<User>
// { id: string | null; name: string | null; ... }

// Generate getters from properties
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K]
}
type UserGetters = Getters<User>
// { getId: () => string; getName: () => string; getEmail: () => string; getAge: () => number }

// Filter: keep only string properties
type StringKeysOf<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
}
type UserStrings = StringKeysOf<User>
// { id: string; name: string; email: string } — age excluded

// Deep Readonly (recursive mapped type)
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

// Practical: form validation errors mirror form shape
type FormErrors<T> = { [K in keyof T]?: string }
type UserFormErrors = FormErrors<User>
// { id?: string; name?: string; email?: string; age?: string }`,
        },
      ],
      useCases: [
        'Form validation types: FormErrors<T> mirrors the form shape with error strings',
        'API transformations: map request types to response types',
        'Generating getter/setter types from data models',
        'Creating readonly or optional versions of existing types',
      ],
      commonPitfalls: [
        'Mapped types only work on known keys — they do not iterate over string index signatures meaningfully',
        'Deep mapped types can cause infinite recursion if not guarded with a base case',
        'Key remapping with as can be confusing — remember that never removes the key entirely',
        'Over-engineering: simple Pick/Omit is clearer than a complex mapped type for basic operations',
      ],
      interviewTips: [
        'Implement Partial from scratch: { [K in keyof T]?: T[K] }',
        'Explain key remapping: [K in keyof T as NewKey] — as clause transforms or filters keys',
        'Show how to filter properties by value type using conditional types in the as clause',
        'Compare with JavaScript: mapped types are to types what Array.map is to values',
      ],
      relatedConcepts: [
        'generics',
        'conditional-types',
        'template-literal-types',
        'utility-types',
      ],
      difficulty: 'advanced',
      tags: ['typescript', 'mapped-types', 'type-manipulation', 'keyof'],
    },
    {
      id: 'template-literal-types',
      title: 'Template Literal Types',
      description:
        'Template literal types let you build string types using interpolation — the same backtick syntax as JavaScript template literals but at the type level. They enable type-safe string manipulation, event maps, and API route types.',
      keyPoints: [
        'Syntax: `prefix${Type}suffix` — creates string types from other types',
        'Intrinsic string manipulation: Uppercase<T>, Lowercase<T>, Capitalize<T>, Uncapitalize<T>',
        'Union distribution: `${"get" | "set"}${Capitalize<"name" | "age">}` = "getName" | "getAge" | "setName" | "setAge"',
        'Pattern matching with infer: extract parts of string types in conditional types',
        'Powerful for: event names, API routes, CSS property types, configuration keys',
        'Combined with mapped types: generate type-safe APIs from data models',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Template literal types',
          code: `// Event handler type generation
type EventName = 'click' | 'focus' | 'blur'
type EventHandler = \`on\${Capitalize<EventName>}\`
// 'onClick' | 'onFocus' | 'onBlur'

// CSS custom property types
type CSSVar = \`--\${string}\`
function setCSSVar(name: CSSVar, value: string) {
  document.documentElement.style.setProperty(name, value)
}
setCSSVar('--primary-color', '#007bff') // OK
// setCSSVar('primaryColor', '#007bff') // Error: not a CSSVar

// API route types
type ApiRoute = \`/api/\${'users' | 'posts' | 'comments'}\`
// '/api/users' | '/api/posts' | '/api/comments'

type CrudRoute = \`/api/\${'users' | 'posts'}/\${string}\`
// '/api/users/\${string}' | '/api/posts/\${string}'

// Extract parts with infer
type ExtractParam<T extends string> =
  T extends \`\${string}/:\${infer Param}/\${infer Rest}\`
    ? Param | ExtractParam<Rest>
    : T extends \`\${string}/:\${infer Param}\`
      ? Param
      : never

type Params = ExtractParam<'/users/:userId/posts/:postId'>
// 'userId' | 'postId'

// Type-safe event emitter
type EventMap = {
  userCreated: { userId: string }
  orderPlaced: { orderId: string; total: number }
}

type OnEvent = {
  [K in keyof EventMap as \`on\${Capitalize<string & K>}\`]: (data: EventMap[K]) => void
}
// { onUserCreated: (data: { userId: string }) => void;
//   onOrderPlaced: (data: { orderId: string; total: number }) => void }`,
        },
      ],
      useCases: [
        'Type-safe event systems: generate handler names from event names',
        'API route types: ensure route strings match expected patterns',
        'CSS-in-JS: type-safe property names and custom properties',
        'Configuration keys: generate typed config paths from nested objects',
      ],
      commonPitfalls: [
        'Combinatorial explosion: distributing many unions produces huge type spaces — watch for performance',
        'Recursive template literals can hit TypeScript\'s recursion depth limit',
        'Not all string operations are possible at the type level — complex parsing is better done at runtime with validation',
        'Over-engineering: simple string enums are often clearer than computed template literal types',
      ],
      interviewTips: [
        'Show the distribution: `${A | B}${C | D}` produces all combinations (4 types from 2 unions)',
        'Explain string manipulation utilities: Capitalize, Uppercase, Lowercase, Uncapitalize',
        'Demonstrate practical use: type-safe event emitter or API route extractor',
        'Compare with runtime: template literal types are compile-time string manipulation',
      ],
      relatedConcepts: [
        'mapped-types',
        'conditional-types',
        'generics',
      ],
      difficulty: 'advanced',
      tags: ['typescript', 'template-literals', 'string-types', 'type-manipulation'],
    },
    {
      id: 'discriminated-unions',
      title: 'Discriminated Unions',
      description:
        'A discriminated union is a union type where each member has a common literal property (the discriminant) that TypeScript uses for narrowing. Combined with exhaustiveness checking, they make impossible states impossible at the type level.',
      keyPoints: [
        'Each union member has a shared property with a unique literal type — the discriminant (usually "type", "kind", or "status")',
        'TypeScript narrows the type in switch/if blocks based on the discriminant value',
        'Exhaustiveness checking with never: in the default case, assign to never — TypeScript errors if you miss a case',
        'Redux action types are discriminated unions: { type: "increment" } | { type: "decrement"; amount: number }',
        'API response modeling: { status: "success"; data: T } | { status: "error"; message: string }',
        'satisfies operator (TS 4.9) validates that a value matches a type without widening — combine with const for literal types',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Discriminated unions with exhaustiveness checking',
          code: `// API response: impossible to have data AND error simultaneously
type ApiResponse<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
  | { status: 'loading' }

function handleResponse<T>(response: ApiResponse<T>) {
  switch (response.status) {
    case 'success':
      // TypeScript knows: response.data exists, response.message does not
      console.log(response.data)
      break
    case 'error':
      // TypeScript knows: response.message exists, response.data does not
      console.error(response.message)
      break
    case 'loading':
      console.log('Loading...')
      break
    default:
      // Exhaustiveness check: if you add a new status and forget a case,
      // TypeScript errors here because response is not assignable to never
      const _exhaustive: never = response
      throw new Error(\`Unhandled status: \${_exhaustive}\`)
  }
}

// State machine with discriminated union
type AuthState =
  | { state: 'idle' }
  | { state: 'authenticating'; provider: string }
  | { state: 'authenticated'; user: { id: string; name: string }; token: string }
  | { state: 'error'; error: string; retryCount: number }

// Impossible states are impossible:
// - Cannot have a user without being authenticated
// - Cannot have an error without retry count
// - Cannot be authenticating without knowing the provider

// satisfies + as const for validated literal types
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
} as const satisfies Record<string, string | number>
// Type is { readonly apiUrl: "https://api.example.com"; ... }
// Not widened to Record<string, string | number>`,
        },
      ],
      useCases: [
        'API response types — success/error/loading states with type-safe data access',
        'Redux/reducer action types — each action has a unique type discriminant with specific payloads',
        'State machines — each state has specific associated data, impossible states excluded by type',
        'Form field types — different field types (text, select, checkbox) with type-specific config',
      ],
      commonPitfalls: [
        'Forgetting the exhaustiveness check — new union members silently fall through without handling',
        'Using a discriminant with non-literal types (string instead of specific strings) — no narrowing possible',
        'Deeply nested discriminated unions — harder to work with; flatten when possible',
        'Not using satisfies for validation — as const narrows types but does not validate structure',
      ],
      interviewTips: [
        'Explain the pattern: shared literal property enables TypeScript narrowing in switch/if',
        'Demonstrate exhaustiveness checking with never — the compiler catches missing cases',
        'Connect to real patterns: Redux actions, API responses, state machines, result types',
        'Mention satisfies as the TS 4.9 complement: validates without widening',
      ],
      relatedConcepts: [
        'type-guards',
        'conditional-types',
        'generics',
        'mapped-types',
      ],
      difficulty: 'intermediate',
      tags: ['typescript', 'discriminated-unions', 'type-narrowing', 'pattern-matching'],
      proTip:
        'Model your domain with discriminated unions from day one. Instead of { data?: T; error?: string; isLoading: boolean } (where data AND error can both be set), use a union: { status: "success"; data: T } | { status: "error"; error: string } | { status: "loading" }. The type system then enforces that impossible combinations cannot exist.',
    },
    {
      id: 'type-guards',
      title: 'Type Guards & Assertion Functions',
      description:
        'Type guards narrow a type within a conditional block. TypeScript understands typeof, instanceof, and in checks natively. For complex types, you write custom type predicates (x is T) or assertion functions (asserts x is T).',
      keyPoints: [
        'Built-in guards: typeof (primitives), instanceof (classes), in (property existence)',
        'Custom type predicate: function isUser(x: unknown): x is User — narrows to User when returns true',
        'Assertion function: function assertUser(x: unknown): asserts x is User — narrows unconditionally or throws',
        'Type predicates are for conditional narrowing (if/else), assertion functions are for throwing on invalid input',
        'Discriminated union narrowing: switch on a discriminant property, TypeScript narrows each case automatically',
        'Truthiness narrowing: if (value) narrows out null, undefined, 0, "", and NaN',
        'Use unknown over any for external data — unknown forces you to narrow before using',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Type guards and assertion functions',
          code: `// Built-in type guards
function process(value: string | number) {
  if (typeof value === 'string') {
    value.toUpperCase() // TypeScript knows: string
  } else {
    value.toFixed(2) // TypeScript knows: number
  }
}

// Custom type predicate: x is T
interface User { type: 'user'; name: string; email: string }
interface Admin { type: 'admin'; name: string; permissions: string[] }
type Person = User | Admin

function isAdmin(person: Person): person is Admin {
  return person.type === 'admin'
}

function greet(person: Person) {
  if (isAdmin(person)) {
    console.log(\`Admin \${person.name} with \${person.permissions.length} permissions\`)
  } else {
    console.log(\`User \${person.name} (\${person.email})\`)
  }
}

// Assertion function: asserts x is T
function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(\`Expected \${name} to be defined\`)
  }
}

function processUser(user: User | null) {
  assertDefined(user, 'user')
  // After assertion: user is User (not null)
  console.log(user.name)
}

// Narrowing unknown input (API response, JSON parse)
function parseApiResponse(raw: unknown): User {
  if (
    typeof raw === 'object' &&
    raw !== null &&
    'type' in raw &&
    raw.type === 'user' &&
    'name' in raw &&
    typeof raw.name === 'string'
  ) {
    return raw as User // safe after checks
  }
  throw new Error('Invalid user data')
}`,
        },
      ],
      useCases: [
        'Validating external data (API responses, user input, JSON parse results)',
        'Narrowing discriminated unions in business logic',
        'Guard clauses at function boundaries: assert parameters are valid, then work with narrowed types',
        'Filtering arrays by type: array.filter(isAdmin) returns Admin[] (with type predicate)',
      ],
      commonPitfalls: [
        'Type predicate is wrong — TypeScript trusts your predicate even if the check is incorrect. A bug here creates unsound types',
        'Using as assertion instead of a type guard — as does not validate, it overrides. Type guards validate',
        'Not using unknown for external data — any skips all checking, unknown forces proper narrowing',
        'Forgetting that array.filter with a type predicate narrows the array type: users.filter(isAdmin) returns Admin[]',
      ],
      interviewTips: [
        'Explain the difference: type predicate (x is T) narrows conditionally, assertion (asserts x is T) narrows or throws',
        'Show how array.filter with a type predicate narrows the element type',
        'Describe unknown vs any: unknown forces narrowing (safe), any disables checking (unsafe)',
        'Mention Zod/Valibot as the production approach to runtime validation with type inference',
      ],
      relatedConcepts: [
        'discriminated-unions',
        'generics',
        'utility-types',
      ],
      difficulty: 'intermediate',
      tags: ['typescript', 'type-guards', 'narrowing', 'assertion', 'type-safety'],
    },
    {
      id: 'declaration-merging',
      title: 'Declaration Merging & Module Augmentation',
      description:
        'Declaration merging allows multiple declarations of the same name to combine into one. Module augmentation extends third-party types without forking the library. These are essential for customizing frameworks (Express, Next.js) with your own types.',
      keyPoints: [
        'Interface merging: multiple interface declarations with the same name merge their members',
        'Module augmentation: declare module "library" { ... } extends the library\'s types in your project',
        'Global augmentation: declare global { ... } extends global types (Window, NodeJS.ProcessEnv)',
        'Namespace merging: add types to existing namespaces',
        '.d.ts files: ambient type declarations that describe types without implementation',
        'Common use: extend Express Request with custom properties, add env vars to ProcessEnv, extend Next.js types',
        'Augmentation only adds — you cannot remove or override existing declarations',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Module and global augmentation',
          code: `// Extend Express Request with custom user property
// types/express.d.ts
declare module 'express' {
  interface Request {
    user?: {
      id: string
      role: 'admin' | 'user'
    }
  }
}

// Now req.user is typed in all Express handlers
app.get('/profile', (req, res) => {
  if (req.user?.role === 'admin') { /* ... */ }
})

// Extend NodeJS.ProcessEnv for type-safe env vars
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      NEXT_PUBLIC_API_URL: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

// Now process.env.DATABASE_URL is typed as string (not string | undefined)

// Extend Window with custom properties
declare global {
  interface Window {
    analytics: {
      track: (event: string, data?: Record<string, unknown>) => void
    }
  }
}

// Interface merging (same file or across files)
interface Config {
  apiUrl: string
}

interface Config {
  timeout: number // merged with the first declaration
}

const config: Config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  // both properties required
}`,
        },
      ],
      useCases: [
        'Adding custom properties to Express Request/Response',
        'Type-safe environment variables via ProcessEnv augmentation',
        'Extending third-party library types without forking (Next.js, Prisma, etc.)',
        'Adding global utility types available throughout the project',
      ],
      commonPitfalls: [
        'Forgetting export {} in augmentation files — without it, the file is not treated as a module and augmentation does not work',
        'Augmenting a default export instead of a named interface — augmentation only works with named types',
        'Not including .d.ts files in tsconfig includes — the augmentation is not picked up',
        'Using augmentation to "fix" library types instead of reporting the issue upstream',
      ],
      interviewTips: [
        'Explain interface merging: multiple interface declarations combine, unlike type aliases which error on duplicates',
        'Describe module augmentation syntax: declare module "name" { interface X { newProp: string } }',
        'Show a practical example: Express Request augmentation for auth middleware',
        'Mention the export {} trick to make a .d.ts file a module (required for augmentation)',
      ],
      relatedConcepts: [
        'generics',
        'discriminated-unions',
        'const-assertion',
      ],
      difficulty: 'advanced',
      tags: ['typescript', 'declaration-merging', 'module-augmentation', 'ambient-types'],
    },
    {
      id: 'variance',
      title: 'Variance',
      description:
        'Variance describes how subtyping of complex types relates to subtyping of their components. Understanding variance explains why you can pass a Dog[] where Animal[] is expected (covariance) but not always the reverse (contravariance).',
      keyPoints: [
        'Covariant (output position): if Dog extends Animal, then Producer<Dog> extends Producer<Animal>. Arrays, return types, readonly properties',
        'Contravariant (input position): if Dog extends Animal, then Consumer<Animal> extends Consumer<Dog>. Function parameters',
        'Invariant: neither covariant nor contravariant — mutable properties are invariant (both read and written)',
        'TypeScript is structurally typed — variance is determined by how the type parameter is used, not declared',
        'Function parameter bivariance: TypeScript allows both covariant and contravariant function parameters by default (unsound but practical)',
        'strictFunctionTypes (enabled in strict mode) makes function parameter types contravariant (correct behavior)',
        'Variance annotations (TypeScript 4.7+): in (contravariant) and out (covariant) keywords on type parameters',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Variance in practice',
          code: `interface Animal { name: string }
interface Dog extends Animal { breed: string }

// COVARIANT: readonly/output positions — Dog[] assignable to Animal[]
const dogs: readonly Dog[] = [{ name: 'Rex', breed: 'Shepherd' }]
const animals: readonly Animal[] = dogs // OK: covariant (read-only)

// CONTRAVARIANT: function parameters
type AnimalHandler = (animal: Animal) => void
type DogHandler = (dog: Dog) => void

const handleAnimal: AnimalHandler = (a) => console.log(a.name)
const handleDog: DogHandler = handleAnimal // OK: AnimalHandler works for Dogs
// const wrong: AnimalHandler = handleDog // Error: DogHandler might access .breed

// INVARIANT: mutable positions (both read and write)
// With strict: Dog[] is NOT assignable to Animal[] for mutable arrays
// because you could push a Cat into what should be a Dog[]

// Variance annotations (TypeScript 4.7+)
interface Producer<out T> { // T is only used in output position
  get(): T
}
interface Consumer<in T> { // T is only used in input position
  accept(value: T): void
}
interface Transformer<in I, out O> { // I is input, O is output
  transform(input: I): O
}`,
        },
      ],
      useCases: [
        'Understanding why generic type assignments work or fail',
        'Designing type-safe callback APIs and event systems',
        'Library design: choosing between covariant (readonly) and invariant (mutable) interfaces',
        'Debugging "Type X is not assignable to type Y" errors involving generics',
      ],
      commonPitfalls: [
        'Assuming arrays are always covariant — they are only safe when readonly; mutable arrays should be invariant',
        'Not enabling strictFunctionTypes — without it, function parameter bivariance can cause runtime errors',
        'Confusing variance direction: "Animal handler works for Dogs" seems backwards but is correct (contravariance)',
        'Over-thinking variance — in practice, structural typing handles most cases correctly without explicit reasoning',
      ],
      interviewTips: [
        'Explain with a concrete example: Dog extends Animal, so Dog[] (readonly) is assignable to Animal[] (covariant)',
        'Describe the function parameter case: a function accepting Animal can safely be used where Dog is expected (contravariant)',
        'Mention the bivariance hack: TypeScript allows unsound parameter variance for practicality — strictFunctionTypes fixes this',
        'Know the annotations: in (contravariant/input), out (covariant/output)',
      ],
      relatedConcepts: [
        'generics',
        'conditional-types',
        'type-guards',
      ],
      difficulty: 'expert',
      tags: ['typescript', 'variance', 'covariance', 'contravariance', 'type-theory'],
    },
    {
      id: 'const-assertion',
      title: 'const Assertion & satisfies',
      description:
        'as const narrows values to their literal types and makes everything readonly. satisfies validates a value against a type without widening. Together, they give you the tightest possible types with compile-time validation.',
      keyPoints: [
        'as const: widens nothing — string literals stay literals, objects become readonly, arrays become readonly tuples',
        'Without as const: { status: "active" } has type { status: string }. With as const: { status: "active" } has type { readonly status: "active" }',
        'Readonly tuples: [1, 2, 3] as const has type readonly [1, 2, 3], not number[]',
        'satisfies (TypeScript 4.9): validates that a value matches a type but preserves the narrow inferred type',
        'satisfies replaces the pattern: const x: Type = value (which widens to Type). Instead: const x = value satisfies Type (validates but keeps narrow type)',
        'Combine as const satisfies Type for maximum narrowing with validation',
        'Use satisfies for: configuration objects, route maps, theme definitions — anywhere you want validation AND literal types',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'as const and satisfies',
          code: `// as const: literal types + readonly
const routes = {
  home: '/',
  about: '/about',
  blog: '/blog',
} as const
// Type: { readonly home: "/"; readonly about: "/about"; readonly blog: "/blog" }
// Without as const: { home: string; about: string; blog: string }

type Route = typeof routes[keyof typeof routes] // "/" | "/about" | "/blog"

// satisfies: validate without widening
type Theme = Record<string, { bg: string; text: string }>

const theme = {
  light: { bg: '#fff', text: '#000' },
  dark: { bg: '#000', text: '#fff' },
} satisfies Theme
// Type is STILL { light: { bg: string; text: string }; dark: { bg: string; text: string } }
// NOT Record<string, { bg: string; text: string }> (which would lose key names)

theme.light.bg // OK: TypeScript knows "light" exists
// theme.ocean.bg // Error: "ocean" does not exist (not widened to Record<string, ...>)

// Compare with type annotation (widening problem)
const themeWidened: Theme = {
  light: { bg: '#fff', text: '#000' },
  dark: { bg: '#000', text: '#fff' },
}
// themeWidened.light.bg // OK but...
// themeWidened.ocean.bg // NO error! Record<string, ...> allows any key

// Combine: as const + satisfies for maximum safety
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
} as const satisfies {
  apiUrl: string
  timeout: number
  retries: number
}
// Type: { readonly apiUrl: "https://api.example.com"; readonly timeout: 5000; readonly retries: 3 }
// Validated against the shape AND preserves literal types`,
        },
      ],
      useCases: [
        'Configuration objects: validate shape, preserve literal values for type-safe access',
        'Route maps: as const preserves literal paths, satisfies validates the shape',
        'Theme/design tokens: validate against a type system while keeping specific values accessible',
        'Enum alternatives: as const objects with string values instead of TypeScript enums',
      ],
      commonPitfalls: [
        'Using as const on mutable data — everything becomes readonly, which may not be desired',
        'Confusing satisfies with type annotation — satisfies validates without widening, annotation widens',
        'Forgetting that as const makes arrays into tuples — [1, 2, 3] as const is readonly [1, 2, 3], not readonly number[]',
        'Not combining as const with satisfies when you need both narrowing and validation',
      ],
      interviewTips: [
        'Explain the problem satisfies solves: type annotations widen, satisfies validates without widening',
        'Show the difference: const x: Type = value (widened) vs const x = value satisfies Type (narrow + validated)',
        'Describe as const: makes all values literal types and readonly — like Object.freeze for the type system',
        'Mention that satisfies is one of the most impactful TypeScript additions for application code',
      ],
      relatedConcepts: [
        'discriminated-unions',
        'template-literal-types',
        'utility-types',
      ],
      difficulty: 'intermediate',
      tags: ['typescript', 'const-assertion', 'satisfies', 'literal-types', 'readonly'],
    },
  ],
}
