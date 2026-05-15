// scripts/parse.js
// input.txt 를 파싱하여 본문 → 문장 배열로 분리하고, 기존 public/config.json 의
// texts[N].sentences / texts[N].cues / quizzes[N] 만 갱신한다.
// experiment_metadata, practice, cues.A 등은 그대로 유지.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const INPUT_PATH = path.join(__dirname, 'input.txt')
const CONFIG_PATH = path.join(ROOT, 'public', 'config.json')

// 1) 입력 로드
const raw = fs.readFileSync(INPUT_PATH, 'utf8')

// 2) 섹션 분리
function parseSections(text) {
  const headers = [...text.matchAll(/═══\s*글\s*(\d+)\s*═══/g)]
  if (headers.length === 0) throw new Error('글 헤더를 찾지 못함')
  const out = {}
  for (let i = 0; i < headers.length; i++) {
    const m = headers[i]
    const start = m.index + m[0].length
    const end = i + 1 < headers.length ? headers[i + 1].index : text.length
    const section = text.slice(start, end)

    const cueBIdx = section.search(/\[Cue B\]/)
    const cueCIdx = section.search(/\[Cue C\]/)
    const quizIdx = section.search(/\[퀴즈\]/)
    if (cueBIdx < 0 || cueCIdx < 0 || quizIdx < 0) {
      throw new Error(`글 ${m[1]}: [Cue B]/[Cue C]/[퀴즈] 헤더 누락`)
    }

    const body = section.slice(0, cueBIdx).trim()
    const cueB = section.slice(cueBIdx + '[Cue B]'.length, cueCIdx).trim()
    const cueC = section.slice(cueCIdx + '[Cue C]'.length, quizIdx).trim()
    const quizText = section.slice(quizIdx + '[퀴즈]'.length).trim()

    out[m[1]] = { body, cueB, cueC, quizText }
  }
  return out
}

// 3) 본문 → 문장 배열 (따옴표 보호 + ender split)
function splitSentences(body) {
  const paragraphs = body.split(/\n+/).map((p) => p.trim()).filter(Boolean)
  const result = []
  for (const para of paragraphs) {
    result.push(...splitParagraph(para))
  }
  return result
}

const OPEN_QUOTES = { '"': '"', '“': '”' } // " → "
const CLOSE_QUOTES = new Set(['"', '”'])
const ENDERS = new Set(['.', '!', '?'])

function splitParagraph(para) {
  const result = []
  let buffer = ''
  let inQuote = false
  let closeChar = null

  for (let i = 0; i < para.length; i++) {
    const c = para[i]
    buffer += c

    if (inQuote) {
      if (c === closeChar) {
        inQuote = false
        closeChar = null
      }
      continue
    }

    if (OPEN_QUOTES[c]) {
      inQuote = true
      closeChar = OPEN_QUOTES[c]
      continue
    }

    if (ENDERS.has(c)) {
      // 다음 문자가 닫는 따옴표면 그것까지 포함
      let j = i + 1
      while (j < para.length && CLOSE_QUOTES.has(para[j])) {
        buffer += para[j]
        j++
      }
      // 다음이 공백이거나 끝이면 split
      const next = para[j] || ''
      if (next === '' || next === ' ') {
        result.push(buffer.trim())
        buffer = ''
        i = j - 1
      } else {
        i = j - 1
      }
    }
  }
  if (buffer.trim()) result.push(buffer.trim())
  // ellipsis(…)만 단독으로 한 문장이 되는 경우 등 너무 짧은 조각 합치기
  return mergeTinyChunks(result)
}

function mergeTinyChunks(arr) {
  // 1차: 직전 청크가 매우 짧고 의성어/감탄사 패턴(예: "통!", "아!")이면 다음과 합치기
  const merged = []
  for (let i = 0; i < arr.length; i++) {
    const cur = arr[i]
    const prev = merged[merged.length - 1]
    // 현재가 "통!", "아!", "와…" 같은 짧은(≤3자) + ! 인 경우 → 다음과 합치기
    if (cur.length <= 3 && /[!]$/.test(cur) && i + 1 < arr.length) {
      arr[i + 1] = cur + ' ' + arr[i + 1]
      continue
    }
    // 길이 ≤2 짧은 조각은 직전과 합치기 (… 등)
    if (prev && cur.length <= 2) {
      merged[merged.length - 1] = prev + ' ' + cur
      continue
    }
    merged.push(cur)
  }
  return merged
}

// 4) 퀴즈 파싱
function parseQuizzes(quizText) {
  const lines = quizText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^\d+\./.test(l))
  const out = []
  for (const line of lines) {
    const m = line.match(/^\d+\.\s*(.+?)\s*[→\-]+>?\s*([TF])\s*$/)
    if (!m) {
      console.warn(`[parse] 퀴즈 라인 파싱 실패: ${line}`)
      continue
    }
    out.push({ question: m[1].trim(), answer: m[2] })
  }
  return out
}

// 5) 메인
const sections = parseSections(raw)
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))

for (const [num, sec] of Object.entries(sections)) {
  const sentences = splitSentences(sec.body)
  const quizzes = parseQuizzes(sec.quizText)
  if (!config.texts[num]) config.texts[num] = { title: `글 ${num}` }
  config.texts[num] = {
    ...config.texts[num],
    title: config.texts[num].title || `글 ${num}`,
    sentences,
    cues: { B: sec.cueB, C: sec.cueC },
  }
  config.quizzes[num] = quizzes
  console.log(`[글 ${num}] 문장 ${sentences.length}개 / 퀴즈 ${quizzes.length}개`)
}

fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf8')
console.log(`✓ config.json 갱신 완료: ${CONFIG_PATH}`)
