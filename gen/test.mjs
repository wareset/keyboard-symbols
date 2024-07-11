if (process.execArgv[0] === '--inspect') {
  console.log('gen-dev: started')
  setTimeout(() => console.log('gen-dev: stopped'), 1000 * 60 * 60 * 24 * 24)
}

import * as fs from 'fs'
import * as url from 'url'
import * as path from 'path'
// import { createRequire } from 'module'
// const require = createRequire(import.meta.url)
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const DIR__THIRD_PARTY = path.resolve(__dirname, '../third_party')

const DIR__TMP = path.resolve(__dirname, '../tmp')
fs.mkdirSync(DIR__TMP, { recursive: true })

const removeComments = (s = '') => s.replace(/\/\*[^]*?\*\/|\/\/[^\n]*/g, '')
const uni2char = (s = '0') =>
  /^0x[\da-f]+/i.test(s) ? JSON.stringify(String.fromCodePoint(+s)) : s === '0' ? '""' : s

const char2uni = (s = '0') => +s || (/^['"].['"]$/.test(s) ? s.codePointAt(1) : s)

//
// keysymdef.h
//
;(() => {
  const FILE_RES = path.join(DIR__TMP, 'keysymdef.mjs')
  if (fs.existsSync(FILE_RES)) return

  const FILE = path.join(DIR__THIRD_PARTY, 'chromium/third_party/x11proto/keysymdef.h')
  const data = removeComments(fs.readFileSync(FILE, 'utf8'))
  let resArr = []
  const REG = /(\w+)\s*\=\s*(\w+)/g
  for (let matches; (matches = REG.exec(data)); ) {
    if (!+matches[2]) continue
    resArr.push(`export const ${matches[1]} = ${+matches[2]} // ${matches[2]}`)
  }
  const res = resArr.join('\n')
  fs.writeFileSync(FILE_RES, res)
})()

//
// keysym_to_unicode.cc
//
;(() => {
  const FILE_RES = path.join(DIR__TMP, 'keysym_to_unicode.mjs')
  if (fs.existsSync(FILE_RES)) return

  const FILE = path.join(DIR__THIRD_PARTY, 'chromium/ui/events/keycodes/keysym_to_unicode.cc')
  const data = removeComments(fs.readFileSync(FILE, 'utf8'))
  // console.log(data)
  let resArr = []
  const REG = /\{\s*(\w+)\s*,\s*(\w+)\s*\}/g
  for (let matches; (matches = REG.exec(data)); ) {
    if (!+matches[2]) continue
    // console.log(matches)
    resArr.push(`export const ${matches[1]} = ${uni2char(matches[2])} // ${matches[2]}`)
  }
  const res = resArr.join('\n')
  fs.writeFileSync(FILE_RES, res)
})()

//
// dom_code_data.inc
//
;(() => {
  const FILE_RES = path.join(DIR__TMP, 'dom_code_data.mjs')
  if (fs.existsSync(FILE_RES)) return

  const FILE = path.join(DIR__THIRD_PARTY, 'chromium/ui/events/keycodes/dom/dom_code_data.inc')
  const data = removeComments(fs.readFileSync(FILE, 'utf8'))
  // console.log(data)
  let resArr = []
  const REG = /DOM_CODE\(([^)]+)/g
  for (let matches; (matches = REG.exec(data)); ) {
    let { 5: key, 6: id } = matches[1].split(',') //.map((v) => v.trim())
    key = key.trim()
    id = id.trim()
    resArr.push(`export const ${id} = ${key === 'NULL' ? null : key}`)
  }
  const res = resArr.join('\n')
  fs.writeFileSync(FILE_RES, res)
})()
//
// dom_key_data.inc
//
;(() => {
  const FILE_RES = path.join(DIR__TMP, 'dom_key_data.mjs')
  if (fs.existsSync(FILE_RES)) return

  const FILE = path.join(DIR__THIRD_PARTY, 'chromium/ui/events/keycodes/dom/dom_key_data.inc')
  const data = removeComments(fs.readFileSync(FILE, 'utf8'))
  // console.log(data)
  let resArr = []
  const REG = /DOM_KEY_MAP\(([^)]+)/g
  for (let matches; (matches = REG.exec(data)); ) {
    let { 0: key, 1: id } = matches[1].split(',') //.map((v) => v.trim())
    key = key.trim()
    id = id.trim()
    resArr.push(`export const ${id} = ${key === 'NULL' ? null : key}`)
  }
  const res = resArr.join('\n')
  fs.writeFileSync(FILE_RES, res)
})()

//
// keyboard_codes_posix.h
//
;(() => {
  const FILE_RES = path.join(DIR__TMP, 'keyboard_codes_posix.mjs')
  if (fs.existsSync(FILE_RES)) return

  const FILE = path.join(DIR__THIRD_PARTY, 'chromium/ui/events/keycodes/keyboard_codes_posix.h')
  const data = removeComments(fs.readFileSync(FILE, 'utf8'))
  // console.log(data)
  let resArr = []
  const REG = /(VKEY_\w+)\s*\=\s*(\w+)/g
  for (let matches; (matches = REG.exec(data)); ) {
    const v = char2uni(matches[2])
    // console.log(matches)
    resArr.push(`export const ${matches[1]} = ${v} // ${matches[2]}`)
  }
  const res = resArr.join('\n')
  fs.writeFileSync(FILE_RES, res)
})()

//
// keyboard_codes_win.h
//
;(() => {
  const FILE_RES = path.join(DIR__TMP, 'keyboard_codes_win.mjs')
  if (fs.existsSync(FILE_RES)) return

  const VK_DATA = (() => {
    const FILE = path.join(DIR__THIRD_PARTY, 'chromium/ui/events/keycodes/keyboard_defines_win.h')
    const data = removeComments(fs.readFileSync(FILE, 'utf8'))
    // console.log(data)
    const res = {}
    const REG = /(\bVK_\w+)\s+(0x\w+)/g
    for (let matches; (matches = REG.exec(data)); ) {
      const v = char2uni(matches[2])
      res[matches[1]] = v
    }
    return res
  })()
  // console.log(VK_DATA)

  const FILE = path.join(DIR__THIRD_PARTY, 'chromium/ui/events/keycodes/keyboard_codes_win.h')
  const data = removeComments(fs.readFileSync(FILE, 'utf8'))
  // console.log(data)
  let resArr = []
  const REG = /(VKEY_\w+)\s*\=\s*([^\s,]+)/g
  for (let matches; (matches = REG.exec(data)); ) {
    const v = matches[2] in VK_DATA ? VK_DATA[matches[2]] : char2uni(matches[2])
    // console.log(matches[1], v)
    resArr.push(`export const ${matches[1]} = ${v} // ${matches[2]}`)
  }
  const res = resArr.join('\n')
  fs.writeFileSync(FILE_RES, res)
})()

//
// dom_us_layout_data.h
//
;(() => {
  const FILE_RES = path.join(DIR__TMP, 'dom_us_layout_data.mjs')
  if (fs.existsSync(FILE_RES)) return

  const FILE = path.join(DIR__THIRD_PARTY, 'chromium/ui/events/keycodes/dom_us_layout_data.h')
  const data = removeComments(fs.readFileSync(FILE, 'utf8'))

  const IS_DEFAULT = 'IS_DEFAULT'
  let BUILDFLAG = IS_DEFAULT

  const DomCode = {}
  const DomKey = {}

  // console.log(data)
  const REG =
    /\{\s*(DomCode|DomKey)\:\:(\w+)\s*\,\s*([\w:]+?|\{[^]+?\})\s*\}|(\#endif)|\#if\s+BUILDFLAG\(([^)]+)\)/g
  for (let matches; (matches = REG.exec(data)); ) {
    if (matches[4]) {
      BUILDFLAG = IS_DEFAULT
      continue
    }
    if (matches[5]) {
      BUILDFLAG = matches[5]
      continue
    }

    const k = matches[2]
    const dom = matches[1] === 'DomCode' ? DomCode : DomKey
    const obj = dom[BUILDFLAG] || (dom[BUILDFLAG] = {})
    let val = obj[k] || ' '

    let v = matches[3].trim()
    if (v[0] === '{') {
      val += `c: [${v
        .slice(1, -1)
        .split(',')
        .map((v) => uni2char(v.trim()))
        .join(',')}], `
    } else if (/\:\:/.test(v)) {
      if (!/\bk\:/.test(val)) val += `k: "${v.split(/\:+/g).pop()}", `
      else console.log('k:', k, v)
    } else if (/^VKEY_/.test(v)) {
      if (!/\bv\:/.test(val)) val += `v: posix.${v} || win.${v}, `
      else val += `v2: posix.${v} || win.${v}, `
    } else {
      console.error(v)
    }

    obj[k] = val

    // console.log(matches[1], matches[2], matches[3])
  }

  let res = ''
  res += 'import * as posix from "./keyboard_codes_posix.mjs"\n'
  res += 'import * as win from "./keyboard_codes_win.mjs"\n'

  res += `\nexport const DomKey = {}\n`
  res += `\nconst K = DomKey\n`
  for (const b in DomKey) {
    res += `\n// ${b}\n`
    const isd = b === IS_DEFAULT ? {} : DomCode[IS_DEFAULT]
    for (const k in DomKey[b]) res += `K.${k} = {${isd[k] || ''}${DomKey[b][k]}}\n`
  }
  res += `\nexport const DomCode = {}\n`
  res += `\nconst C = DomCode\n`
  for (const b in DomCode) {
    res += `\n// ${b}\n`
    const isd = b === IS_DEFAULT ? {} : DomCode[IS_DEFAULT]
    for (const k in DomCode[b]) res += `C.${k} = {${isd[k] || ''}${DomCode[b][k]}}\n`
  }

  fs.writeFileSync(FILE_RES, res)
})()

//
//
//
;(() => {
  // return
  const FILE_RES = path.join(__dirname, '../src/keycodes.ts')
  if (fs.existsSync(FILE_RES)) return

  Promise.all([
    import(path.resolve(__dirname, '../tmp/dom_us_layout_data.mjs')),
    import(path.resolve(__dirname, '../tmp/dom_code_data.mjs')),
    import(path.resolve(__dirname, '../tmp/dom_key_data.mjs'))
  ]).then(([{ DomCode, DomKey }, codes, keys]) => {
    // console.log(DomKey)
    // console.log(DomCode)
    // console.log(codes)
    // console.log(keys)

    const resObj = {}

    let code, key, c, k, v2, keyCode, codeCode
    for (const id in DomCode) {
      codeCode = void 0
      k = DomCode[id].k

      c = DomCode[id].c
      if (c) {
        key = c[0] !== c[1] ? c : c[0]
      } else {
        if ((v2 = DomCode[id].v2)) {
          for (const k2 in DomKey)
            if (DomKey[k2].v === v2) {
              if (keys[k2]) k = k2
              break
            }
        }
        key = keys[k] || codes[k] || codes[id] || keys[id]
      }
      code = codes[id] || void 0
      if (!code && !key) continue
      keyCode = (DomKey[k] && DomKey[k].v) || DomCode[id].v || (DomKey[id] && DomKey[id].v)

      if (!keyCode) continue

      codeCode = DomCode[id] && DomCode[id].v
      if (codeCode === keyCode) codeCode = void 0

      if (codeCode && keyCode !== codeCode) console.log(id, code, key, keyCode, codeCode)

      // if (code || key)
        resObj[id] = { code, key, keyCode }
      if (codeCode) resObj[id]._code = codeCode

      // if (!code || !key) console.log(id, code, key)
    }

    console.log(resObj)

    let res = ''
    for (const k in resObj) res += `export const ${k} = ${JSON.stringify(resObj[k])} as const\n`

    fs.writeFileSync(FILE_RES, res)
  })
})()
