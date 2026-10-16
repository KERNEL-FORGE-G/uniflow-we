import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

function findTestFiles(dir, matchExt = ['.test.ts', '.test.mjs', '.test.js']) {
  const files = []
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue
      const fullPath = join(dir, entry)
      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          files.push(...findTestFiles(fullPath, matchExt))
        } else if (matchExt.some(ext => entry.endsWith(ext))) {
          files.push(fullPath)
        }
      } catch {
        // ignore unreadable entries
      }
    }
  } catch {
    // ignore missing directories
  }
  return files
}

const testFiles = [
  ...findTestFiles('src'),
  ...findTestFiles('scripts')
]

if (testFiles.length === 0) {
  console.log('No test files found.')
  process.exit(0)
}

console.log(`Discovered ${testFiles.length} test files. Running test runner...`)

const result = spawnSync(process.execPath, ['--test', ...testFiles], {
  stdio: 'inherit',
  env: process.env
})

process.exit(result.status ?? 1)
