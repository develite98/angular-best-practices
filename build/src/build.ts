#!/usr/bin/env node
/**
 * Build script to compile shared + version-specific rules into AGENTS.md
 *
 * Usage:
 *   npm run build              # Build all versions
 *   npm run build -- v20+      # Build only v20+
 *   npm run build -- legacy    # Build only legacy
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { Rule, Section, ImpactLevel } from './types.js'
import { parseRuleFile, RuleFile } from './parser.js'
import { SHARED_RULES_DIR, VERSIONS, VersionKey, BUILD_DIR } from './config.js'

// Parse command line arguments
const args = process.argv.slice(2)
const targetVersion = args.find(a => !a.startsWith('--')) as VersionKey | undefined

/**
 * Read all rule files from a directory
 */
async function readRulesFromDir(dir: string): Promise<RuleFile[]> {
  try {
    const files = await readdir(dir)
    const ruleFiles = files
      .filter(f => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md')
      .sort()

    const rules: RuleFile[] = []
    for (const file of ruleFiles) {
      const filePath = join(dir, file)
      try {
        const parsed = await parseRuleFile(filePath)
        rules.push(parsed)
      } catch (error) {
        console.error(`Error parsing ${file}:`, error)
      }
    }
    return rules
  } catch {
    return []
  }
}

/**
 * Read section metadata from _sections.md
 */
async function readSectionMetadata(dir: string): Promise<Map<number, { title: string; impact: ImpactLevel; introduction: string }>> {
  const sections = new Map()
  const sectionsFile = join(dir, '_sections.md')

  try {
    const content = await readFile(sectionsFile, 'utf-8')
    const blocks = content.split(/(?=^## \d+\. )/m).filter(Boolean)

    for (const block of blocks) {
      const headerMatch = block.match(/^## (\d+)\.\s+(.+?)(?:\s+\([^)]+\))?$/m)
      if (!headerMatch) continue

      const num = parseInt(headerMatch[1])
      const title = headerMatch[2].trim()
      const impactMatch = block.match(/\*\*Impact:\*\*\s+(\w+(?:-\w+)?)/i)
      const descMatch = block.match(/\*\*Description:\*\*\s+(.+?)(?=\n\n##|$)/s)

      sections.set(num, {
        title,
        impact: (impactMatch?.[1].toUpperCase() || 'MEDIUM') as ImpactLevel,
        introduction: descMatch?.[1].trim() || ''
      })
    }
  } catch {
    // Ignore if file doesn't exist
  }

  return sections
}

/**
 * Generate markdown from rules
 */
function generateMarkdown(
  sections: Section[],
  metadata: {
    version: string
    organization: string
    date: string
    abstract: string
    angularVersion: string
    references?: string[]
  }
): string {
  let md = `# Angular Best Practices (${metadata.angularVersion})\n\n`
  md += `**Version ${metadata.version}**  \n`
  md += `${metadata.organization}  \n`
  md += `${metadata.date}\n\n`
  md += `> **Note:**  \n`
  md += `> This document is for AI agents and LLMs to follow when maintaining,  \n`
  md += `> generating, or refactoring Angular codebases. Optimized for ${metadata.angularVersion}.\n\n`
  md += `---\n\n`
  md += `## Abstract\n\n`
  md += `${metadata.abstract}\n\n`
  md += `---\n\n`
  md += `## Table of Contents\n\n`

  // Generate TOC
  sections.forEach((section) => {
    const anchor = `${section.number}-${section.title.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '')}`
    md += `${section.number}. [${section.title}](#${anchor}) — **${section.impact}**\n`
    section.rules.forEach((rule) => {
      const ruleAnchor = `${rule.id} ${rule.title}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
      md += `   - ${rule.id} [${rule.title}](#${ruleAnchor})\n`
    })
  })

  md += `\n---\n\n`

  // Generate sections
  sections.forEach((section) => {
    md += `## ${section.number}. ${section.title}\n\n`
    md += `**Impact: ${section.impact}**\n\n`
    if (section.introduction) {
      md += `${section.introduction}\n\n`
    }

    section.rules.forEach((rule) => {
      md += `### ${rule.id} ${rule.title}\n\n`
      md += `**Impact: ${rule.impact}${rule.impactDescription ? ` (${rule.impactDescription})` : ''}**\n\n`
      md += `${rule.explanation}\n\n`

      rule.examples.forEach((example) => {
        if (example.description) {
          md += `**${example.label} (${example.description}):**\n\n`
        } else {
          md += `**${example.label}:**\n\n`
        }
        if (example.code?.trim()) {
          md += `\`\`\`${example.language || 'typescript'}\n${example.code}\n\`\`\`\n\n`
        }
        if (example.additionalText) {
          md += `${example.additionalText}\n\n`
        }
      })

      if (rule.references?.length) {
        md += `Reference: ${rule.references.map(ref => `[${ref}](${ref})`).join(', ')}\n\n`
      }
    })

    md += `---\n\n`
  })

  if (metadata.references?.length) {
    md += `## References\n\n`
    metadata.references.forEach((ref, i) => {
      md += `${i + 1}. [${ref}](${ref})\n`
    })
  }

  return md
}

/**
 * Build a specific version
 */
async function buildVersion(versionKey: VersionKey) {
  const config = VERSIONS[versionKey]
  console.log(`\n=== Building ${versionKey} ===`)
  console.log(`Shared rules: ${SHARED_RULES_DIR}`)
  console.log(`Version rules: ${config.rulesDir}`)

  // Read shared and version-specific rules
  const sharedRules = await readRulesFromDir(SHARED_RULES_DIR)
  const versionRules = await readRulesFromDir(config.rulesDir)

  // Merge rules (version-specific takes precedence for same rule)
  const allRules = [...sharedRules, ...versionRules]

  // Read section metadata (prefer version-specific, fallback to shared)
  const versionSections = await readSectionMetadata(config.rulesDir)
  const sharedSections = await readSectionMetadata(SHARED_RULES_DIR)
  const sectionMetadata = new Map([...sharedSections, ...versionSections])

  // Group by section
  const sectionsMap = new Map<number, Section>()
  allRules.forEach(({ section, rule }) => {
    if (!sectionsMap.has(section)) {
      const meta = sectionMetadata.get(section) || { title: `Section ${section}`, impact: rule.impact as ImpactLevel, introduction: '' }
      sectionsMap.set(section, {
        number: section,
        title: meta.title,
        impact: meta.impact,
        introduction: meta.introduction,
        rules: []
      })
    }
    sectionsMap.get(section)!.rules.push(rule)
  })

  // Sort and assign IDs
  sectionsMap.forEach((section) => {
    section.rules.sort((a, b) => a.title.localeCompare(b.title, 'en-US', { sensitivity: 'base' }))
    section.rules.forEach((rule, index) => {
      rule.id = `${section.number}.${index + 1}`
      rule.subsection = index + 1
    })
  })

  const sections = Array.from(sectionsMap.values()).sort((a, b) => a.number - b.number)

  // Read metadata
  let metadata
  try {
    const content = await readFile(config.metadataFile, 'utf-8')
    metadata = JSON.parse(content)
  } catch {
    metadata = {
      version: '1.0.0',
      organization: 'Community',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      abstract: `Performance optimization guide for Angular applications.`,
      angularVersion: versionKey === 'v20+' ? 'Angular 20+' : 'Angular 12-16'
    }
  }

  // Generate and write markdown
  const markdown = generateMarkdown(sections, metadata)
  const outputFile = join(config.outputDir, 'AGENTS.md')
  await writeFile(outputFile, markdown, 'utf-8')

  const totalRules = allRules.length
  console.log(`✓ Built ${outputFile}`)
  console.log(`  ${sections.length} sections, ${totalRules} rules (${sharedRules.length} shared + ${versionRules.length} version-specific)`)

  return { sections: sections.length, rules: totalRules }
}

/**
 * Main build function
 */
async function build() {
  console.log('Angular Best Practices Build')
  console.log('============================')

  const versions = targetVersion ? [targetVersion] : (Object.keys(VERSIONS) as VersionKey[])

  for (const version of versions) {
    if (!VERSIONS[version]) {
      console.error(`Unknown version: ${version}`)
      console.error(`Available versions: ${Object.keys(VERSIONS).join(', ')}`)
      process.exit(1)
    }
    await buildVersion(version)
  }

  console.log('\n✓ Build complete!')
}

build().catch(err => {
  console.error('Build failed:', err)
  process.exit(1)
})
