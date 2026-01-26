/**
 * Configuration for the build tooling
 */

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Root directory
export const ROOT_DIR = join(__dirname, '../..')

// Shared rules directory
export const SHARED_RULES_DIR = join(ROOT_DIR, 'shared/rules')

// Version-specific directories
export const VERSIONS = {
  'v20+': {
    rulesDir: join(ROOT_DIR, 'skills/angular-best-practices-v20+/rules'),
    outputDir: join(ROOT_DIR, 'skills/angular-best-practices-v20+'),
    metadataFile: join(ROOT_DIR, 'skills/angular-best-practices-v20+/metadata.json'),
    skillFile: join(ROOT_DIR, 'skills/angular-best-practices-v20+/SKILL.md'),
  },
  'legacy': {
    rulesDir: join(ROOT_DIR, 'skills/angular-best-practices-legacy/rules'),
    outputDir: join(ROOT_DIR, 'skills/angular-best-practices-legacy'),
    metadataFile: join(ROOT_DIR, 'skills/angular-best-practices-legacy/metadata.json'),
    skillFile: join(ROOT_DIR, 'skills/angular-best-practices-legacy/SKILL.md'),
  }
} as const

export type VersionKey = keyof typeof VERSIONS

// Build output directory
export const BUILD_DIR = join(__dirname, '..')
