export interface FeedbackItem {
	id: string;
	studentText: string;
	question: string;
	hints: string[];   // progressive hints, subtle → direct
	answer: string;    // full explanation revealed on give up
	type: "missing" | "incorrect" | "incomplete" | "verbose" | "unclear";
	from: number;
	to: number;
}

const GROQ_BASE = "https://api.groq.com/openai/v1";

export async function transcribeAudio(blob: Blob, apiKey: string): Promise<string> {
	const form = new FormData();
	form.append("file", blob, "recording.webm");
	form.append("model", "whisper-large-v3-turbo");

	const res = await fetch(`${GROQ_BASE}/audio/transcriptions`, {
		method: "POST",
		headers: { Authorization: `Bearer ${apiKey}` },
		body: form,
	});

	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		throw new Error(`Groq transcription ${res.status}${detail ? ": " + detail : ""}`);
	}

	const data = await res.json();
	return data.text as string;
}

export async function generateFeedback(
	studentNotes: string,
	aiNotes: string,
	apiKey: string
): Promise<Omit<FeedbackItem, "id" | "from" | "to">[]> {
	const [confusionItems, knowledgeItems] = await Promise.all([
		detectConfusion(studentNotes, apiKey),
		checkKnowledge(studentNotes, aiNotes, apiKey),
	]);
	return [...confusionItems, ...knowledgeItems];
}

export async function filterResolvedFeedback(
	originalItems: FeedbackItem[],
	updatedNotes: string,
	apiKey: string
): Promise<string[]> {
	if (originalItems.length === 0) return [];

	const itemSummary = originalItems.map(f => ({
		id: f.id,
		type: f.type,
		studentText: f.studentText || "",
		question: f.question,
		answer: f.answer,
	}));

	const text = await groqChat(apiKey, `Review these feedback issues against updated student notes. Determine which are STILL present and unresolved.

Original issues:
${JSON.stringify(itemSummary, null, 2)}

Updated student notes:
${updatedNotes}

For each issue decide:
- "missing": has the student now added this concept? If yes → resolved.
- "incorrect": is the incorrect statement gone or corrected? If yes → resolved.
- "incomplete": is it now explained sufficiently? If yes → resolved.
- "verbose": has the verbose passage been meaningfully shortened? If yes → resolved.
- "unclear": has the unclear passage been rewritten clearly? If yes → resolved.

Return ONLY a raw JSON array of IDs that are STILL UNRESOLVED. Do not include IDs that have been fixed.
["f0", "f2", ...]

If all issues are resolved, return [].`);

	const clean = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
	try { return JSON.parse(clean) as string[]; }
	catch { return originalItems.map(f => f.id); } // safe fallback: assume nothing resolved
}

export async function recheckFeedback(
	prevNotes: string,
	currNotes: string,
	aiNotes: string,
	apiKey: string
): Promise<Omit<FeedbackItem, "id" | "from" | "to">[]> {
	const prevSet = new Set(prevNotes.split('\n').map(l => l.trim()).filter(Boolean));
	const changed = currNotes.split('\n').map(l => l.trim()).filter(l => l && !prevSet.has(l)).join('\n');

	// Nothing changed — run full feedback so the student can't game it by not editing
	if (!changed) return generateFeedback(currNotes, aiNotes, apiKey);

	const [confusionItems, knowledgeItems] = await Promise.all([
		recheckConfusion(changed, currNotes, apiKey),
		recheckKnowledge(changed, currNotes, aiNotes, apiKey),
	]);
	return [...confusionItems, ...knowledgeItems];
}

async function recheckConfusion(
	changedText: string,
	fullNotes: string,
	apiKey: string
): Promise<Omit<FeedbackItem, "id" | "from" | "to">[]> {
	const text = await groqChat(apiKey, `The student revised their notes. Check ONLY the revised text for confusion, uncertainty, sloppiness, or unclear writing. Ignore unchanged content.

Revised text:
${changedText}

Full notes (context only — do not flag things outside the revised text):
${fullNotes}

Return ONLY a raw JSON array — no markdown, no explanation:
[
  {
    "studentText": "exact phrase from the revised text that has the problem",
    "question": "Socratic question making the student realise the problem",
    "hints": ["gentle nudge", "more direct", "almost gives it away"],
    "answer": "what is wrong and what to write instead",
    "type": "unclear"
  }
]
If nothing in the revised text is problematic, return [].`);

	const clean = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
	try { return JSON.parse(clean); } catch { return []; }
}

