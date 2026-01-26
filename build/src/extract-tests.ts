#!/usr/bin/env node
/**
 * Extract test cases from all rule files
 */

import { readdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { TestCase } from './types.js'
import { parseRuleFile } from './parser.js'
import { SHARED_RULES_DIR, VERSIONS, BUILD_DIR } from './config.js'

async function extractFromDir(dir: string): Promise<TestCase[]> {
  const testCases: TestCase[] = []

  try {
    const files = await readdir(dir)
    const ruleFiles = files.filter(f => f.endsWith('.md') && !f.startsWith('_'))

    for (const file of ruleFiles) {
      try {
        const { rule } = await parseRuleFile(join(dir, file))

        for (const example of rule.examples) {
          if (!example.code?.trim()) continue

          const labelLower = example.label.toLowerCase()
          let type: 'bad' | 'good' | null = null

          if (/incorrect|bad|wrong/.test(labelLower)) {
            type = 'bad'
          } else if (/correct|good|example|usage/.test(labelLower)) {
            type = 'good'
          }

          if (type) {
            testCases.push({
              ruleId: rule.id || file.replace('.md', ''),
              ruleTitle: rule.title,
              type,
              code: example.code,
              language: example.language || 'typescript',
              description: example.description
            })
          }
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error)
      }
    }
  } catch {
    // Directory doesn't exist
  }

  return testCases
}

async function extractTests() {
  console.log('Extracting test cases...\n')

  const allTestCases: TestCase[] = []

  // Extract from shared
  const sharedCases = await extractFromDir(SHARED_RULES_DIR)
  allTestCases.push(...sharedCases)
  console.log(`Shared: ${sharedCases.length} test cases`)

  // Extract from each version
  for (const [version, config] of Object.entries(VERSIONS)) {
    const versionCases = await extractFromDir(config.rulesDir)
    allTestCases.push(...versionCases)
    console.log(`${version}: ${versionCases.length} test cases`)
  }

  // Write combined test cases
  const outputFile = join(BUILD_DIR, 'test-cases.json')
  await writeFile(outputFile, JSON.stringify(allTestCases, null, 2), 'utf-8')

  console.log(`\n✓ Extracted ${allTestCases.length} total test cases`)
  console.log(`  Bad examples: ${allTestCases.filter(t => t.type === 'bad').length}`)
  console.log(`  Good examples: ${allTestCases.filter(t => t.type === 'good').length}`)
  console.log(`  Output: ${outputFile}`)
}

extractTests()
