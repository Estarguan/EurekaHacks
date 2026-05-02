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

export async function generateNotes(transcript: string, apiKey: string): Promise<string> {
	const res = await fetch(`${GROQ_BASE}/chat/completions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"content-type": "application/json",
		},
		body: JSON.stringify({
			model: "llama-3.3-70b-versatile",
			messages: [
				{
					role: "user",
					content: `You are a note-taking assistant. Convert this lecture transcript into clear, structured notes. Use markdown with headings (##), bullet points, and **bold** for key terms. Be concise — capture the key ideas, not every word.\n\nTranscript:\n${transcript}`,
				},
			],
		}),
	});

	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		throw new Error(`Groq notes ${res.status}${detail ? ": " + detail : ""}`);
	}

	const data = await res.json();
	return data.choices[0].message.content as string;
}