async function recheckKnowledge(
	changedText: string,
	fullNotes: string,
	aiNotes: string,
	apiKey: string
): Promise<Omit<FeedbackItem, "id" | "from" | "to">[]> {
	const text = await groqChat(apiKey, `The student revised their notes. Evaluate ONLY the revised text against the reference — is it accurate, complete, and appropriately detailed?

Revised text to evaluate:
${changedText}

Full notes (context only — do not flag things outside the revised text):
${fullNotes}

Reference notes:
${aiNotes}

Return ONLY a raw JSON array — no markdown fences, no explanation:
[
  {
    "studentText": "exact phrase from the revised text, or empty string if something is still missing",
    "question": "Socratic question nudging them toward the issue",
    "hints": ["subtle nudge", "more direct", "almost gives it away"],
    "answer": "what is wrong and why it matters",
    "type": "missing|incorrect|incomplete|verbose"
  }
]
If the revised text is accurate and complete, return [].`);

	const clean = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
	try { return JSON.parse(clean); } catch { return []; }
}

async function detectConfusion(
	studentNotes: string,
	apiKey: string
): Promise<Omit<FeedbackItem, "id" | "from" | "to">[]> {
	const text = await groqChat(apiKey, `Read these student notes and flag every moment that strikes you as confused, uncertain, sloppy, or unprofessional. Use your own judgement — don't hold back. If something feels off, flag it.

Return ONLY a raw JSON array — no markdown, no explanation:
[
  {
    "studentText": "the exact phrase from the notes that has the problem (as short as possible)",
    "question": "a Socratic question that makes the student realize why this is a problem",
    "hints": ["gentle nudge", "more direct", "almost gives it away"],
    "answer": "what is wrong and what to write instead",
    "type": "unclear"
  }
]

Student Notes:
${studentNotes}`);

	const clean = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
	try { return JSON.parse(clean); } catch { return []; }
}

async function checkKnowledge(
	studentNotes: string,
	aiNotes: string,
	apiKey: string
): Promise<Omit<FeedbackItem, "id" | "from" | "to">[]> {
	const text = await groqChat(apiKey, `Compare these student notes against the reference notes. Flag whatever you think is wrong — missing ideas, incorrect facts, things not explained well enough, anything over-explained. Use your judgement on what matters.

Return ONLY a raw JSON array — no markdown fences, no explanation:
[
  {
    "studentText": "exact phrase from student notes, or empty string if something is completely missing",
    "question": "Socratic question nudging them toward the issue",
    "hints": ["subtle nudge", "more direct", "almost gives it away"],
    "answer": "what is wrong and why it matters",
    "type": "missing|incorrect|incomplete|verbose"
  }
]

Type meanings:
- "incomplete": mentioned but not explained enough
- "missing": important idea completely absent — use empty studentText
- "incorrect": factually wrong
- "verbose": over-explained, should be shorter

Reference Notes:
${aiNotes}

Student Notes:
${studentNotes}`);

	const clean = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
	try { return JSON.parse(clean); } catch { return []; }
}

async function groqChat(apiKey: string, prompt: string): Promise<string> {
	const res = await fetch(`${GROQ_BASE}/chat/completions`, {
		method: "POST",
		headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [{ role: "user", content: prompt }],
		}),
	});
	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		throw new Error(`Groq ${res.status}${detail ? ": " + detail : ""}`);
	}
	const data = await res.json();
	return data.choices[0].message.content as string;
}

export async function generateNextHint(
	item: Pick<FeedbackItem, "type" | "studentText" | "question">,
	previousHints: string[],
	apiKey: string
): Promise<string> {
	return groqChat(apiKey, `A student is struggling with feedback on their notes. Generate the next progressive hint.

Issue type: ${item.type}
${item.studentText ? `Their text: "${item.studentText}"` : ""}
Question asked: ${item.question}
${previousHints.length > 0 ? `Previous hints already given:\n${previousHints.map((h, i) => `${i + 1}. ${h}`).join("\n")}` : ""}

Write only the next hint — more direct than the previous ones but still don't give away the full answer. Return only the hint text, nothing else.`);
}

// ── Metacognition ─────────────────────────────────────────────────────────────

export interface MetacognitionSection {
	title: string;
	studentExcerpt: string; // brief quote from student notes for this topic, or ""
	aiScore: number;        // 1–10
	feedbackIds: string[];  // IDs of feedback items that belong to this section
}

