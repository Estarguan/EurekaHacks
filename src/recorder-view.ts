import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import { EditorView, keymap, drawSelection, placeholder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, indentOnInput } from "@codemirror/language";
import type NoteRealPlugin from "./main";

export const RECORDER_VIEW_TYPE = "notereal-recorder";

const obsidianEditorTheme = EditorView.theme({
	"&": {
		height: "100%",
		backgroundColor: "transparent",
		color: "var(--text-normal)",
		fontSize: "var(--font-text-size)",
		fontFamily: "var(--font-text)",
	},
	"&.cm-focused": { outline: "none" },
	".cm-scroller": {
		fontFamily: "inherit",
		lineHeight: "var(--line-height-normal, 1.6)",
		overflow: "auto",
	},
	".cm-content": {
		padding: "2px 0",
		caretColor: "var(--caret-color, var(--text-normal))",
		minHeight: "100%",
	},
	".cm-line": { padding: "0" },
	".cm-cursor, .cm-dropCursor": {
		borderLeftColor: "var(--text-accent, var(--text-normal))",
	},
	"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
		background: "var(--text-selection) !important",
	},
	".cm-activeLine": { backgroundColor: "transparent" },
	".cm-placeholder": { color: "var(--text-faint)", fontStyle: "italic" },
});

export class RecorderView extends ItemView {
	plugin: NoteRealPlugin;

	private mediaRecorder: MediaRecorder | null = null;
	private audioChunks: Blob[] = [];
	private recognition: SpeechRecognition | null = null;
	private finalTranscript = "";
	private timerInterval: number | null = null;
	private seconds = 0;
	private isRecording = false;
	private savedVaultPath: string | null = null;

	private recordBtn!: HTMLButtonElement;
	private micSelect!: HTMLSelectElement;
	private timerEl!: HTMLElement;
	private errorEl!: HTMLElement;
	private transcriptEl!: HTMLElement;
	private transcriptFinalSpan!: HTMLSpanElement;
	private transcriptInterimSpan!: HTMLSpanElement;
	private feedbackEl!: HTMLElement;
	private cmEditor!: EditorView;
	private wordCountEl!: HTMLElement;
	private saveBtn!: HTMLButtonElement;

	constructor(leaf: WorkspaceLeaf, plugin: NoteRealPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() { return RECORDER_VIEW_TYPE; }
	getDisplayText() { return "NoteReal"; }
	getIcon() { return "mic"; }

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

		this.micSelect = recBar.createEl("select", { cls: "nr-mic-select" });
		this.micSelect.title = "Select microphone";
		this.populateMicList();

		// Refresh device list if hardware changes (plug/unplug)
		navigator.mediaDevices.addEventListener("devicechange", () => this.populateMicList());

		this.timerEl = recBar.createDiv("nr-timer");
		this.timerEl.style.display = "none";

		// Error bar
		this.errorEl = container.createDiv("nr-error");
		this.errorEl.style.display = "none";

		// Panels
		const panels = container.createDiv("nr-panels");

		// ── Transcript panel ──────────────────────────────────────────
		const transcriptPanel = panels.createDiv("nr-panel");
		transcriptPanel.createEl("h3", { text: "Transcript", cls: "nr-panel-title" });
		this.transcriptEl = transcriptPanel.createDiv("nr-transcript");

		// Two persistent spans — final text + faint interim text.
		// Using textContent directly (no DOM rebuild) is reliable in Electron.
		this.transcriptFinalSpan = this.transcriptEl.createEl("span", { cls: "nr-transcript-final" });
		this.transcriptInterimSpan = this.transcriptEl.createEl("span", { cls: "nr-interim" });

		// Placeholder until recording starts
		this.transcriptFinalSpan.textContent = "Start recording — your speech will appear here live.";
		this.transcriptFinalSpan.addClass("nr-placeholder");

		// ── Your Notes panel ──────────────────────────────────────────
		const studentPanel = panels.createDiv("nr-panel");
		studentPanel.createEl("h3", { text: "Your Notes", cls: "nr-panel-title" });

		const editorEl = studentPanel.createDiv("nr-cm-editor");
		this.cmEditor = new EditorView({
			state: EditorState.create({
				doc: "",
				extensions: [
					history(),
					drawSelection(),
					indentOnInput(),
					bracketMatching(),
					EditorView.lineWrapping,
					keymap.of([...defaultKeymap, ...historyKeymap]),
					placeholder("Write your own notes here…\n\nCapture ideas in your own words."),
					obsidianEditorTheme,
					EditorView.updateListener.of((update) => {
						if (update.docChanged) this.updateWordCount();
					}),
				],
			}),
			parent: editorEl,
		});

		this.wordCountEl = studentPanel.createDiv("nr-wordcount");
		this.wordCountEl.setText("0 words");

		// ── Feedback panel ────────────────────────────────────────────
		const feedbackPanel = panels.createDiv("nr-panel");
		feedbackPanel.createEl("h3", { text: "Feedback", cls: "nr-panel-title" });
		this.feedbackEl = feedbackPanel.createDiv("nr-feedback");
		const feedbackPlaceholder = this.feedbackEl.createDiv("nr-feedback-placeholder");
		feedbackPlaceholder.createEl("div", { cls: "nr-feedback-icon", text: "✦" });
		feedbackPlaceholder.createEl("p", { text: "AI feedback on your notes" });
		feedbackPlaceholder.createEl("span", { text: "Coming soon", cls: "nr-coming-soon" });

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
		this.cmEditor?.destroy();
	}

