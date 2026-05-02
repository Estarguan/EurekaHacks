import { ItemView, MarkdownRenderer, Notice, WorkspaceLeaf } from "obsidian";
import type NoteRealPlugin from "./main";
import { generateNotes } from "./gemini";

export const RECORDER_VIEW_TYPE = "notereal-recorder";

export class RecorderView extends ItemView {
	plugin: NoteRealPlugin;

	private mediaRecorder: MediaRecorder | null = null;
	private audioChunks: Blob[] = [];
	private recognition: SpeechRecognition | null = null;
	private transcript = "";
	private generatedMarkdown = "";
	private timerInterval: number | null = null;
	private seconds = 0;
	private isRecording = false;

	private recordBtn!: HTMLButtonElement;
	private timerEl!: HTMLElement;
	private errorEl!: HTMLElement;
	private processingEl!: HTMLElement;
	private aiNotesEl!: HTMLElement;
	private studentTextarea!: HTMLTextAreaElement;
	private wordCountEl!: HTMLElement;
	private saveBtn!: HTMLButtonElement;

	constructor(leaf: WorkspaceLeaf, plugin: NoteRealPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return RECORDER_VIEW_TYPE;
	}
	getDisplayText() {
		return "NoteReal";
	}
	getIcon() {
		return "mic";
	}

	async onOpen() {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass("nr-container");

		// Header
		const header = container.createDiv("nr-header");
		const titleRow = header.createDiv("nr-title-row");
		titleRow.createEl("span", { text: "NoteReal", cls: "nr-title" });
		titleRow.createEl("span", { text: "Anti-AI", cls: "nr-badge" });

		// Record bar
		const recBar = container.createDiv("nr-rec-bar");
		this.recordBtn = recBar.createEl("button", { cls: "nr-record-btn" });
		this.recordBtn.innerHTML = '<span class="nr-dot"></span> Start Recording';
		this.recordBtn.addEventListener("click", () => this.toggleRecording());

		this.timerEl = recBar.createDiv("nr-timer");
		this.timerEl.style.display = "none";

		// Error bar
		this.errorEl = container.createDiv("nr-error");
		this.errorEl.style.display = "none";

		// Panels
		const panels = container.createDiv("nr-panels");

		// AI notes panel
		const aiPanel = panels.createDiv("nr-panel");
		aiPanel.createEl("h3", { text: "Lecture Notes", cls: "nr-panel-title" });
		this.processingEl = aiPanel.createDiv("nr-processing");
		this.processingEl.innerHTML =
			'<span class="nr-spinner"></span> Generating notes…';
		this.processingEl.style.display = "none";
		this.aiNotesEl = aiPanel.createDiv("nr-ai-notes");
		this.aiNotesEl.createEl("p", {
			text: "Record a lecture and notes will appear here automatically.",
			cls: "nr-placeholder",
		});

		// Student notes panel
		const studentPanel = panels.createDiv("nr-panel");
		studentPanel.createEl("h3", { text: "Your Notes", cls: "nr-panel-title" });
		this.studentTextarea = studentPanel.createEl("textarea", {
			cls: "nr-textarea",
			attr: {
				placeholder:
					"Write your own notes here…\n\nCapture ideas in your own words.",
				spellcheck: "true",
			},
		});
		this.studentTextarea.addEventListener("input", () =>
			this.updateWordCount()
		);
		this.wordCountEl = studentPanel.createDiv("nr-wordcount");
		this.wordCountEl.setText("0 words");

		// Footer
		const footer = container.createDiv("nr-footer");
		this.saveBtn = footer.createEl("button", {
			text: "Save to Vault",
			cls: "nr-save-btn",
		});
		this.saveBtn.disabled = true;
		this.saveBtn.addEventListener("click", () => this.saveToVault());
	}

	async onClose() {
		if (this.isRecording) await this.stopRecording();
	}

	private async toggleRecording() {
		this.isRecording ? await this.stopRecording() : await this.startRecording();
	}

	private async startRecording() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			this.mediaRecorder = new MediaRecorder(stream);
			this.audioChunks = [];
			this.transcript = "";
			this.generatedMarkdown = "";
			this.seconds = 0;
			this.errorEl.style.display = "none";
			this.aiNotesEl.empty();
			this.aiNotesEl.createEl("p", {
				text: "Record a lecture and notes will appear here automatically.",
				cls: "nr-placeholder",
			});
			this.saveBtn.disabled = true;

