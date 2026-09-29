// ==========================================
// HAXIC ANSWER SELECTOR
// ==========================================
//
// This module will eventually compare answers
// from multiple AI providers.
//
// It does NOT generate answers.
// ==========================================


// ==========================================
// SCORE ANSWER
// ==========================================

export function scoreAnswer(answer) {

    if (!answer) {

        return 0;

    }


    let score = 0;


    // Has content

    if (answer.content) {

        score += 10;

    }


    // Reasonable length

    if (
        answer.content &&
        answer.content.length > 50
    ) {

        score += 10;

    }


    // Contains code

    if (
        answer.content &&
        answer.content.includes("```")
    ) {

        score += 10;

    }


    return score;

}


// ==========================================
// CHOOSE BEST ANSWER
// ==========================================

export function chooseBestAnswer(
    answers
) {

    if (
        !answers ||
        answers.length === 0
    ) {

        return null;

    }


    let bestAnswer = null;

    let bestScore = -1;


    for (
        const answer of answers
    ) {

        const score =
            scoreAnswer(answer);


        if (score > bestScore) {

            bestScore = score;

            bestAnswer = answer;

        }

    }


    return {

        answer: bestAnswer,

        score: bestScore

    };

}