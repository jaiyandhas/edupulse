export interface ParsedQuestion {
    subject: string
    question_text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_answer: string
    explanation: string
    gate_year: number | null
    source_type: string
    difficulty: string
}

/**
 * Parse the structured question paste format:
 * Question: ...
 * Option A: ...
 * Option B: ...
 * Option C: ...
 * Option D: ...
 * Answer: C
 * Explanation: ...
 * Subject: ...
 * GATE Year: (optional)
 * Source: ...
 * Difficulty: Easy/Medium/Hard
 * ------------------
 */
export function parseQuestions(rawText: string): ParsedQuestion[] {
    const blocks = rawText.split(/\n-{3,}\n?/).map(b => b.trim()).filter(Boolean)
    const results: ParsedQuestion[] = []

    for (const block of blocks) {
        try {
            const get = (key: string): string => {
                const regex = new RegExp(`^${key}\\s*:\\s*(.*)`, 'im')
                const match = block.match(regex)
                return match ? match[1].trim() : ''
            }

            const question_text = get('Question')
            const option_a = get('Option A')
            const option_b = get('Option B')
            const option_c = get('Option C')
            const option_d = get('Option D')
            const correct_answer = get('Answer').toUpperCase()
            const explanation = get('Explanation')
            const subject = get('Subject')
            const gate_year_str = get('GATE Year')
            const source_type = get('Source') || 'Practice Question'
            const difficulty = get('Difficulty') || 'Medium'

            if (!question_text || !option_a || !correct_answer || !subject) continue

            const gate_year = gate_year_str && /\d{4}/.test(gate_year_str)
                ? parseInt(gate_year_str.match(/\d{4}/)![0])
                : null

            results.push({
                subject,
                question_text,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_answer,
                explanation,
                gate_year,
                source_type,
                difficulty,
            })
        } catch {
            // Skip malformed blocks
        }
    }

    return results
}
