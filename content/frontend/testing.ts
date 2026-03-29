// @ts-nocheck
import type { Category } from '@/lib/types'

export const frontendTestingCategory: Category = {
  id: 'frontend-testing',
  title: 'Frontend Testing',
  description:
    'React Testing Library philosophy, mocking strategies, Playwright E2E, visual regression, and what test coverage actually means. Test behavior, not implementation.',
  icon: 'TestTube',
  concepts: [
    {
      id: 'react-testing-library',
      title: 'React Testing Library Philosophy',
      description:
        'React Testing Library (RTL) enforces a single principle: test your components the way users interact with them. Query by accessible roles and text, not by CSS selectors or component internals. If your test breaks when you refactor implementation details, the test is wrong.',
      keyPoints: [
        'Core philosophy: "The more your tests resemble the way your software is used, the more confidence they can give you"',
        'Query priority: getByRole > getByLabelText > getByPlaceholderText > getByText > getByDisplayValue > getByAltText > getByTitle > getByTestId',
        'getBy* throws if not found (use for elements that must exist), queryBy* returns null (use for asserting absence), findBy* is async (use for elements that appear after async operations)',
        'user-event is preferred over fireEvent — user-event simulates real user interactions (typing triggers focus, keydown, keypress, input, keyup, change) while fireEvent dispatches a single synthetic event',
        'screen object is the primary query interface — screen.getByRole("button", { name: /submit/i })',
        'Avoid testing implementation details: do not query by className, component state, or internal method calls',
        'waitFor wraps assertions that depend on async state changes — it retries until the assertion passes or times out',
        'within(element) scopes queries to a specific container — useful for testing lists and repeated UI sections',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'RTL queries and user-event',
          code: `import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('submits form with user data', async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()

  render(<SignupForm onSubmit={onSubmit} />)

  // Query by role + accessible name (not by CSS class or test ID)
  await user.type(screen.getByRole('textbox', { name: /email/i }), 'alice@example.com')
  await user.type(screen.getByLabelText(/password/i), 'securepass123')

  // user-event simulates real interaction: focus → type → blur
  await user.click(screen.getByRole('button', { name: /sign up/i }))

  // Assert on behavior, not implementation
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'alice@example.com',
    password: 'securepass123',
  })
})

test('shows validation error for invalid email', async () => {
  const user = userEvent.setup()
  render(<SignupForm onSubmit={vi.fn()} />)

  await user.type(screen.getByRole('textbox', { name: /email/i }), 'not-an-email')
  await user.click(screen.getByRole('button', { name: /sign up/i }))

  // queryBy for asserting absence, findBy for async appearance
  expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
})

test('renders a list of items', () => {
  render(<TodoList items={[{ id: '1', text: 'Buy milk' }, { id: '2', text: 'Walk dog' }]} />)

  const list = screen.getByRole('list')
  const items = within(list).getAllByRole('listitem')
  expect(items).toHaveLength(2)
  expect(items[0]).toHaveTextContent('Buy milk')
})`,
        },
      ],
      useCases: [
        'Unit testing React components with real DOM rendering',
        'Testing accessible form interactions (label associations, ARIA roles)',
        'Verifying async UI updates (loading states, error messages, data fetching results)',
        'Testing component integration with context providers and routers',
      ],
      commonPitfalls: [
        'Using getByTestId as the default query — it should be the last resort, not the first choice',
        'Using fireEvent instead of user-event — fireEvent skips intermediate events that real interactions produce',
        'Testing state values directly instead of their visible effects — check what the user sees, not what useState holds',
        'Wrapping every assertion in waitFor — only async assertions need waitFor; synchronous assertions should not be wrapped',
        'Not using screen — importing getByRole from render() result works but screen is the recommended API',
      ],
      interviewTips: [
        'Explain the query priority and why getByRole is first: it tests accessibility simultaneously',
        'Describe the difference between getBy, queryBy, and findBy — each has a specific use case',
        'Compare user-event with fireEvent: user-event is a full interaction simulation, fireEvent is a low-level dispatch',
        'Mention that RTL encourages accessible markup — if you cannot query by role, your component may not be accessible',
      ],
      relatedConcepts: [
        'common-testing-patterns',
        'mocking-strategies',
        'playwright-e2e',
      ],
      difficulty: 'intermediate',
      tags: ['testing', 'react-testing-library', 'accessibility', 'user-event'],
      proTip:
        'If you struggle to write a test for a component, the component is probably hard to use. RTL exposes usability problems: if getByRole does not find the button, maybe it is not a button. If getByLabelText fails, the input is not labelled. The test difficulty IS the accessibility audit.',
    },
    {
      id: 'common-testing-patterns',
      title: 'Common Testing Patterns',
      description:
        'Recurring test patterns for forms, async state, context providers, routing, and API mocking. These patterns compose into a reliable test suite for any React application.',
      keyPoints: [
        'Custom render wrapper: create a renderWithProviders utility that wraps components in necessary providers (QueryClient, Router, Theme, Auth)',
        'MSW (Mock Service Worker) intercepts HTTP requests at the network level — your component uses real fetch/axios, MSW responds with mock data',
        'Async testing: use findBy* queries or waitFor for elements that appear after data loading, transitions, or animations',
        'Router testing: wrap components in MemoryRouter with initialEntries for route-dependent components',
        'Form testing with user-event: type, clear, selectOptions, upload, tab — simulate the full user workflow',
        'Error state testing: MSW can return error responses to test error boundaries and fallback UI',
        'Snapshot testing: use sparingly — snapshots break on every UI change and provide low confidence. Prefer explicit assertions',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Custom render + MSW + async testing',
          code: `// test-utils.tsx — shared render wrapper
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/providers/theme'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // fail fast in tests
    },
  })
}

function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & { route?: string },
) {
  const queryClient = createTestQueryClient()
  const { route = '/', ...renderOptions } = options ?? {}

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <ThemeProvider>{children}</ThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// MSW handler for API mock
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'Alice', email: 'alice@example.com' },
      { id: '2', name: 'Bob', email: 'bob@example.com' },
    ])
  }),
  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: '3', ...body }, { status: 201 })
  }),
]

const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Test with real data fetching via MSW
test('displays users from API', async () => {
  renderWithProviders(<UserList />)

  // findBy waits for async data to appear
  expect(await screen.findByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Bob')).toBeInTheDocument()
})

// Test error state by overriding handler
test('shows error when API fails', async () => {
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json({ message: 'Server error' }, { status: 500 })
    }),
  )

  renderWithProviders(<UserList />)
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()
})`,
        },
      ],
      useCases: [
        'Testing data-fetching components with MSW for realistic HTTP mocking',
        'Testing forms with validation, submission, and success/error feedback',
        'Testing route-dependent components with MemoryRouter',
        'Testing components that depend on multiple context providers',
      ],
      commonPitfalls: [
        'Mocking fetch/axios directly instead of using MSW — brittle, couples tests to HTTP client implementation',
        'Not resetting MSW handlers between tests — one test\'s override leaks into the next',
        'Forgetting retry: false on test QueryClient — failed queries retry 3 times by default, slowing tests',
        'Testing loading states by checking for spinners that disappear too fast — use findBy to wait for the final state',
      ],
      interviewTips: [
        'Explain the custom render pattern: wrap once, use everywhere — DRY provider setup',
        'Describe MSW: intercepts at the network level so components use real fetch — more realistic than jest.mock("axios")',
        'Walk through the error testing pattern: override MSW handler, render component, assert error UI',
        'Mention that these patterns are framework-agnostic — MSW works with any HTTP client',
      ],
      relatedConcepts: [
        'react-testing-library',
        'mocking-strategies',
        'playwright-e2e',
      ],
      difficulty: 'intermediate',
      tags: ['testing', 'msw', 'patterns', 'react-query', 'integration'],
    },
    {
      id: 'mocking-strategies',
      title: 'Mocking Strategies',
      description:
        'Mocking replaces real dependencies with controlled substitutes for testing. The choice between spy, mock, stub, and MSW depends on what you are testing and how close to reality you want your tests to be.',
      keyPoints: [
        'Spy (vi.spyOn / jest.spyOn): wraps a real function, lets it execute, but records calls and arguments — use to verify a function was called without replacing it',
        'Mock (vi.fn / jest.fn): replaces a function entirely with a configurable stub — use when you control the return value',
        'Module mock (vi.mock / jest.mock): replaces an entire module — use for third-party dependencies or heavy internal modules',
        'MSW (Mock Service Worker): intercepts HTTP at the network level — the gold standard for API mocking because your code uses real fetch/axios',
        'Fake timers (vi.useFakeTimers / jest.useFakeTimers): control Date.now, setTimeout, setInterval — use for testing debounce, polling, animations',
        'Spy vs Mock vs Stub: spy observes, mock replaces with tracking, stub replaces with a fixed return value. In practice, vi.fn() does all three',
        'Rule of thumb: mock as little as possible. The more you mock, the less your test resembles reality',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Mocking strategies comparison',
          code: `// 1. SPY: observe calls without replacing behavior
const logSpy = vi.spyOn(console, 'log')
doSomething()
expect(logSpy).toHaveBeenCalledWith('expected message')
logSpy.mockRestore() // restore original

// 2. MOCK FUNCTION: replace with controlled behavior
const mockFn = vi.fn()
  .mockReturnValueOnce('first call')
  .mockReturnValueOnce('second call')
  .mockReturnValue('default')

expect(mockFn()).toBe('first call')
expect(mockFn()).toBe('second call')
expect(mockFn()).toBe('default')
expect(mockFn).toHaveBeenCalledTimes(3)

// 3. MODULE MOCK: replace an entire module
vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
  identify: vi.fn(),
}))

// In the test, analytics.track is a vi.fn() — no real tracking
import { track } from '@/lib/analytics'
test('tracks button click', async () => {
  const user = userEvent.setup()
  render(<TrackableButton />)
  await user.click(screen.getByRole('button'))
  expect(track).toHaveBeenCalledWith('button_clicked', { label: 'cta' })
})

// 4. FAKE TIMERS: control time for debounce/interval
test('debounced search fires after 300ms', async () => {
  vi.useFakeTimers()
  const onSearch = vi.fn()
  render(<SearchInput onSearch={onSearch} debounceMs={300} />)

  await userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    .type(screen.getByRole('textbox'), 'hello')

  expect(onSearch).not.toHaveBeenCalled() // not yet

  vi.advanceTimersByTime(300) // advance past debounce
  expect(onSearch).toHaveBeenCalledWith('hello')

  vi.useRealTimers()
})

// 5. MSW: mock HTTP at the network level (preferred for APIs)
// See "Common Testing Patterns" for full MSW example`,
        },
      ],
      useCases: [
        'Module mocks for analytics, logging, and third-party SDKs that should not run in tests',
        'MSW for all HTTP API mocking — realistic, decoupled from HTTP client implementation',
        'Fake timers for debounce, throttle, polling, setTimeout-based logic',
        'Spies for verifying function calls without changing behavior (e.g., console.error was called)',
      ],
      commonPitfalls: [
        'Over-mocking: mocking so many things that the test proves nothing about real behavior',
        'Not restoring mocks: a mock from one test leaks into another, causing flaky failures',
        'Mocking what you do not own (fetch, localStorage) at the wrong level — MSW is better for fetch, actual localStorage is fine for unit tests',
        'Using module mocks for everything instead of MSW for HTTP — couples tests to implementation (which HTTP client is used)',
        'Fake timers with user-event: must pass advanceTimers to userEvent.setup() or interactions hang',
      ],
      interviewTips: [
        'Explain the hierarchy: prefer no mock → MSW for HTTP → spy for observation → module mock as last resort',
        'Describe why MSW is preferred over jest.mock("axios"): MSW works regardless of HTTP client, tests real request/response flow',
        'Walk through a fake timer test: setup → interact → advance time → assert',
        'Mention the testing diamond: more integration tests (with real dependencies), fewer unit tests with mocks',
      ],
      relatedConcepts: [
        'react-testing-library',
        'common-testing-patterns',
        'playwright-e2e',
      ],
      difficulty: 'intermediate',
      tags: ['testing', 'mocking', 'msw', 'fake-timers', 'spies'],
      proTip:
        'Every mock is a lie you tell your test suite. The more mocks, the more lies, the less confidence. Start with zero mocks and add them only when a real dependency makes the test slow, flaky, or impossible. MSW is the exception — it replaces the network, not your code.',
    },
    {
      id: 'playwright-e2e',
      title: 'Playwright E2E Testing',
      description:
        'Playwright tests your application as a real user would: launching a browser, navigating pages, clicking buttons, and asserting on visible results. It auto-waits for elements, intercepts network requests, and provides trace-based debugging.',
      keyPoints: [
        'Auto-wait: Playwright waits for elements to be visible, enabled, and stable before interacting — no manual waitFor needed',
        'Locator strategy: page.getByRole(), page.getByText(), page.getByLabel() — same accessible query philosophy as RTL',
        'Network interception: page.route() mocks API responses at the browser level — useful for testing error states and edge cases',
        'Trace viewer: records every action, screenshot, network request, and console log — replay failures step by step',
        'Multi-browser: test on Chromium, Firefox, and WebKit from one test suite',
        'Component testing: test individual components without a full app — render directly in the browser (experimental)',
        'Parallel execution: tests run in isolated browser contexts, parallel by default',
        'Codegen: npx playwright codegen records user interactions and generates test code — great for getting started',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Playwright E2E test',
          code: `import { test, expect } from '@playwright/test'

test.describe('User signup flow', () => {
  test('creates account and redirects to dashboard', async ({ page }) => {
    // Navigate
    await page.goto('/signup')

    // Fill form using accessible locators (auto-waits for each)
    await page.getByLabel('Email').fill('alice@example.com')
    await page.getByLabel('Password').fill('securepass123')
    await page.getByRole('button', { name: 'Sign Up' }).click()

    // Assert redirect and welcome message
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible()
  })

  test('shows validation error for short password', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('Email').fill('alice@example.com')
    await page.getByLabel('Password').fill('123')
    await page.getByRole('button', { name: 'Sign Up' }).click()

    await expect(page.getByText(/at least 8 characters/i)).toBeVisible()
  })

  test('handles server error gracefully', async ({ page }) => {
    // Intercept API and return error
    await page.route('/api/signup', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' }),
      })
    )

    await page.goto('/signup')
    await page.getByLabel('Email').fill('alice@example.com')
    await page.getByLabel('Password').fill('securepass123')
    await page.getByRole('button', { name: 'Sign Up' }).click()

    await expect(page.getByText(/something went wrong/i)).toBeVisible()
  })
})

// Trace-based debugging: run with --trace on
// npx playwright test --trace on
// npx playwright show-report  ← opens trace viewer`,
        },
      ],
      useCases: [
        'Critical user flows: signup, login, checkout, payment — the paths that must never break',
        'Cross-browser testing: ensure the app works on Chromium, Firefox, and WebKit',
        'Visual regression: screenshot comparison across deployments',
        'API integration verification: test the full stack from browser to server',
      ],
      commonPitfalls: [
        'Writing too many E2E tests — they are slow and expensive. Focus on critical paths, not every edge case',
        'Using CSS selectors instead of accessible locators — page.locator(".btn-primary") is fragile; getByRole is stable',
        'Not using auto-wait — adding manual sleeps or waitForSelector when Playwright already waits automatically',
        'Running E2E tests against production APIs — use network interception or a test environment',
        'Flaky tests from animation timing — use page.evaluate to disable CSS animations in test environment',
      ],
      interviewTips: [
        'Explain the testing pyramid/diamond: E2E tests are at the top — fewer, slower, higher confidence for critical paths',
        'Describe auto-wait: Playwright retries locator queries and waits for actionability (visible, enabled, stable) automatically',
        'Compare with Cypress: Playwright supports multiple browsers natively, runs in Node (not browser), and has better parallelization',
        'Mention the trace viewer as the killer feature for debugging failures: it records the entire test execution',
      ],
      relatedConcepts: [
        'react-testing-library',
        'visual-regression',
        'common-testing-patterns',
      ],
      difficulty: 'intermediate',
      tags: ['testing', 'playwright', 'e2e', 'browser', 'automation'],
      proTip:
        'Run Playwright with --trace on-first-retry in CI. This records a trace only when a test fails and is retried, giving you full debugging context without the overhead of recording every passing test. The trace viewer shows screenshots, DOM snapshots, network requests, and console logs at every step.',
    },
    {
      id: 'visual-regression',
      title: 'Visual Regression Testing',
      description:
        'Visual regression testing captures screenshots and compares them against baselines to detect unintended visual changes. It catches CSS regressions, layout shifts, and rendering bugs that functional tests miss entirely.',
      keyPoints: [
        'Screenshot comparison: take a screenshot, compare pixel-by-pixel against a stored baseline, highlight differences',
        'Percy (BrowserStack) and Chromatic (Storybook) are cloud-based visual testing platforms — they handle rendering, comparison, and approval workflows',
        'Playwright screenshot assertions: expect(page).toHaveScreenshot() with built-in comparison and threshold configuration',
        'Storybook + Chromatic: test visual components in isolation — each story is a visual test case',
        'Threshold: allow small pixel differences (anti-aliasing, font rendering) to avoid false positives — typically 0.1-0.5%',
        'Snapshot testing (Jest toMatchSnapshot) is NOT visual regression — it compares serialized DOM, not rendered pixels. DOM snapshots break on every HTML change and provide low confidence',
        'Visual tests complement functional tests: functional tests verify behavior, visual tests verify appearance',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Playwright visual regression',
          code: `import { test, expect } from '@playwright/test'

test('homepage matches visual baseline', async ({ page }) => {
  await page.goto('/')

  // Wait for all images and fonts to load
  await page.waitForLoadState('networkidle')

  // Compare screenshot against stored baseline
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixelRatio: 0.01, // allow 1% pixel difference
    animations: 'disabled', // freeze animations for consistent screenshots
  })
})

test('button states render correctly', async ({ page }) => {
  await page.goto('/components/button')

  // Screenshot specific element, not entire page
  const button = page.getByRole('button', { name: 'Primary' })
  await expect(button).toHaveScreenshot('button-default.png')

  await button.hover()
  await expect(button).toHaveScreenshot('button-hover.png')

  await button.focus()
  await expect(button).toHaveScreenshot('button-focus.png')
})

// Update baselines when intentional changes are made:
// npx playwright test --update-snapshots`,
        },
      ],
      useCases: [
        'Design system components — ensure visual consistency across changes',
        'CSS refactoring — verify that restructuring styles does not change appearance',
        'Cross-browser rendering — catch browser-specific visual bugs',
        'Responsive layouts — screenshot at multiple viewport sizes',
      ],
      commonPitfalls: [
        'False positives from font rendering differences across OS/browser versions — use Docker for consistent rendering or increase threshold',
        'Relying on Jest snapshot testing for visual regression — DOM snapshots check structure, not appearance',
        'Not disabling animations — animations cause flaky screenshots depending on timing',
        'Too many visual tests — they are slow and generate large baseline files. Focus on design system components and critical pages',
      ],
      interviewTips: [
        'Explain the difference: Jest snapshots test DOM structure, visual regression tests rendered pixels',
        'Describe the workflow: capture → compare → review diff → approve or fix',
        'Mention the CI integration: Percy/Chromatic run in PR checks, block merge on unapproved visual changes',
        'Know the limitations: visual tests are slow, flaky across environments, and require baseline management',
      ],
      relatedConcepts: [
        'playwright-e2e',
        'react-testing-library',
        'test-coverage-metrics',
      ],
      difficulty: 'intermediate',
      tags: ['testing', 'visual-regression', 'screenshots', 'percy', 'chromatic'],
    },
    {
      id: 'test-coverage-metrics',
      title: 'Test Coverage Metrics',
      description:
        'Test coverage measures how much of your code is exercised by tests. It is a useful signal but a dangerous target — 100% coverage does not mean zero bugs, and chasing coverage numbers leads to low-value tests.',
      keyPoints: [
        'Line coverage: percentage of code lines executed during tests — the most common metric',
        'Branch coverage: percentage of if/else/switch branches taken — more meaningful than line coverage because it tests decision points',
        'Function coverage: percentage of functions called — useful for detecting dead code',
        'Statement coverage: percentage of statements executed — similar to line coverage but counts multiple statements per line',
        '80% coverage target means: 80% of lines/branches/functions are exercised. The remaining 20% is acceptable for error handlers, edge cases, and generated code',
        'What coverage misses: it measures execution, not correctness. A test that calls a function without asserting anything counts as covered',
        'Coverage-driven testing antipattern: writing tests to hit coverage numbers instead of testing meaningful behavior',
        'Uncovered code is a signal: investigate it. It might be dead code (delete it), error handling (test it), or intentionally untested (document why)',
      ],
      codeExamples: [
        {
          language: 'typescript',
          label: 'Coverage interpretation',
          code: `// This function has 100% line coverage with one test:
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}

// Test 1: covers the happy path (2 of 3 lines = 67%)
test('divides numbers', () => {
  expect(divide(10, 2)).toBe(5)
})

// Test 2: covers the error branch (now 3 of 3 lines = 100%)
test('throws on division by zero', () => {
  expect(() => divide(10, 0)).toThrow('Division by zero')
})

// BUT: 100% coverage does NOT mean correct behavior
// This test "covers" the function but proves nothing:
test('bad test that inflates coverage', () => {
  divide(10, 2) // covered! but no assertion — bugs go undetected
})

// Coverage config in vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
      exclude: [
        'node_modules',
        '**/*.test.ts',
        '**/*.d.ts',
        '**/types/**',
        '**/mocks/**',
      ],
    },
  },
})`,
        },
      ],
      useCases: [
        'CI enforcement: fail builds when coverage drops below threshold',
        'Identifying untested code: coverage reports highlight files and branches without tests',
        'Code review: check if new code is covered by new tests',
        'Dead code detection: uncovered functions that are also unused can be deleted',
      ],
      commonPitfalls: [
        'Treating coverage as a quality metric — high coverage with weak assertions is worse than lower coverage with strong tests',
        'Chasing 100% coverage — diminishing returns after ~80%; the last 20% often requires mocking internals and testing trivia',
        'Excluding too many files from coverage — generated types and mocks should be excluded, but not business logic',
        'Only checking line coverage — branch coverage is more valuable because it tests decision points',
        'Gaming coverage with assertion-free tests — they execute code without verifying behavior',
      ],
      interviewTips: [
        'Explain the four types: line, branch, function, statement — and why branch coverage is most meaningful',
        'Describe what coverage misses: execution is not correctness. A test without assertions still counts as coverage',
        'Discuss the 80% target: it is a floor, not a ceiling. Focus on meaningful tests, not hitting a number',
        'Mention mutation testing as the next level: it verifies that tests actually detect bugs by introducing mutations and checking if tests fail',
      ],
      relatedConcepts: [
        'react-testing-library',
        'common-testing-patterns',
        'mocking-strategies',
      ],
      difficulty: 'beginner',
      tags: ['testing', 'coverage', 'metrics', 'quality', 'ci'],
      proTip:
        'Use branch coverage as your primary metric, not line coverage. A function with an if/else has two branches. Line coverage can hit 100% by only testing the happy path (both lines in the if block execute). Branch coverage reveals that the else path was never tested. In CI, enforce branch coverage thresholds — they catch more real gaps.',
    },
  ],
}
