import { ItemView, MarkdownRenderer, Modal, Notice, WorkspaceLeaf } from "obsidian";
import { EditorView, keymap, drawSelection, placeholder, Decoration, DecorationSet } from "@codemirror/view";
import { EditorState, StateEffect, StateField, RangeSetBuilder } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, indentOnInput } from "@codemirror/language";
import type NoteRealPlugin from "./main";
import { transcribeAudio, generateNotes, generateFeedback, generateNextHint, FeedbackItem } from "./gemini";
import { TEST_MODE, SAMPLE_TRANSCRIPT, SAMPLE_AI_NOTES } from "./sample-data";

export const RECORDER_VIEW_TYPE = "notereal-recorder";

// ── CodeMirror highlight decoration ──────────────────────────────────────────

const setHighlights = StateEffect.define<Array<{ from: number; to: number; id: string; type: string }>>();

const highlightField = StateField.define<DecorationSet>({
	create() { return Decoration.none; },
	update(deco, tr) {
		deco = deco.map(tr.changes);
		for (const effect of tr.effects) {
			if (effect.is(setHighlights)) {
				const sorted = [...effect.value].sort((a, b) => a.from - b.from);
				const builder = new RangeSetBuilder<Decoration>();
				for (const { from, to, id, type } of sorted) {
					builder.add(from, to, Decoration.mark({ class: `nr-highlight nr-hl-${id} nr-hl-type-${type}` }));
				}
				deco = builder.finish();
			}
		}
		return deco;
	},
	provide: (f) => EditorView.decorations.from(f),
});

// ── Feedback popup modal ──────────────────────────────────────────────────────

class FeedbackModal extends Modal {
	private item: FeedbackItem;
	private apiKey: string;

	constructor(app: Parameters<typeof Modal.prototype.constructor>[0], item: FeedbackItem, apiKey: string) {
		super(app);
		this.item = item;
		this.apiKey = apiKey;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("nr-feedback-modal");

		const typeLabel: Record<string, string> = {
			missing: "Missing content",
			incorrect: "Incorrect",
			incomplete: "Incomplete",
			verbose: "Too verbose",
		};

		contentEl.createEl("span", {
			text: typeLabel[this.item.type] ?? this.item.type,
			cls: `nr-type-badge nr-type-${this.item.type}`,
		});

		if (this.item.studentText) {
			contentEl.createDiv("nr-feedback-quote").createEl("p", {
				text: `"${this.item.studentText}"`,
			});
		}

		contentEl.createEl("p", { text: this.item.question, cls: "nr-feedback-question" });

		const hintsContainer = contentEl.createDiv("nr-hints-container");
		const shownHints: string[] = [];

		const hintBtn = contentEl.createEl("button", {
			text: "I'm stuck — give me a hint",
			cls: "nr-hint-btn",
		});

		const giveUpBtn = contentEl.createEl("button", {
			text: "I give up — just tell me",
			cls: "nr-giveup-btn",
		});
		const answerEl = contentEl.createDiv("nr-answer");
		answerEl.setText(this.item.answer ?? "");
		answerEl.style.display = "none";

		const addHint = (text: string) => {
			const n = shownHints.length;
			shownHints.push(text);

			const hintEl = hintsContainer.createDiv("nr-hint");
			const headerEl = hintEl.createDiv("nr-hint-header");
			headerEl.createEl("span", { text: `Hint ${n + 1}`, cls: "nr-hint-label" });
			const toggleBtn = headerEl.createEl("button", { cls: "nr-hint-toggle", attr: { "aria-label": "Toggle hint" } });
			toggleBtn.innerHTML = "▲";

			const bodyEl = hintEl.createDiv("nr-hint-body");
			bodyEl.createEl("p", { text });

			let expanded = true;
			toggleBtn.addEventListener("click", () => {
				expanded = !expanded;
				bodyEl.style.display = expanded ? "block" : "none";
				toggleBtn.innerHTML = expanded ? "▲" : "▼";
			});

			hintBtn.setText("Give me another hint");
		};

		hintBtn.addEventListener("click", async () => {
			hintBtn.disabled = true;
			hintBtn.setText("Thinking…");

			// Use pre-generated hints first, then fetch more on demand
			const pregenerated = this.item.hints ?? [];
			if (shownHints.length < pregenerated.length) {
				addHint(pregenerated[shownHints.length]);
				hintBtn.disabled = false;
			} else {
				try {
					const next = await generateNextHint(this.item, shownHints, this.apiKey);
					addHint(next);
				} catch {
					hintBtn.setText("Couldn't load hint — try again");
				} finally {
					hintBtn.disabled = false;
				}
			}
		});

		giveUpBtn.addEventListener("click", () => {
			answerEl.style.display = "block";
			giveUpBtn.style.display = "none";
			hintBtn.style.display = "none";
		});
	}

