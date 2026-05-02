export interface FeedbackItem {
	id: string;
	studentText: string;
	question: string;
	hints: string[];   // progressive hints, subtle → direct
	answer: string;    // full explanation revealed on give up
	type: "missing" | "incorrect" | "incomplete" | "verbose";
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
	const text = await groqChat(apiKey, `You are an educational feedback assistant. Compare the student's notes against the AI reference notes and identify 3-6 specific issues.

Return ONLY a raw JSON array — no markdown fences, no explanation, just the array:
[
  {
    "studentText": "exact phrase from student notes to highlight, or empty string if content is completely missing",
    "question": "Socratic question that nudges the student toward the issue without giving the answer",
    "hints": [
      "subtle nudge — barely a hint, makes them think",
      "more direct — points at what to look for",
      "very specific — nearly gives it away but still makes them connect the dots"
    ],
    "answer": "full clear explanation of what was wrong or missing and why it matters",
    "type": "missing|incorrect|incomplete|verbose"
  }
]

Type meanings:
- "missing": important concept absent from student notes — set studentText to empty string
- "incorrect": student wrote something factually wrong — copy EXACT text from student notes
- "incomplete": student touched on it but did not fully explain — copy EXACT text
- "verbose": could be more concise — copy EXACT text

AI Reference Notes:
${aiNotes}

Student Notes:
${studentNotes}`);

	const clean = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
	return JSON.parse(clean);
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

export async function generateNotes(transcript: string, apiKey: string): Promise<string> {
	return groqChat(apiKey, `You are a note-taking assistant. Convert this lecture transcript into clear, structured notes. Use markdown with headings (##), bullet points, and **bold** for key terms. Be concise — capture the key ideas, not every word.\n\nTranscript:\n${transcript}`);
}
