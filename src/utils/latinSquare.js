// 9명 × 3 trial 라틴 방진 배정
// 각 참가자가 글 1·2·3 모두, cue A·B·C 모두 정확히 1회씩 경험
// 행: 참가자(P01~P09), 열: trial 순서, 값: { text: "1"|"2"|"3", cue: "A"|"B"|"C" }
const ASSIGNMENTS = {
  P01: [{ text: '1', cue: 'A' }, { text: '2', cue: 'B' }, { text: '3', cue: 'C' }],
  P02: [{ text: '2', cue: 'B' }, { text: '3', cue: 'C' }, { text: '1', cue: 'A' }],
  P03: [{ text: '3', cue: 'C' }, { text: '1', cue: 'A' }, { text: '2', cue: 'B' }],
  P04: [{ text: '1', cue: 'B' }, { text: '2', cue: 'C' }, { text: '3', cue: 'A' }],
  P05: [{ text: '2', cue: 'C' }, { text: '3', cue: 'A' }, { text: '1', cue: 'B' }],
  P06: [{ text: '3', cue: 'A' }, { text: '1', cue: 'B' }, { text: '2', cue: 'C' }],
  P07: [{ text: '1', cue: 'C' }, { text: '2', cue: 'A' }, { text: '3', cue: 'B' }],
  P08: [{ text: '2', cue: 'A' }, { text: '3', cue: 'B' }, { text: '1', cue: 'C' }],
  P09: [{ text: '3', cue: 'B' }, { text: '1', cue: 'C' }, { text: '2', cue: 'A' }],
}

export function normalizeParticipantId(input) {
  if (!input) return null
  const trimmed = String(input).trim().toUpperCase()
  const match = trimmed.match(/^P?(\d{1,2})$/)
  if (!match) return null
  const num = parseInt(match[1], 10)
  if (num < 1) return null
  return `P${String(num).padStart(2, '0')}`
}

export function getAssignment(participantId) {
  const normalized = normalizeParticipantId(participantId)
  if (!normalized) return null
  if (ASSIGNMENTS[normalized]) {
    return { participantId: normalized, trials: ASSIGNMENTS[normalized] }
  }
  // 9명 초과 시 mod 9로 wrap
  const num = parseInt(normalized.slice(1), 10)
  const wrapped = ((num - 1) % 9) + 1
  const wrappedId = `P${String(wrapped).padStart(2, '0')}`
  console.warn(`[latinSquare] ${normalized} > P09 → ${wrappedId} 그룹으로 매핑됩니다.`)
  return { participantId: normalized, trials: ASSIGNMENTS[wrappedId] }
}