	onClose() {
		this.contentEl.empty();
	}
}

// ── Editor theme ──────────────────────────────────────────────────────────────

const obsidianEditorTheme = EditorView.theme({
	"&": { height: "100%", backgroundColor: "transparent", color: "var(--text-normal)", fontSize: "var(--font-text-size)", fontFamily: "var(--font-text)" },
	"&.cm-focused": { outline: "none" },
	".cm-scroller": { fontFamily: "inherit", lineHeight: "var(--line-height-normal, 1.6)", overflow: "auto" },
	".cm-content": { padding: "2px 0", caretColor: "var(--caret-color, var(--text-normal))", minHeight: "100%" },
	".cm-line": { padding: "0" },
	".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--text-accent, var(--text-normal))" },
	"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { background: "var(--text-selection) !important" },
	".cm-activeLine": { backgroundColor: "transparent" },
	".cm-placeholder": { color: "var(--text-faint)", fontStyle: "italic" },
});

// ── View ──────────────────────────────────────────────────────────────────────

export class RecorderView extends ItemView {
	plugin: NoteRealPlugin;

	private mediaRecorder: MediaRecorder | null = null;
	private audioChunks: Blob[] = [];
	private transcript = "";
	private generatedMarkdown = "";
	private feedbackItems: FeedbackItem[] = [];
	private timerInterval: number | null = null;
	private seconds = 0;
	private isRecording = false;
	private savedVaultPath: string | null = null;

	private recordBtn!: HTMLButtonElement;
	private micSelect!: HTMLSelectElement;
	private timerEl!: HTMLElement;
	private errorEl!: HTMLElement;
	private transcriptEl!: HTMLElement;
	private audioPlaybackEl!: HTMLElement;
	private aiNotesEl!: HTMLElement;
	private aiNotesStatusEl!: HTMLElement;
	private cmEditor!: EditorView;
	private wordCountEl!: HTMLElement;
	private saveBtn!: HTMLButtonElement;
	private feedbackBtn!: HTMLButtonElement;

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

		// Record bar (always visible)
		const recBar = container.createDiv("nr-rec-bar");
		this.recordBtn = recBar.createEl("button", { cls: "nr-record-btn" });
		this.recordBtn.innerHTML = '<span class="nr-dot"></span> Start Recording';
		this.recordBtn.addEventListener("click", () => this.toggleRecording());

		this.micSelect = recBar.createEl("select", { cls: "nr-mic-select" });
		this.micSelect.title = "Select microphone";
		this.populateMicList();
		navigator.mediaDevices.addEventListener("devicechange", () => this.populateMicList());

		this.timerEl = recBar.createDiv("nr-timer");
		this.timerEl.style.display = "none";

		// Error bar
		this.errorEl = container.createDiv("nr-error");
		this.errorEl.style.display = "none";

		// Tab bar (Record + Review only)
		const tabBar = container.createDiv("nr-tab-bar");
		const recordTab = tabBar.createEl("button", { text: "Record", cls: "nr-tab nr-tab-active" });
		const reviewTab = tabBar.createEl("button", { text: "Review", cls: "nr-tab" });

		// ── Record pane ───────────────────────────────────────────────
		const recordPane = container.createDiv("nr-pane nr-pane-active");
		recordPane.createEl("h3", { text: "Your Notes", cls: "nr-panel-title nr-pane-title" });

