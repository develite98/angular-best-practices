#!/usr/bin/env node
/**
 * Validate rule files in shared and version-specific directories
 */

import { readdir } from 'fs/promises'
import { join } from 'path'
import { Rule } from './types.js'
import { parseRuleFile } from './parser.js'
import { SHARED_RULES_DIR, VERSIONS } from './config.js'

interface ValidationError {
  file: string
  source: string
  message: string
}

function validateRule(rule: Rule, file: string, source: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (!rule.title?.trim()) {
    errors.push({ file, source, message: 'Missing or empty title' })
  }

  if (!rule.explanation?.trim()) {
    errors.push({ file, source, message: 'Missing or empty explanation' })
  }

  if (!rule.examples?.length) {
    errors.push({ file, source, message: 'Missing examples' })
  } else {
    const codeExamples = rule.examples.filter(e => e.code?.trim())
    const hasBad = codeExamples.some(e =>
      /incorrect|wrong|bad/i.test(e.label)
    )
    const hasGood = codeExamples.some(e =>
      /correct|good|usage|example|implementation/i.test(e.label)
    )

    if (!codeExamples.length) {
      errors.push({ file, source, message: 'Missing code examples' })
    } else if (!hasBad && !hasGood) {
      errors.push({ file, source, message: 'Missing bad/incorrect or good/correct examples' })
    }
  }

  const validImpacts = ['CRITICAL', 'HIGH', 'MEDIUM-HIGH', 'MEDIUM', 'LOW-MEDIUM', 'LOW']
  if (!validImpacts.includes(rule.impact)) {
    errors.push({ file, source, message: `Invalid impact: ${rule.impact}` })
  }

  return errors
}

async function validateDir(dir: string, source: string): Promise<{ errors: ValidationError[], fileCount: number }> {
  const errors: ValidationError[] = []
  let fileCount = 0

  try {
    const files = await readdir(dir)
    const ruleFiles = files.filter(f => f.endsWith('.md') && !f.startsWith('_'))
    fileCount = ruleFiles.length

    for (const file of ruleFiles) {
      try {
        const { rule } = await parseRuleFile(join(dir, file))
        errors.push(...validateRule(rule, file, source))
      } catch (error) {
        errors.push({
          file,
          source,
          message: `Parse error: ${error instanceof Error ? error.message : String(error)}`
        })
      }
    }
  } catch {
    // Directory doesn't exist
  }

  return { errors, fileCount }
}

async function validate() {
  console.log('Validating rule files...\n')

  const allErrors: ValidationError[] = []
  let totalFiles = 0

  // Validate shared rules
  console.log('Checking shared rules...')
  const { errors: sharedErrors, fileCount: sharedFiles } = await validateDir(SHARED_RULES_DIR, 'shared')
  allErrors.push(...sharedErrors)
  totalFiles += sharedFiles
  console.log(`  ${sharedFiles} files, ${sharedErrors.length} errors`)

  // Validate each version
  for (const [version, config] of Object.entries(VERSIONS)) {
    console.log(`Checking ${version} rules...`)
    const { errors: versionErrors, fileCount: versionFiles } = await validateDir(config.rulesDir, version)
    allErrors.push(...versionErrors)
    totalFiles += versionFiles
    console.log(`  ${versionFiles} files, ${versionErrors.length} errors`)
  }

  console.log('')

  if (allErrors.length > 0) {
    console.error('✗ Validation failed:\n')
    allErrors.forEach(err => {
      console.error(`  [${err.source}] ${err.file}: ${err.message}`)
    })
    process.exit(1)
  } else {
    console.log(`✓ All ${totalFiles} rule files are valid`)
  }
}

validate()