	private async toggleRecording() {
		this.isRecording ? await this.stopRecording() : await this.startRecording();
	}

	private async populateMicList() {
		// A brief getUserMedia grants the permission needed to see device labels
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const mics = devices.filter((d) => d.kind === "audioinput");

			const prev = this.micSelect.value;
			this.micSelect.empty();

			if (mics.length === 0) {
				this.micSelect.createEl("option", { text: "No microphones found", value: "" });
				return;
			}

			for (const mic of mics) {
				const label = mic.label || `Microphone ${this.micSelect.options.length + 1}`;
				this.micSelect.createEl("option", { text: label, value: mic.deviceId });
			}

			// Restore previous selection if it still exists
			if (prev && [...this.micSelect.options].some((o) => o.value === prev)) {
				this.micSelect.value = prev;
			}
		} catch {
			// Permission not yet granted — labels will be empty; populate again after first record
		}
	}

	private async startRecording() {
		try {
			const deviceId = this.micSelect.value;
			const audioConstraints: MediaTrackConstraints = deviceId
				? { deviceId: { exact: deviceId } }
				: true as unknown as MediaTrackConstraints;
			const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });

			// After first permission grant, labels become available — refresh list
			this.populateMicList();
			this.mediaRecorder = new MediaRecorder(stream);
			this.audioChunks = [];
			this.finalTranscript = "";
			this.seconds = 0;
			this.errorEl.style.display = "none";
			this.savedVaultPath = null;

			// Clear transcript display
			this.transcriptFinalSpan.textContent = "";
			this.transcriptFinalSpan.removeClass("nr-placeholder");
			this.transcriptInterimSpan.textContent = "";

			this.mediaRecorder.ondataavailable = (e) => {
				if (e.data.size > 0) this.audioChunks.push(e.data);
			};
			this.mediaRecorder.start();
			this.isRecording = true;

			this.recordBtn.addClass("nr-recording");
			this.recordBtn.innerHTML = '<span class="nr-dot"></span> Stop Recording';
			this.timerEl.style.display = "flex";

			this.timerInterval = window.setInterval(() => {
				this.seconds++;
				this.timerEl.setText(this.formatTime(this.seconds));
			}, 1000);

			this.startSpeechRecognition();
		} catch {
			this.showError("Microphone access denied.");
		}
	}

	private startSpeechRecognition() {
		const win = window as Window & {
			SpeechRecognition?: typeof SpeechRecognition;
			webkitSpeechRecognition?: typeof SpeechRecognition;
		};
		const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;

		if (!SR) {
			this.showError("Speech recognition not supported — transcript unavailable.");
			return;
		}

		this.recognition = new SR();
		this.recognition.continuous = true;
		this.recognition.interimResults = true;
		this.recognition.lang = "en-US";

		this.recognition.onresult = (e: SpeechRecognitionEvent) => {
			let interim = "";
			for (let i = e.resultIndex; i < e.results.length; i++) {
				if (e.results[i].isFinal) {
					this.finalTranscript += e.results[i][0].transcript + " ";
				} else {
					interim += e.results[i][0].transcript;
				}
			}
			// Direct textContent assignment — no DOM rebuild, always reliable
			this.transcriptFinalSpan.textContent = this.finalTranscript;
			this.transcriptInterimSpan.textContent = interim;
			this.transcriptEl.scrollTop = this.transcriptEl.scrollHeight;
		};

		this.recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
			// network errors are non-fatal (often a brief dropout); others are real failures
			if (e.error !== "network") {
				this.showError(`Speech recognition error: ${e.error}`);
			}
		};

		this.recognition.onend = () => {
			// Auto-restart while still recording (recognition stops after ~60s of silence)
			if (this.isRecording) this.recognition?.start();
		};

		this.recognition.start();
	}

	private async stopRecording() {
		// Mark stopped first so onend doesn't restart recognition
		this.isRecording = false;

		this.recognition?.stop();
		this.recognition = null;

		if (this.mediaRecorder) {
			this.mediaRecorder.stop();
			this.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
		}
		if (this.timerInterval !== null) {
			window.clearInterval(this.timerInterval);
			this.timerInterval = null;
		}

		this.recordBtn.removeClass("nr-recording");
		this.recordBtn.innerHTML = '<span class="nr-dot"></span> Start Recording';
		this.timerEl.style.display = "none";

		// Commit any remaining interim text as final
		if (this.transcriptInterimSpan.textContent) {
			this.finalTranscript += this.transcriptInterimSpan.textContent + " ";
			this.transcriptFinalSpan.textContent = this.finalTranscript;
			this.transcriptInterimSpan.textContent = "";
		}

		if (this.finalTranscript.trim()) {
			this.saveBtn.disabled = false;
		}
	}

	private async saveToVault() {
		const now = new Date();
		const dateStr = now.toISOString().split("T")[0];
		const timeStr = now.toTimeString().slice(0, 5).replace(":", "-");
		const folder = this.plugin.settings.saveFolder.trim().replace(/\/$/, "");

		if (!this.savedVaultPath) {
			const baseName = `Lecture Notes ${dateStr} ${timeStr}`;
			this.savedVaultPath = folder ? `${folder}/${baseName}.md` : `${baseName}.md`;
		}

		const content = [
			`# ${this.savedVaultPath.split("/").pop()?.replace(".md", "") ?? "Lecture Notes"}`,
			`*Recorded: ${now.toLocaleString()}*`,
			"",
			"## Transcript",
			"",
			this.finalTranscript.trim() || "*No transcript available.*",
			"",
			"---",
			"",
			"## My Notes",
			"",
			this.cmEditor.state.doc.toString(),
		].join("\n");

		try {
			if (folder && !(await this.app.vault.adapter.exists(folder))) {
				await this.app.vault.createFolder(folder);
			}

			const exists = await this.app.vault.adapter.exists(this.savedVaultPath);
			if (exists) {
				const file = this.app.vault.getAbstractFileByPath(this.savedVaultPath);
				if (file && "extension" in file) {
					await this.app.vault.modify(
						file as Parameters<typeof this.app.vault.modify>[0],
						content
					);
					new Notice(`Updated: ${this.savedVaultPath}`);
				}
			} else {
				await this.app.vault.create(this.savedVaultPath, content);
				new Notice(`Saved: ${this.savedVaultPath}`);
			}

			this.saveBtn.setText("Update in Vault");
		} catch (e) {
			new Notice(`Failed to save: ${(e as Error).message}`);
		}
	}

	private updateWordCount() {
		const text = this.cmEditor.state.doc.toString().trim();
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
