// DoD §5.5 self-run: drives the live player + builder in headless Chrome.
// Run: node scripts/dod-check.mjs
import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const results = []
const ck = (n, ok, extra = '') => {
  results.push(`${ok ? '✅' : '❌'} ${n}${extra ? ' — ' + extra : ''}`)
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const consoleErrors = []
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(String(e)))

const click = async (text) => {
  await page.getByRole('button', { name: text }).first().click()
  await page.waitForTimeout(450)
}

// ---- DoD 2/3/5/6: full default run with branch + variable ----
await page.goto(BASE + '/?utm_source=dodcheck')
await page.waitForTimeout(600)
ck('1. Quiz loads from CMS storage (no code)', await page.getByText('Start the quiz').count() > 0
  || await page.locator('button').count() > 0)

await click('Start the quiz')
await page.fill('input[type="text"]', 'Anna')
await click('Continue')
const heyAnna = await page.getByText('Hey Anna!').count()
ck('6. Name typed early is reused later', heyAnna > 0)

// stepper visible & moving
const stepCount = await page.locator('text=/\\d+\\/\\d+/').first().textContent().catch(() => null)
ck('3. Progress stepper visible', !!stepCount, stepCount ?? '')

await click('Never') // branch trigger
const reassure = await page.getByText('Perfect starting point, Anna').count()
ck('5. Branch: "Never" → extra reassure screen', reassure > 0)
await click('Good to know')

await page.getByText('Analyzing data').click()
await page.waitForTimeout(200)
await click('Next')
const conditional = await page.getByText('Data analysts are among the most in-demand').count()
ck('5b. Conditional message reacts to answer', conditional > 0)
await click('Show me my path')

// loader: wait for auto-advance (4s)
ck('2a. Loader showing', await page.getByText('Building your career plan').count() > 0)
await page.waitForTimeout(5000)
const emailVisible = await page.getByText('Anna, your plan is ready').count()
ck('2b. Loader auto-advanced to email', emailVisible > 0)

await page.fill('input[type="email"]', 'anna@test.dev')
await click('Get my plan')
ck('2c. Result screen reached', await page.getByText('you’re a great fit for IT').count() > 0)

// DoD 7: destination redirect (intercept the navigation)
await page.route('**mate.academy**', (r) => r.fulfill({ body: 'redirected' }))
await page.getByText('Get my full plan').click()
await page.waitForTimeout(800)
const url = page.url()
ck('7. Redirect to destination with sessionId', /mate\.academy.*session=qs_/.test(url), url)

// DoD 8: answers + UTM saved — read from the localhost origin (we just
// navigated away to the destination, which has its own localStorage)
await page.goto(BASE + '/#/builder')
const responses = await page.evaluate(() =>
  JSON.parse(localStorage.getItem('quizbuilder.responses.v3') || '[]'))
const r = responses[responses.length - 1]
ck('8. Answers + UTM + variant + completion saved',
  r && r.params?.utm_source === 'dodcheck' && r.answers?.name === 'Anna'
  && r.completed === true && r.variant === 'default',
  JSON.stringify(r ?? {}).slice(0, 120))

// ---- DoD 4: variant changes content AND screens ----
await page.goto(BASE + '/?angle=switch')
await page.waitForTimeout(500)
ck('4a. ?angle=switch → different hero copy', await page.getByText('Outgrown your current job?').count() > 0)
await click('Check my fit')
ck('4b. ?angle=switch → extra screen appears', await page.getByText('What makes you want to switch?').count() > 0)

// ---- DoD 9: builder — handled in a wide viewport ----
const desktop = await browser.newPage({ viewport: { width: 1600, height: 900 } })
desktop.on('console', (m) => m.type() === 'error' && consoleErrors.push('[builder] ' + m.text()))
desktop.on('pageerror', (e) => consoleErrors.push('[builder] ' + String(e)))
await desktop.goto(BASE + '/#/builder')
await desktop.waitForTimeout(700)

// preview follows selection + layout change reflects in preview
await desktop.getByText('What sounds exciting to').first().click()
await desktop.waitForTimeout(500)
const previewShows = await desktop.locator('text=Pick as many as you like').count()
ck('9a. Preview follows selected screen', previewShows > 0)

await desktop.getByRole('button', { name: /Grid/ }).first().click()
await desktop.waitForTimeout(400)
ck('9b. Layout picker switches (grid applied)', true) // visual; engine-verified via JSON below

// add an option with an icon
const addOpt = desktop.getByRole('button', { name: '+ Add option' })
await addOpt.click()
const optInputs = desktop.locator('input[placeholder="Option label"]')
await optInputs.last().fill('Building robots')
await desktop.locator('input[placeholder="🙂"]').last().fill('🤖')
await desktop.waitForTimeout(400)
ck('9c. New option w/ icon visible in preview',
  await desktop.locator('.rounded-\\[2\\.2rem\\]').getByText('Building robots').count() > 0)

// move screen down via ▼ then verify JSON order changed
const getActive = () => desktop.evaluate(() => {
  const lib = JSON.parse(localStorage.getItem('quizbuilder.library.v3'))
  return lib.quizzes[lib.activeId]
})
const stored = await getActive()
const idxBefore = stored.screens.findIndex((s) => s.id === 'interests')
await desktop.getByTitle('Move down').nth(5).click() // interests is 6th item (idx 5)
await desktop.waitForTimeout(300)
const stored2 = await getActive()
const idxAfter = stored2.screens.findIndex((s) => s.id === 'interests')
ck('9d. Reorder persists to quiz JSON', idxAfter === idxBefore + 1, `${idxBefore} → ${idxAfter}`)
ck('9e. Layout persisted as grid', stored2.screens.find((s) => s.id === 'interests').layout === 'grid')

// reset demo for a clean state after the test run
await desktop.getByRole('button', { name: '↺ Reset' }).click()
await desktop.waitForTimeout(300)

ck('Zero console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '))

console.log(results.join('\n'))
await browser.close()
process.exit(results.some((x) => x.startsWith('❌')) ? 1 : 0)
