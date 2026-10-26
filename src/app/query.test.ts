import { describe, expect, it } from 'vitest'

import { normalizeQuery } from './query'

describe('normalizeQuery', () => {
  it('remove espaços no início e no fim', () => {
    expect(normalizeQuery('  São Paulo  ')).toBe('São Paulo')
  })

  it('colapsa espaços internos repetidos', () => {
    expect(normalizeQuery('Rio   de    Janeiro')).toBe('Rio de Janeiro')
  })

  it('retorna string vazia quando não há texto', () => {
    expect(normalizeQuery('')).toBe('')
    expect(normalizeQuery('   ')).toBe('')
  })

  it('trata tabs e quebras de linha', () => {
    expect(normalizeQuery('\tRio\n de\tJaneiro\r\n')).toBe('Rio de Janeiro')
  })

  it('preserva texto já normalizado', () => {
    expect(normalizeQuery('Belo Horizonte')).toBe('Belo Horizonte')
  })

  it('não trunca o texto', () => {
    const query = 'a'.repeat(120)

    expect(normalizeQuery(query)).toBe(query)
  })
})