export async function groupFeedbackIntoSections(
	feedbackItems: FeedbackItem[],
	studentNotes: string,
	aiNotes: string,
	apiKey: string
): Promise<MetacognitionSection[]> {
	const itemSummary = feedbackItems.map(f => ({
		id: f.id,
		type: f.type,
		studentText: f.studentText || "",
	}));

	const raw = await groqChat(apiKey, `Assign these feedback items to topic sections from the lecture.

Feedback items:
${JSON.stringify(itemSummary, null, 2)}

AI Reference Notes:
${aiNotes}

Student Notes:
${studentNotes}

Create 4–6 sections based strictly on LECTURE TOPICS (e.g. "Cell Membrane Structure", "DNA Replication"). Never create sections named "Common Issues", "Miscellaneous", "General Notes", "Other Issues", or any issue-type category.

Assign every feedback item to exactly one section. Sections with no issues are allowed (good coverage).

aiScore: how well the student covered this topic (9–10 = no issues; 7–8 = minor; 5–6 = moderate; 3–4 = serious gaps; 1–2 = mostly wrong/missing).

Return ONLY a raw JSON array, no markdown:
[{
  "title": "lecture topic name",
  "studentExcerpt": "exact quote ≤15 words from student notes for this topic, or empty string",
  "aiScore": <1–10 integer>,
  "feedbackIds": ["f0", "f3", ...]
}]`);

	const cleaned = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
	const sections: MetacognitionSection[] = JSON.parse(cleaned);
	// Strip any meta-sections the model may sneak in
	const meta = /common\s*issue|miscellaneous|general\s*note|^other$|^summary$/i;
	return sections.filter(s => !meta.test(s.title.trim()));
}

export async function generateComparisonFeedback(
	sections: MetacognitionSection[],
	feedbackItems: FeedbackItem[],
	userScores: number[],
	apiKey: string
): Promise<string[]> {
	const byId = new Map(feedbackItems.map(f => [f.id, f]));
	const payload = sections.map((s, i) => ({
		title: s.title,
		userScore: userScores[i],
		aiScore: s.aiScore,
		issueCount: s.feedbackIds.length,
		issues: s.feedbackIds.map(id => byId.get(id)?.type).filter(Boolean),
	}));

	const raw = await groqChat(apiKey, `A student rated their own notes section-by-section. Compare each self-rating to the AI's assessment and write one short Socratic response per section.

Rules:
- If user overrated (user > AI by 2+): point out the gap directly. Name the specific issues. Ask what they think they missed.
- If user underrated (AI > user by 2+): acknowledge their self-doubt but show the notes are stronger than they think.
- If accurate (within 1–2): validate their self-awareness briefly.

Keep each response to 1–2 sentences. Be direct and specific.

Sections:
${JSON.stringify(payload, null, 2)}

Return ONLY a raw JSON array of strings, one per section, no markdown:
["feedback for section 0", "feedback for section 1", ...]`);

	return JSON.parse(raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim());
}

// ── Quiz ─────────────────────────────────────────────────────────────────────

export interface QuizQuestion {
	type: "explain" | "whatif" | "quiz";
	question: string;
	sampleAnswer: string;
}

export async function generateQuizQuestions(
	transcript: string,
	aiNotes: string,
	apiKey: string
): Promise<QuizQuestion[]> {
	return JSON.parse(
		(await groqChat(apiKey, `Generate 6 study questions for a student. Base everything ONLY on the lecture below — do not use outside knowledge. Every question and answer must come directly from this lecture's content.

Generate exactly:
- 2 of type "explain": Ask the student to explain a core concept simply, as if to someone with no background (Feynman technique). Start with "Explain..." or "In your own words, what is..."
- 2 of type "whatif": Hypothetical application questions that extend a concept from the lecture. Start with "What if..."
- 2 of type "quiz": Direct factual questions that could appear on a real exam about this specific lecture.

Return ONLY a raw JSON array, no markdown:
[{ "type": "explain|whatif|quiz", "question": "...", "sampleAnswer": "concise model answer from lecture content only" }]

Lecture Transcript:
${transcript}

Lecture Notes:
${aiNotes}`))
		.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim()
	);
}

export async function evaluateAnswer(
	question: QuizQuestion,
	studentAnswer: string,
	transcript: string,
	apiKey: string
): Promise<{ score: "good" | "partial" | "needs-work"; feedback: string }> {
	const raw = await groqChat(apiKey, `Evaluate a student's answer based ONLY on the lecture transcript below. Do not use outside knowledge.

Question: ${question.question}
Expected answer (reference): ${question.sampleAnswer}
Student's answer: ${studentAnswer}

Lecture:
${transcript}

Return ONLY a raw JSON object, no markdown:
{ "score": "good|partial|needs-work", "feedback": "1-2 sentences of specific feedback grounded in the lecture" }

Scoring: "good" = correct and reasonably complete; "partial" = right idea but missing key detail; "needs-work" = incorrect or too vague`);

	return JSON.parse(raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim());
}

export async function generateNotes(transcript: string, apiKey: string): Promise<string> {
	return groqChat(apiKey, `You are a note-taking assistant. Convert this lecture transcript into clear, structured notes. Use markdown with headings (##), bullet points, and **bold** for key terms. Be concise — capture the key ideas, not every word.\n\nTranscript:\n${transcript}`);
}