			this.mediaRecorder.ondataavailable = (e) => {
				if (e.data.size > 0) this.audioChunks.push(e.data);
			};
			this.mediaRecorder.start();
			this.isRecording = true;

			this.recordBtn.addClass("nr-recording");
			this.recordBtn.innerHTML =
				'<span class="nr-dot"></span> Stop Recording';
			this.timerEl.style.display = "flex";

			this.timerInterval = window.setInterval(() => {
				this.seconds++;
				this.timerEl.setText(this.formatTime(this.seconds));
			}, 1000);

			const SR =
				(window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition })
					.SpeechRecognition ||
				(window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition })
					.webkitSpeechRecognition;

			if (SR) {
				this.recognition = new SR();
				this.recognition.continuous = true;
				this.recognition.interimResults = true;
				this.recognition.lang = "en-US";
				this.recognition.onresult = (e: SpeechRecognitionEvent) => {
					for (let i = e.resultIndex; i < e.results.length; i++) {
						if (e.results[i].isFinal)
							this.transcript += e.results[i][0].transcript + " ";
					}
				};
				this.recognition.onend = () => {
					if (this.isRecording) this.recognition?.start();
				};
				this.recognition.start();
			}
		} catch {
			this.showError("Microphone access denied.");
		}
	}

	private async stopRecording() {
		this.recognition?.stop();
		if (this.mediaRecorder) {
			this.mediaRecorder.stop();
			this.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
		}
		if (this.timerInterval !== null) {
			window.clearInterval(this.timerInterval);
			this.timerInterval = null;
		}

		this.isRecording = false;
		this.recordBtn.removeClass("nr-recording");
		this.recordBtn.innerHTML =
			'<span class="nr-dot"></span> Start Recording';
		this.timerEl.style.display = "none";

		if (this.transcript.trim()) await this.runNoteGeneration();
	}

	private async runNoteGeneration() {
		const apiKey = this.plugin.settings.geminiApiKey;
		if (!apiKey) {
			this.showError("No Gemini API key. Add it in Settings → NoteReal.");
			return;
		}

		this.processingEl.style.display = "flex";
		this.aiNotesEl.empty();

		try {
			this.generatedMarkdown = await generateNotes(this.transcript, apiKey);
			this.processingEl.style.display = "none";
			await MarkdownRenderer.render(
				this.app,
				this.generatedMarkdown,
				this.aiNotesEl,
				"",
				this
			);
			this.saveBtn.disabled = false;
		} catch (e) {
			this.processingEl.style.display = "none";
			this.showError((e as Error).message);
		}
	}

	private async saveToVault() {
		const now = new Date();
		const dateStr = now.toISOString().split("T")[0];
		const timeStr = now.toTimeString().slice(0, 5).replace(":", "-");
		const baseName = `Lecture Notes ${dateStr} ${timeStr}`;
		const folder = this.plugin.settings.saveFolder.trim().replace(/\/$/, "");
		const path = folder ? `${folder}/${baseName}.md` : `${baseName}.md`;

		const content = [
			`# ${baseName}`,
			`*Recorded: ${now.toLocaleString()}*`,
			"",
			"## AI Generated Notes",
			"",
			this.generatedMarkdown,
			"",
			"---",
			"",
			"## My Notes",
			"",
			this.studentTextarea.value,
		].join("\n");

		try {
			if (folder && !(await this.app.vault.adapter.exists(folder))) {
				await this.app.vault.createFolder(folder);
			}
			await this.app.vault.create(path, content);
			new Notice(`Saved: ${path}`);
		} catch (e) {
			new Notice(`Failed to save: ${(e as Error).message}`);
		}
	}

	private updateWordCount() {
		const text = this.studentTextarea.value.trim();
		const count = text === "" ? 0 : text.split(/\s+/).length;
		this.wordCountEl.setText(`${count} ${count === 1 ? "word" : "words"}`);
	}

	private showError(msg: string) {
		this.errorEl.setText(`⚠ ${msg}`);
		this.errorEl.style.display = "block";
	}

	private formatTime(s: number): string {
		const m = String(Math.floor(s / 60)).padStart(2, "0");
		const sec = String(s % 60).padStart(2, "0");
		return `${m}:${sec}`;
	}
}
