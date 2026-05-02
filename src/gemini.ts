export async function generateNotes(transcript: string, apiKey: string): Promise<string> {
	const res = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
		{
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: `You are a note-taking assistant. Convert this lecture transcript into clear, structured notes. Use markdown with headings (##), bullet points, and **bold** for key terms. Be concise — capture the key ideas, not every word.\n\nTranscript:\n${transcript}`,
							},
						],
					},
				],
			}),
		}
	);

	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		throw new Error(`Gemini API ${res.status}${detail ? ": " + detail : ""}`);
	}

	const data = await res.json();
	return data.candidates[0].content.parts[0].text as string;
}