		const editorEl = recordPane.createDiv("nr-cm-editor");
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
					highlightField,
					EditorView.updateListener.of((update) => {
						if (update.docChanged) this.updateWordCount();
					}),
				],
			}),
			parent: editorEl,
		});

		// Click highlighted text → open feedback popup for that item
		this.cmEditor.dom.addEventListener("mousedown", (e) => {
			const target = e.target as HTMLElement;
			const hl = target.closest('[class*="nr-hl-f"]') as HTMLElement | null;
			if (!hl) return;
			const cls = [...hl.classList].find((c) => c.startsWith("nr-hl-f"));
			if (cls) this.openFeedbackPopup(cls.replace("nr-hl-", ""));
		});

		this.wordCountEl = recordPane.createDiv("nr-wordcount");
		this.wordCountEl.setText("0 words");

		// ── Review pane ───────────────────────────────────────────────
		const reviewPane = container.createDiv("nr-pane");
		const reviewPanels = reviewPane.createDiv("nr-panels");

		const transcriptPanel = reviewPanels.createDiv("nr-panel");
		transcriptPanel.createEl("h3", { text: "Transcript", cls: "nr-panel-title" });
		this.transcriptEl = transcriptPanel.createDiv("nr-transcript");
		this.transcriptEl.createEl("p", { text: "Transcript will appear here after recording stops.", cls: "nr-placeholder" });
		this.audioPlaybackEl = transcriptPanel.createDiv("nr-audio-playback");
		this.audioPlaybackEl.style.display = "none";

		const aiPanel = reviewPanels.createDiv("nr-panel");
		aiPanel.createEl("h3", { text: "Lecture Notes", cls: "nr-panel-title" });
		this.aiNotesStatusEl = aiPanel.createDiv("nr-ai-status");
		this.aiNotesEl = aiPanel.createDiv("nr-ai-notes");
		this.aiNotesEl.createEl("p", { text: "AI-generated notes will appear here after recording stops.", cls: "nr-placeholder" });

		// Tab switching
		const panes = [recordPane, reviewPane];
		const tabs = [recordTab, reviewTab];
		const switchTab = (idx: number) => {
			tabs.forEach((t, i) => t.toggleClass("nr-tab-active", i === idx));
			panes.forEach((p, i) => p.toggleClass("nr-pane-active", i === idx));
		};
		tabs.forEach((tab, i) => tab.addEventListener("click", () => switchTab(i)));

		// Footer
		const footer = container.createDiv("nr-footer");
		this.saveBtn = footer.createEl("button", { text: "Save to Vault", cls: "nr-save-btn" });
		this.saveBtn.disabled = true;
		this.saveBtn.addEventListener("click", () => this.saveToVault());

		this.feedbackBtn = footer.createEl("button", { text: "Get Feedback", cls: "nr-feedback-btn" });
		this.feedbackBtn.disabled = true;
		this.feedbackBtn.addEventListener("click", () => this.runFeedback());
	}

	async onClose() {
		if (this.isRecording) await this.stopRecording();
		this.cmEditor?.destroy();
	}

	private async toggleRecording() {
		this.isRecording ? await this.stopRecording() : await this.startRecording();
	}

	private async populateMicList() {
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
			if (prev && [...this.micSelect.options].some((o) => o.value === prev)) {
				this.micSelect.value = prev;
			}
		} catch { /* permission not yet granted */ }
	}

	private async startRecording() {
		try {
			const deviceId = this.micSelect.value;
			const audioConstraints: MediaTrackConstraints = deviceId
				? { deviceId: { exact: deviceId } }
				: true as unknown as MediaTrackConstraints;
			const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });

			this.populateMicList();
			this.mediaRecorder = new MediaRecorder(stream);
			this.audioChunks = [];
			this.transcript = "";
			this.generatedMarkdown = "";
			this.seconds = 0;
			this.errorEl.style.display = "none";
			this.savedVaultPath = null;
			this.audioPlaybackEl.style.display = "none";
			this.transcriptEl.empty();
			this.transcriptEl.createEl("p", { text: "Recording… transcript will appear when done.", cls: "nr-placeholder" });
			this.aiNotesEl.empty();
			this.aiNotesEl.createEl("p", { text: "AI-generated notes will appear here after recording stops.", cls: "nr-placeholder" });
			this.aiNotesStatusEl.empty();
			this.saveBtn.disabled = true;
			this.feedbackBtn.disabled = true;
			this.feedbackBtn.setText("Get Feedback");
			this.feedbackBtn.onclick = () => this.runFeedback();
			this.clearHighlights();

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
		} catch {
			this.showError("Microphone access denied.");
		}
	}

	private async stopRecording() {
		this.isRecording = false;
		if (this.mediaRecorder) {
			this.mediaRecorder.onstop = () => this.processRecording();
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
	}

	private async processRecording() {
		const blob = new Blob(this.audioChunks, { type: "audio/webm" });

		// Playback
		const url = URL.createObjectURL(blob);
		this.audioPlaybackEl.empty();
		this.audioPlaybackEl.createEl("p", { text: "Temp Playback", cls: "nr-playback-label" });
		const audio = this.audioPlaybackEl.createEl("audio");
		audio.src = url;
		audio.controls = true;
		this.audioPlaybackEl.style.display = "block";

		// [TEST MODE] — set TEST_MODE=false in sample-data.ts to use real Groq API
		if (TEST_MODE) {
			this.transcript = SAMPLE_TRANSCRIPT;
			this.generatedMarkdown = SAMPLE_AI_NOTES;
			this.transcriptEl.setText(this.transcript);
			await MarkdownRenderer.render(this.app, this.generatedMarkdown, this.aiNotesEl, "", this);
			this.saveBtn.disabled = false;
			this.feedbackBtn.disabled = false;
			return;
		}
		// [/TEST MODE]

		const apiKey = this.plugin.settings.groqApiKey;
		if (!apiKey) {
			this.showError("No Groq API key. Add it in Settings → NoteReal.");
			return;
		}

		// Transcribe
		this.aiNotesStatusEl.setText("Transcribing…");
		this.transcriptEl.empty();
		try {
			this.transcript = await transcribeAudio(blob, apiKey);
			this.transcriptEl.setText(this.transcript);
		} catch (e) {
			this.showError(`Transcription failed: ${(e as Error).message}`);
			this.aiNotesStatusEl.empty();
			return;
		}

		// Generate notes
		this.aiNotesStatusEl.innerHTML = '<span class="nr-spinner"></span> Generating notes…';
		this.aiNotesEl.empty();
		try {
			this.generatedMarkdown = await generateNotes(this.transcript, apiKey);
			this.aiNotesStatusEl.empty();
			await MarkdownRenderer.render(this.app, this.generatedMarkdown, this.aiNotesEl, "", this);
			this.saveBtn.disabled = false;
			this.feedbackBtn.disabled = false;
		} catch (e) {
			this.showError(`Note generation failed: ${(e as Error).message}`);
			this.aiNotesStatusEl.empty();
		}
	}

	// ── Feedback ──────────────────────────────────────────────────────────────

	private async runFeedback() {
		const studentNotes = this.cmEditor.state.doc.toString().trim();
		if (!studentNotes) {
			this.showError("Write some notes first before getting feedback.");
			return;
		}
		if (!this.generatedMarkdown) {
			this.showError("No AI notes yet — record a lecture first.");
			return;
		}

		const apiKey = this.plugin.settings.groqApiKey;
		if (!apiKey) {
			this.showError("No Groq API key. Add it in Settings → NoteReal.");
			return;
		}

		this.feedbackBtn.disabled = true;
		this.feedbackBtn.setText("Analyzing…");
		this.clearHighlights();

		try {
			const raw = await generateFeedback(studentNotes, this.generatedMarkdown, apiKey);

			this.feedbackItems = raw.map((item, i) => {
				const id = `f${i}`;
				let from = 0, to = 0;
				if (item.studentText) {
					const idx = studentNotes.indexOf(item.studentText);
					if (idx !== -1) { from = idx; to = idx + item.studentText.length; }
				}
				return { ...item, id, from, to };
			});

			this.applyHighlights();
			const count = this.feedbackItems.filter(f => f.from < f.to).length;
			new Notice(`${count} issue${count !== 1 ? "s" : ""} highlighted — click any underlined text to see feedback.`);
		} catch (e) {
			this.showError(`Feedback failed: ${(e as Error).message}`);
		} finally {
			this.feedbackBtn.disabled = false;
			this.feedbackBtn.setText("Save & Re-check");
			this.feedbackBtn.onclick = async () => {
				await this.saveToVault();
				this.feedbackBtn.onclick = () => this.runFeedback();
				await this.runFeedback();
			};
		}
	}

	private openFeedbackPopup(id: string) {
		const item = this.feedbackItems.find((f) => f.id === id);
		if (!item) return;
		new FeedbackModal(this.app, item, this.plugin.settings.groqApiKey).open();
	}

	private applyHighlights() {
		const highlights = this.feedbackItems
			.filter((item) => item.from < item.to)
			.map(({ from, to, id, type }) => ({ from, to, id, type }));
		this.cmEditor.dispatch({ effects: setHighlights.of(highlights) });
	}

	private clearHighlights() {
		this.cmEditor.dispatch({ effects: setHighlights.of([]) });
	}

	// ── Save ──────────────────────────────────────────────────────────────────

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
			"## AI Generated Notes",
			"",
			this.generatedMarkdown.trim() || "*No notes generated.*",
			"",
			"---",
			"",
			"## Transcript",
			"",
			this.transcript.trim() || "*No transcript available.*",
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
					await this.app.vault.modify(file as Parameters<typeof this.app.vault.modify>[0], content);
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

	// ── Helpers ───────────────────────────────────────────────────────────────

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
