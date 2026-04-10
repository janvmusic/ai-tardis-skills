#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const SKILLS_SRC = path.join(__dirname, '..', 'skills')
const SKILLS_DEST = path.join(process.cwd(), '.claude', 'skills')

const [,, command, skillName] = process.argv

function list() {
  const skills = fs.readdirSync(SKILLS_SRC).filter(f =>
    fs.statSync(path.join(SKILLS_SRC, f)).isDirectory()
  )
  console.log('Available skills:')
  skills.forEach(skill => console.log(`  - ${skill}`))
}

function install(skill) {
  if (!skill) {
    console.error('Usage: tardis-ai install <skill-name>')
    process.exit(1)
  }
  const src = path.join(SKILLS_SRC, skill)
  if (!fs.existsSync(src)) {
    console.error(`Skill "${skill}" not found. Run "tardis-ai list" to see available skills.`)
    process.exit(1)
  }
  const dest = path.join(SKILLS_DEST, skill)
  copyDir(src, dest)
  console.log(`Installed "${skill}" to .claude/skills/${skill}`)
}

function remove(skill) {
  if (!skill) {
    console.error('Usage: tardis-ai remove <skill-name>')
    process.exit(1)
  }
  const dest = path.join(SKILLS_DEST, skill)
  if (!fs.existsSync(dest)) {
    console.error(`Skill "${skill}" is not installed.`)
    process.exit(1)
  }
  fs.rmSync(dest, { recursive: true })
  console.log(`Removed "${skill}" from .claude/skills/${skill}`)
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry)
    const destPath = path.join(dest, entry)
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function help() {
  console.log('Usage: tardis-ai <command> [skill-name]')
  console.log('')
  console.log('Commands:')
  console.log('  list              Show available skills')
  console.log('  install <skill>   Install a skill to .claude/skills/')
  console.log('  remove <skill>    Remove an installed skill')
  console.log('')
  console.log('Skills:')
  console.log('  code-review       Thorough code reviews on branch changes')
  console.log('  commit            Git commits with conventional commit format')
  console.log('  create-pr         GitHub Pull Requests with structured descriptions')
  console.log('  frontend-expert   React + TypeScript UI/UX guidance')
  console.log('  rails-expert      Rails application patterns and best practices')
  console.log('  unravel           Stress-test a plan via relentless design interviews')
}

function tardis() {
  console.log('           ___')
  console.log('          | |')
  console.log('          | |')
  console.log('  -------------------')
  console.log('  -------------------')
  console.log('   |  ___  |  ___  |')
  console.log('   | | | | | | | | |')
  console.log('   | |-+-| | |-+-| |')
  console.log('   | |_|_| | |_|_| |')
  console.log('   |  ___  |  ___  |')
  console.log('   | |   | | |   | |')
  console.log('   | |   | | |   | |')
  console.log('   | |___| | |___| |')
  console.log('   |  ___  |  ___  |')
  console.log('   | |   | | |   | |')
  console.log('   | |   | | |   | |')
  console.log('   | |___| | |___| |')
  console.log('   |       |       |')
  console.log('  ===================')
}

switch (command) {
  case 'list':    list();          break
  case 'install': install(skillName); break
  case 'remove':  remove(skillName);  break
  case 'tardis':  tardis();        break
  default:        help();          break
}
