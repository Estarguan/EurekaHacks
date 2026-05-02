import { ItemView, MarkdownRenderer, Modal, Notice, WorkspaceLeaf } from "obsidian";
import { EditorView, keymap, drawSelection, placeholder, Decoration, DecorationSet } from "@codemirror/view";
import { EditorState, StateEffect, StateField, RangeSetBuilder } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { bracketMatching, indentOnInput, syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { tags } from "@lezer/highlight";
import type DidYouEvenListenPlugin from "./main";
import { transcribeAudio, generateNotes, generateFeedback, filterResolvedFeedback, generateNextHint, generateQuizQuestions, evaluateAnswer, groupFeedbackIntoSections, generateComparisonFeedback, FeedbackItem, QuizQuestion, MetacognitionSection } from "./gemini";
import { TEST_MODE, SAMPLE_TRANSCRIPT, SAMPLE_AI_NOTES } from "./sample-data";

export const RECORDER_VIEW_TYPE = "didyouevenlisten-recorder";

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
	private onGiveUp?: () => void;
	private didGiveUp = false;

	constructor(app: Parameters<typeof Modal.prototype.constructor>[0], item: FeedbackItem, apiKey: string, onGiveUp?: () => void) {
		super(app);
		this.item = item;
		this.apiKey = apiKey;
		this.onGiveUp = onGiveUp;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("nr-feedback-modal");

		const typeLabel: Record<string, string> = {
			incomplete: "Expand this",
			missing:    "Add this concept",
			incorrect:  "Incorrect",
			verbose:    "Too verbose — shorten",
			unclear:    "Rewrite more clearly",
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
			this.didGiveUp = true;
		});
	}

	onClose() {
		this.contentEl.empty();
		if (this.didGiveUp) this.onGiveUp?.();
	}
}

// ── Markdown highlight style ──────────────────────────────────────────────────

const markdownHighlight = HighlightStyle.define([
	{ tag: tags.heading1,              class: "cm-md-h1"     },
	{ tag: tags.heading2,              class: "cm-md-h2"     },
	{ tag: tags.heading3,              class: "cm-md-h3"     },
	{ tag: tags.heading4,              class: "cm-md-h4"     },
	{ tag: tags.strong,                class: "cm-md-strong" },
	{ tag: tags.emphasis,              class: "cm-md-em"     },
	{ tag: tags.strikethrough,         class: "cm-md-strike" },
	{ tag: tags.monospace,             class: "cm-md-code"   },
	{ tag: tags.link,                  class: "cm-md-link"   },
	{ tag: tags.url,                   class: "cm-md-url"    },
	{ tag: tags.quote,                 class: "cm-md-quote"  },
	{ tag: tags.list,                  class: "cm-md-list"   },
	{ tag: tags.meta,                  class: "cm-md-meta"   },
	{ tag: tags.processingInstruction, class: "cm-md-marker" },
	{ tag: tags.contentSeparator,      class: "cm-md-hr"     },
]);

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
	plugin: DidYouEvenListenPlugin;

	private mediaRecorder: MediaRecorder | null = null;
	private audioChunks: Blob[] = [];
	private transcript = "";
	private generatedMarkdown = "";
	private feedbackItems: FeedbackItem[] = [];
	private quizQuestions: QuizQuestion[] = [];
	private timerInterval: number | null = null;
	private seconds = 0;
	private isRecording = false;
	private savedVaultPath: string | null = null;

	// Metacognition state
	private mode: "normal" | "metacognition" = "normal";
	private metacogSections: MetacognitionSection[] = [];
	private metacogUserScores: number[] = [];
	private metacogGivenUpSections: Set<number> = new Set();

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
	private metacogBtn!: HTMLButtonElement;
	private quizQuestionsEl!: HTMLElement;
	private quizStatusEl!: HTMLElement;
	private newQuestionsBtn!: HTMLButtonElement;

	// Metacognition sidebar
	private sidebarEl!: HTMLElement;
	private sidebarBodyEl!: HTMLElement;
	private sidebarTitleEl!: HTMLElement;

	// Brain state
	private brainScore = 0;
	private headerBrainEl!: HTMLImageElement;

	// Hover tooltip
	private tooltipEl!: HTMLElement;

	// Snapshot of notes at last feedback run — used to gate the Re-check button
	private prevStudentNotes = "";
	// Canonical issue set from the first feedback run; rechecks can only shrink it
	private initialFeedbackItems: FeedbackItem[] = [];

	constructor(leaf: WorkspaceLeaf, plugin: DidYouEvenListenPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() { return RECORDER_VIEW_TYPE; }
	getDisplayText() { return "Did You Even Listen"; }
	getIcon() { return "mic"; }

	async onOpen() {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass("nr-container");

		this.tooltipEl = container.createDiv("nr-hover-tooltip");

		// Splash screen
		const splash = container.createDiv("nr-splash");
		const brainSrc = this.app.vault.adapter.getResourcePath(
			`${this.plugin.manifest.dir}/assets/neutralBrain.png`
		);
		splash.createEl("img", { cls: "nr-splash-brain", attr: { src: brainSrc, draggable: "false" } });
		splash.createEl("span", { text: "click to begin", cls: "nr-splash-prompt" });
		splash.addEventListener("click", () => {
			splash.addClass("nr-splash-exit");
			splash.addEventListener("transitionend", () => splash.remove(), { once: true });
			setTimeout(() => main.removeClass("nr-main-hidden"), 100);
		});

		const main = container.createDiv("nr-main nr-main-hidden");

		// Header
		const header = main.createDiv("nr-header");
		const headerBrainSrc = this.app.vault.adapter.getResourcePath(
			`${this.plugin.manifest.dir}/assets/neutralBrain.png`
		);
		this.headerBrainEl = header.createEl("img", { cls: "nr-header-brain", attr: { src: headerBrainSrc, draggable: "false" } }) as HTMLImageElement;
		const titleRow = header.createDiv("nr-title-row");
		titleRow.createEl("span", { text: "Did You Even Listen", cls: "nr-title" });
		header.createEl("p", { text: "Sometimes to take two steps forward you need to take one step back.", cls: "nr-slogan" });

		// Record bar
		const recBar = main.createDiv("nr-rec-bar");
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
		this.errorEl = main.createDiv("nr-error");
		this.errorEl.style.display = "none";

		// Tab bar
		const tabBar = main.createDiv("nr-tab-bar");
		const recordTab = tabBar.createEl("button", { text: "Record", cls: "nr-tab nr-tab-active" });
		const reviewTab = tabBar.createEl("button", { text: "Review", cls: "nr-tab" });
		const quizTab   = tabBar.createEl("button", { text: "Quiz",   cls: "nr-tab" });

		// ── Pane slider ───────────────────────────────────────────────
		const paneTrack = main.createDiv("nr-pane-track");
		const paneSlider = paneTrack.createDiv("nr-pane-slider");

		// ── Record pane ───────────────────────────────────────────────
		const recordPane = paneSlider.createDiv("nr-pane");
		const recordMain = recordPane.createDiv("nr-record-main");

		const editorArea = recordMain.createDiv("nr-editor-area");
		editorArea.createEl("h3", { text: "Your Notes", cls: "nr-panel-title" });

		const editorEl = editorArea.createDiv("nr-cm-editor");
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
					markdown(),
					syntaxHighlighting(markdownHighlight),
					obsidianEditorTheme,
					highlightField,
					EditorView.updateListener.of((update) => {
						if (update.docChanged) {
							this.updateWordCount();
							this.updateRecheckButtonState();
						}
					}),
				],
			}),
			parent: editorEl,
		});

		// Click highlighted text → open feedback popup
		this.cmEditor.dom.addEventListener("mousedown", (e) => {
			const target = e.target as HTMLElement;
			const hl = target.closest('[class*="nr-hl-f"]') as HTMLElement | null;
			if (!hl) return;
			const cls = [...hl.classList].find((c) => c.startsWith("nr-hl-f"));
			if (cls) this.openFeedbackPopup(cls.replace("nr-hl-", ""));
		});

		// Hover highlight → show tooltip card
		const typeLabel: Record<string, string> = {
			incomplete: "Expand this",
			missing:    "Add this concept",
			incorrect:  "Incorrect",
			verbose:    "Too verbose — shorten",
			unclear:    "Rewrite clearly",
		};

		this.cmEditor.dom.addEventListener("mouseover", (e) => {
			const target = e.target as HTMLElement;
			const hl = target.closest('[class*="nr-hl-f"]') as HTMLElement | null;
			if (!hl) { this.tooltipEl.style.display = "none"; return; }
			const cls = [...hl.classList].find(c => c.startsWith("nr-hl-f"));
			if (!cls) return;
			const item = this.feedbackItems.find(f => f.id === cls.replace("nr-hl-", ""));
			if (!item) return;

			this.tooltipEl.empty();
			this.tooltipEl.createEl("span", {
				text: typeLabel[item.type] ?? item.type,
				cls: `nr-tooltip-badge nr-type-${item.type}`,
			});
			this.tooltipEl.createEl("p", { text: item.question, cls: "nr-tooltip-question" });

			// Measure before positioning
			this.tooltipEl.style.visibility = "hidden";
			this.tooltipEl.style.display = "block";

			const rect  = hl.getBoundingClientRect();
			const cRect = container.getBoundingClientRect();
			const tw = this.tooltipEl.offsetWidth;
			const th = this.tooltipEl.offsetHeight;

			let top  = rect.top  - cRect.top  - th - 8;
			let left = rect.left - cRect.left;

			if (top < 0) top = rect.bottom - cRect.top + 8;
			left = Math.min(Math.max(4, left), cRect.width - tw - 4);

			this.tooltipEl.style.top  = `${top}px`;
			this.tooltipEl.style.left = `${left}px`;
			this.tooltipEl.style.visibility = "visible";
		});

		this.cmEditor.dom.addEventListener("mouseleave", () => {
			this.tooltipEl.style.display = "none";
		});

		this.wordCountEl = editorArea.createDiv("nr-wordcount");
		this.wordCountEl.setText("0 words");

		const legend = editorArea.createDiv("nr-legend");
		legend.style.display = "none";
		legend.id = "nr-legend";
		const legendItems: [string, string][] = [
			["expand",    "Expand"],
			["missing",   "Add concept"],
			["incorrect", "Incorrect"],
			["shorten",   "Too verbose"],
			["unclear",   "Rewrite clearly"],
		];
		for (const [cls, label] of legendItems) {
			const item = legend.createDiv("nr-legend-item");
			item.createEl("span", { cls: `nr-legend-dot nr-legend-${cls}` });
			item.createEl("span", { text: label, cls: "nr-legend-label" });
		}

		// Metacognition sidebar (hidden until mode is active)
		this.sidebarEl = recordMain.createDiv("nr-sidebar");
		this.sidebarEl.style.display = "none";

		const sidebarHeader = this.sidebarEl.createDiv("nr-sidebar-header");
		this.sidebarTitleEl = sidebarHeader.createEl("span", { cls: "nr-sidebar-title" });
		const closeBtn = sidebarHeader.createEl("button", { cls: "nr-sidebar-close", attr: { "aria-label": "Close" } });
		closeBtn.setText("✕");
		closeBtn.addEventListener("click", () => this.closeSidebar());

		this.sidebarBodyEl = this.sidebarEl.createDiv("nr-sidebar-body");

		// ── Review pane ───────────────────────────────────────────────
		const reviewPane = paneSlider.createDiv("nr-pane");
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

		// ── Quiz pane ─────────────────────────────────────────────────
		const quizPane = paneSlider.createDiv("nr-pane");
		const quizHeader = quizPane.createDiv("nr-quiz-header");
		quizHeader.createEl("h3", { text: "Quiz Yourself", cls: "nr-panel-title" });
		this.newQuestionsBtn = quizHeader.createEl("button", { text: "↻ New Questions", cls: "nr-new-questions-btn" });
		this.newQuestionsBtn.style.display = "none";
		this.newQuestionsBtn.addEventListener("click", () => this.generateQuestions());

		this.quizStatusEl = quizPane.createDiv("nr-quiz-status");
		this.quizStatusEl.createEl("p", { text: "Record a lecture first, then come back here to quiz yourself.", cls: "nr-placeholder" });

		this.quizQuestionsEl = quizPane.createDiv("nr-quiz-questions");

		// Tab switching
		const tabs = [recordTab, reviewTab, quizTab];
		tabs.forEach((tab, i) => tab.addEventListener("click", () => {
			tabs.forEach((t, j) => t.toggleClass("nr-tab-active", j === i));
			paneSlider.style.transform = `translateX(-${i * (100 / 3)}%)`;
			if (i === 2 && this.transcript && this.quizQuestions.length === 0) this.generateQuestions();
		}));

		// Footer
		const footer = main.createDiv("nr-footer");
		this.saveBtn = footer.createEl("button", { text: "Save to Vault", cls: "nr-save-btn" });
		this.saveBtn.disabled = true;
		this.saveBtn.addEventListener("click", () => this.saveToVault());

		this.feedbackBtn = footer.createEl("button", { text: "Get Feedback", cls: "nr-feedback-btn" });
		this.feedbackBtn.disabled = true;
		this.feedbackBtn.addEventListener("click", () => this.runFeedback());

		this.metacogBtn = footer.createEl("button", { text: "🧠 Metacognition", cls: "nr-metacog-btn" });
		this.metacogBtn.disabled = true;
		this.metacogBtn.addEventListener("click", () => {
			if (this.mode === "metacognition") this.closeSidebar();
			else this.openMetacognitionMode();
		});
	}

	async onClose() {
		if (this.isRecording) await this.stopRecording();
		this.cmEditor?.destroy();
	}

	// ── Feedback (popup) ──────────────────────────────────────────────────────

	private async runFeedback() {
		const studentNotes = this.cmEditor.state.doc.toString().trim();
		if (!studentNotes) { this.showError("Write some notes first before getting feedback."); return; }
		if (!this.generatedMarkdown) { this.showError("No AI notes yet — record a lecture first."); return; }
		const apiKey = this.plugin.settings.groqApiKey;
		if (!apiKey) { this.showError("No Groq API key. Add it in Settings → Did You Even Listen."); return; }

		const prevCount = this.feedbackItems.length;
		const isRecheck = this.initialFeedbackItems.length > 0;
		this.feedbackBtn.disabled = true;
		this.feedbackBtn.setText("Analyzing…");
		this.clearHighlights();
		this.metacogSections = [];
		this.metacogGivenUpSections = new Set();

		let succeeded = false;
		try {
			if (isRecheck) {
				// Never introduce new issues — only determine which original ones are still unresolved
				const unresolvedIds = await filterResolvedFeedback(this.initialFeedbackItems, studentNotes, apiKey);
				const unresolvedSet = new Set(unresolvedIds);
				this.feedbackItems = this.initialFeedbackItems
					.filter(item => unresolvedSet.has(item.id))
					.map(item => {
						let from = 0, to = 0;
						if (item.studentText) {
							const idx = studentNotes.indexOf(item.studentText);
							if (idx !== -1) { from = idx; to = idx + item.studentText.length; }
						}
						return { ...item, from, to };
					});
			} else {
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
				// Store as the canonical set — rechecks can only remove items, never add
				this.initialFeedbackItems = [...this.feedbackItems];
			}

			this.prevStudentNotes = studentNotes;
			succeeded = true;

			this.applyHighlights();
			const count = this.feedbackItems.filter(f => f.from < f.to).length;

			if (isRecheck) {
				if (this.feedbackItems.length < prevCount) {
					this.triggerBrainEvent('success', 'Nice Change!');
				} else {
					this.triggerBrainEvent('fail', 'YOU FAILED.');
				}
			} else {
				if (count >= 5)      { this.brainScore--; this.updateBrainImage(); }
				else if (count <= 2) { this.brainScore++; this.updateBrainImage(); }
			}

			const legend = this.containerEl.querySelector("#nr-legend") as HTMLElement | null;
			if (legend) legend.style.display = "flex";

			if (this.mode === "metacognition") {
				this.sidebarBodyEl.empty();
				this.sidebarBodyEl.innerHTML = '<div class="nr-sidebar-loading"><span class="nr-spinner"></span><p>Regrouping sections…</p></div>';
				await this.loadMetacognitionSections(studentNotes, apiKey);
			}
		} catch (e) {
			this.showError(`Feedback failed: ${(e as Error).message}`);
		} finally {
			if (succeeded) {
				// Keep disabled — Re-check is only available after the student edits their notes
				this.feedbackBtn.disabled = true;
				this.feedbackBtn.setText("Re-check");
			} else {
				this.feedbackBtn.disabled = false;
				this.feedbackBtn.setText(isRecheck ? "Re-check" : "Get Feedback");
			}
		}
	}

	private updateRecheckButtonState() {
		if (this.prevStudentNotes === "") return; // no feedback run yet; button managed elsewhere
		const current = this.cmEditor.state.doc.toString().trim();
		this.feedbackBtn.disabled = !current || current === this.prevStudentNotes;
	}

	private openFeedbackPopup(id: string) {
		const item = this.feedbackItems.find((f) => f.id === id);
		if (!item) return;
		new FeedbackModal(this.app, item, this.plugin.settings.groqApiKey, () => this.triggerBrainEvent('fail')).open();
	}

	private applyHighlights() {
		const highlights = this.feedbackItems
			.filter((item) => item.from < item.to)
			.map(({ from, to, id, type }) => ({ from, to, id, type }));
		this.cmEditor.dispatch({ effects: setHighlights.of(highlights) });
	}

	private applyMetacogRevealedHighlights() {
		const revealedIds = new Set<string>();
		this.metacogSections.forEach((s, i) => {
			if (this.metacogGivenUpSections.has(i)) s.feedbackIds.forEach(id => revealedIds.add(id));
		});
		const highlights = this.feedbackItems
			.filter(item => revealedIds.has(item.id) && item.from < item.to)
			.map(({ from, to, id, type }) => ({ from, to, id, type }));
		this.cmEditor.dispatch({ effects: setHighlights.of(highlights) });
	}

	private clearHighlights() {
		this.cmEditor.dispatch({ effects: setHighlights.of([]) });
	}

	// ── Metacognition mode (sidebar) ──────────────────────────────────────────

	private async openMetacognitionMode() {
		const studentNotes = this.cmEditor.state.doc.toString().trim();
		if (!studentNotes) { this.showError("Write some notes first before doing a metacognition check."); return; }
		const apiKey = this.plugin.settings.groqApiKey;
		if (!apiKey) { this.showError("No Groq API key. Add it in Settings → Did You Even Listen."); return; }

		this.mode = "metacognition";
		this.metacogUserScores = [];
		this.metacogGivenUpSections = new Set();
		this.metacogBtn.addClass("nr-mode-active");
		this.sidebarTitleEl.setText("🧠 Metacognition");
		this.sidebarEl.style.display = "flex";
		this.sidebarBodyEl.empty();

		// Clear highlights for the self-assessment experience
		this.clearHighlights();

		// Need feedback items before we can group sections
		if (this.feedbackItems.length === 0) {
			this.sidebarBodyEl.innerHTML = '<div class="nr-sidebar-loading"><span class="nr-spinner"></span><p>Running feedback analysis…</p></div>';
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
				this.initialFeedbackItems = [...this.feedbackItems];
				this.prevStudentNotes = studentNotes;
			} catch (e) {
				this.sidebarBodyEl.empty();
				this.sidebarBodyEl.createEl("p", { text: `Analysis failed: ${(e as Error).message}`, cls: "nr-sidebar-error" });
				return;
			}
		}

		await this.loadMetacognitionSections(studentNotes, apiKey);
	}

	private async loadMetacognitionSections(studentNotes: string, apiKey: string) {
		if (this.metacogSections.length === 0) {
			this.sidebarBodyEl.empty();
			this.sidebarBodyEl.innerHTML = '<div class="nr-sidebar-loading"><span class="nr-spinner"></span><p>Identifying knowledge sections…</p></div>';
			try {
				this.metacogSections = await groupFeedbackIntoSections(
					this.feedbackItems, studentNotes, this.generatedMarkdown, apiKey
				);
			} catch (e) {
				this.sidebarBodyEl.empty();
				this.sidebarBodyEl.createEl("p", { text: `Section analysis failed: ${(e as Error).message}`, cls: "nr-sidebar-error" });
				return;
			}
		}
		this.metacogUserScores = new Array(this.metacogSections.length).fill(0);
		this.renderMetacognitionRating();
	}

	private renderMetacognitionRating() {
		this.sidebarBodyEl.empty();
		this.sidebarBodyEl.createEl("p", {
			text: "Rate how well YOU covered each topic, then compare with the AI.",
			cls: "nr-sidebar-intro",
		});

		const covered = this.metacogSections
			.map((s, i) => ({ s, i }))
			.filter(({ s }) => !!s.studentExcerpt);
		const missed = this.metacogSections
			.map((s, i) => ({ s, i }))
			.filter(({ s }) => !s.studentExcerpt);

		// Auto-score missed sections low so comparison still runs
		missed.forEach(({ i }) => { this.metacogUserScores[i] = 1; });

		covered.forEach(({ s: section, i }) => {
			const card = this.sidebarBodyEl.createDiv("nr-metacog-card");
			card.createEl("h4", { text: section.title, cls: "nr-metacog-section-title" });
			card.createEl("p", { text: `"${section.studentExcerpt}"`, cls: "nr-metacog-excerpt" });

			card.createEl("p", { text: "Your rating:", cls: "nr-metacog-rating-label" });
			const row = card.createDiv("nr-metacog-rating-row");
			for (let n = 1; n <= 10; n++) {
				const btn = row.createEl("button", { text: String(n), cls: "nr-rating-btn" });
				btn.addEventListener("click", () => {
					this.metacogUserScores[i] = n;
					row.querySelectorAll(".nr-rating-btn").forEach((b, bi) => b.toggleClass("nr-rating-selected", bi < n));
					compareBtn.disabled = covered.some(({ i: ci }) => this.metacogUserScores[ci] === 0);
				});
			}
		});

		if (missed.length > 0) {
			const missedBox = this.sidebarBodyEl.createDiv("nr-metacog-missed-box");
			missedBox.createEl("p", { text: "Topics you didn't cover — add these to your notes:", cls: "nr-metacog-missed-label" });
			const list = missedBox.createEl("ul", { cls: "nr-metacog-missed-list" });
			missed.forEach(({ s }) => list.createEl("li", { text: s.title }));
		}

		const compareBtn = this.sidebarBodyEl.createEl("button", {
			text: "Compare with AI →",
			cls: "nr-metacog-compare-btn",
		});
		compareBtn.disabled = covered.some(({ i }) => this.metacogUserScores[i] === 0);
		compareBtn.addEventListener("click", () => this.runMetacognitionComparison(compareBtn));
	}

	private async runMetacognitionComparison(compareBtn: HTMLButtonElement) {
		compareBtn.disabled = true;
		compareBtn.setText("Analyzing…");
		const apiKey = this.plugin.settings.groqApiKey;
		let feedback: string[];
		try {
			feedback = await generateComparisonFeedback(this.metacogSections, this.feedbackItems, this.metacogUserScores, apiKey);
		} catch {
			feedback = this.metacogSections.map(() => "Could not generate feedback.");
		}

		// Score self-awareness: count overconfident sections (user >> AI)
		const overconfident = this.metacogSections.filter((s, i) => (this.metacogUserScores[i] - s.aiScore) > 2).length;
		const total = this.metacogSections.length;
		if (overconfident > total / 2)           { this.brainScore--; this.updateBrainImage(); }
		else if (overconfident === 0 && total > 0) { this.brainScore++; this.updateBrainImage(); }

		this.renderMetacognitionResults(feedback);
	}

	private renderMetacognitionResults(feedback: string[]) {
		this.sidebarBodyEl.empty();

		const topRow = this.sidebarBodyEl.createDiv("nr-sidebar-summary");
		topRow.createEl("span", { text: "Self-assessment vs AI", cls: "nr-sidebar-count" });
		const recheckBtn = topRow.createEl("button", { text: "↻ Recheck", cls: "nr-sidebar-recheck-btn" });
		recheckBtn.addEventListener("click", () => this.recheckAll());

		const byId = new Map(this.feedbackItems.map(f => [f.id, f]));

		this.metacogSections.forEach((section, i) => {
			const userScore = this.metacogUserScores[i];
			const aiScore   = section.aiScore;
			const gap       = userScore - aiScore;
			const gapClass  = gap > 2 ? "nr-gap-over" : gap < -2 ? "nr-gap-under" : "nr-gap-ok";

			const card = this.sidebarBodyEl.createDiv("nr-metacog-card nr-metacog-result");
			card.createEl("h4", { text: section.title, cls: "nr-metacog-section-title" });

			const scores = card.createDiv("nr-metacog-scores");
			scores.createEl("span", { text: `You: ${userScore}/10`, cls: "nr-score-user"          });
			scores.createEl("span", { text: "·",                    cls: "nr-score-sep"            });
			scores.createEl("span", { text: `AI: ${aiScore}/10`,    cls: `nr-score-ai ${gapClass}` });

			card.createEl("p", { text: feedback[i] ?? "", cls: "nr-metacog-feedback" });

			if (section.feedbackIds.length > 0) {
				const issuesWrap = card.createDiv("nr-metacog-issues-wrap");
				issuesWrap.style.display = "none";

				const giveUpBtn = card.createEl("button", {
					text: "Give up — show issues",
					cls: "nr-giveup-btn",
				});

				giveUpBtn.addEventListener("click", () => {
					this.metacogGivenUpSections.add(i);
					giveUpBtn.style.display = "none";
					issuesWrap.style.display = "block";

					// Reveal highlights for all given-up sections
					this.applyMetacogRevealedHighlights();
					this.triggerBrainEvent('fail');

					const typeLabel: Record<string, string> = {
						incomplete: "Expand this",
						missing:    "Add this concept",
						incorrect:  "Incorrect",
						verbose:    "Too verbose",
						unclear:    "Rewrite clearly",
					};

					section.feedbackIds.forEach(id => {
						const item = byId.get(id);
						if (!item) return;
						const row = issuesWrap.createDiv("nr-metacog-issue-row");
						row.createEl("span", {
							text: typeLabel[item.type] ?? item.type,
							cls: `nr-type-badge nr-type-${item.type}`,
						});
						if (item.studentText) {
							row.createEl("span", {
								text: ` "${item.studentText.slice(0, 60)}${item.studentText.length > 60 ? "…" : ""}"`,
								cls: "nr-metacog-issue-quote",
							});
						}
					});
				});
			}
		});
	}

	private updateBrainImage() {
		const asset = this.brainScore <= -2 ? "roastedBrain.png"
		            : this.brainScore >= 2  ? "galaxyBrain.png"
		            :                         "neutralBrain.png";
		this.headerBrainEl.src = this.app.vault.adapter.getResourcePath(
			`${this.plugin.manifest.dir}/assets/${asset}`
		);
	}

	private triggerBrainEvent(type: 'fail' | 'success', message?: string) {
		const asset = type === 'fail' ? 'roastedBrain.png' : 'galaxyBrain.png';
		this.headerBrainEl.src = this.app.vault.adapter.getResourcePath(
			`${this.plugin.manifest.dir}/assets/${asset}`
		);
		this.headerBrainEl.addClass('nr-brain-pop');
		this.headerBrainEl.addEventListener('animationend', () => this.headerBrainEl.removeClass('nr-brain-pop'), { once: true });

		const container = this.containerEl.children[1] as HTMLElement;
		const overlay = container.createDiv(`nr-result-overlay nr-result-${type}`);
		const brainSrc = this.app.vault.adapter.getResourcePath(
			`${this.plugin.manifest.dir}/assets/${asset}`
		);
		overlay.createEl('img', { cls: 'nr-result-brain', attr: { src: brainSrc, draggable: 'false' } });
		overlay.createEl('p', {
			text: message ?? (type === 'fail' ? 'YOU FAILED.' : 'YOU SUCCEEDED!'),
			cls: 'nr-result-title',
		});
		overlay.createEl('p', { text: 'click to continue', cls: 'nr-result-sub' });

		requestAnimationFrame(() => overlay.addClass('nr-result-visible'));

		const dismiss = () => {
			overlay.removeClass('nr-result-visible');
			overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
		};
		overlay.addEventListener('click', dismiss);
		setTimeout(dismiss, 4000);
	}

	private async recheckAll() {
		const studentNotes = this.cmEditor.state.doc.toString().trim();
		const apiKey = this.plugin.settings.groqApiKey;
		if (!studentNotes || !apiKey) return;

		const prevCount = this.feedbackItems.length;
		this.metacogSections  = [];
		this.metacogGivenUpSections = new Set();
		this.brainScore = 0;
		this.updateBrainImage();
		this.clearHighlights();

		this.sidebarBodyEl.empty();
		this.sidebarBodyEl.innerHTML = '<div class="nr-sidebar-loading"><span class="nr-spinner"></span><p>Running feedback analysis…</p></div>';

		try {
			if (this.initialFeedbackItems.length > 0) {
				const unresolvedIds = await filterResolvedFeedback(this.initialFeedbackItems, studentNotes, apiKey);
				const unresolvedSet = new Set(unresolvedIds);
				this.feedbackItems = this.initialFeedbackItems
					.filter(item => unresolvedSet.has(item.id))
					.map(item => {
						let from = 0, to = 0;
						if (item.studentText) {
							const idx = studentNotes.indexOf(item.studentText);
							if (idx !== -1) { from = idx; to = idx + item.studentText.length; }
						}
						return { ...item, from, to };
					});
			} else {
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
				this.initialFeedbackItems = [...this.feedbackItems];
			}
			this.prevStudentNotes = studentNotes;
		} catch (e) {
			this.sidebarBodyEl.createEl("p", { text: `Recheck failed: ${(e as Error).message}`, cls: "nr-sidebar-error" });
			return;
		}

		await this.loadMetacognitionSections(studentNotes, apiKey);
		const newCount = this.feedbackItems.length;
		if (newCount < prevCount) {
			this.triggerBrainEvent('success', 'Nice Change!');
		} else {
			this.triggerBrainEvent('fail', 'YOU FAILED.');
		}
	}

	private closeSidebar() {
		this.mode = "normal";
		this.sidebarEl.style.display = "none";
		this.metacogBtn.removeClass("nr-mode-active");
		// Restore feedback highlights if available
		if (this.feedbackItems.length > 0) this.applyHighlights();
	}

	// ── Recording ─────────────────────────────────────────────────────────────

	private async toggleRecording() {
		this.isRecording ? await this.stopRecording() : await this.startRecording();
	}

	private async populateMicList() {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const mics = devices.filter((d) => d.kind === "audioinput");
			const prev = this.micSelect.value;
			this.micSelect.empty();
			if (mics.length === 0) { this.micSelect.createEl("option", { text: "No microphones found", value: "" }); return; }
			for (const mic of mics) {
				const label = mic.label || `Microphone ${this.micSelect.options.length + 1}`;
				this.micSelect.createEl("option", { text: label, value: mic.deviceId });
			}
			if (prev && [...this.micSelect.options].some((o) => o.value === prev)) this.micSelect.value = prev;
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
			this.mediaRecorder  = new MediaRecorder(stream);
			this.audioChunks    = [];
			this.transcript     = "";
			this.generatedMarkdown = "";
			this.seconds        = 0;
			this.errorEl.style.display = "none";
			this.savedVaultPath = null;
			this.audioPlaybackEl.style.display = "none";
			this.transcriptEl.empty();
			this.transcriptEl.createEl("p", { text: "Recording… transcript will appear when done.", cls: "nr-placeholder" });
			this.aiNotesEl.empty();
			this.aiNotesEl.createEl("p", { text: "AI-generated notes will appear here after recording stops.", cls: "nr-placeholder" });
			this.aiNotesStatusEl.empty();
			this.saveBtn.disabled     = true;
			this.feedbackBtn.disabled = true;
			this.feedbackBtn.setText("Get Feedback");
			this.metacogBtn.disabled  = true;
			this.clearHighlights();
			this.closeSidebar();
			this.feedbackItems        = [];
			this.initialFeedbackItems = [];
			this.prevStudentNotes     = "";
			this.metacogSections = [];
			this.metacogGivenUpSections = new Set();
			this.quizQuestions = [];
			this.quizQuestionsEl.empty();
			this.newQuestionsBtn.style.display = "none";
			this.quizStatusEl.empty();
			this.quizStatusEl.createEl("p", { text: "Record a lecture first, then come back here to quiz yourself.", cls: "nr-placeholder" });

			this.mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) this.audioChunks.push(e.data); };
			this.mediaRecorder.start();
			this.isRecording = true;
			this.recordBtn.addClass("nr-recording");
			(this.containerEl.children[1] as HTMLElement).addClass("nr-is-recording");
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
		(this.containerEl.children[1] as HTMLElement).removeClass("nr-is-recording");
		if (this.mediaRecorder) {
			this.mediaRecorder.onstop = () => this.processRecording();
			this.mediaRecorder.stop();
			this.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
		}
		if (this.timerInterval !== null) { window.clearInterval(this.timerInterval); this.timerInterval = null; }
		this.recordBtn.removeClass("nr-recording");
		this.recordBtn.innerHTML = '<span class="nr-dot"></span> Start Recording';
		this.timerEl.style.display = "none";
	}

	private async processRecording() {
		const blob = new Blob(this.audioChunks, { type: "audio/webm" });

		const url = URL.createObjectURL(blob);
		this.audioPlaybackEl.empty();
		this.audioPlaybackEl.createEl("p", { text: "Temp Playback", cls: "nr-playback-label" });
		const audio = this.audioPlaybackEl.createEl("audio");
		audio.src = url;
		audio.controls = true;
		this.audioPlaybackEl.style.display = "block";

		if (TEST_MODE) {
			this.transcript        = SAMPLE_TRANSCRIPT;
			this.generatedMarkdown = SAMPLE_AI_NOTES;
			this.transcriptEl.setText(this.transcript);
			await MarkdownRenderer.render(this.app, this.generatedMarkdown, this.aiNotesEl, "", this);
			this.saveBtn.disabled     = false;
			this.feedbackBtn.disabled = false;
			this.metacogBtn.disabled  = false;
			return;
		}

		const apiKey = this.plugin.settings.groqApiKey;
		if (!apiKey) { this.showError("No Groq API key. Add it in Settings → Did You Even Listen."); return; }

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

		this.aiNotesStatusEl.innerHTML = '<span class="nr-spinner"></span> Generating notes…';
		this.aiNotesEl.empty();
		try {
			this.generatedMarkdown = await generateNotes(this.transcript, apiKey);
			this.aiNotesStatusEl.empty();
			await MarkdownRenderer.render(this.app, this.generatedMarkdown, this.aiNotesEl, "", this);
			this.saveBtn.disabled     = false;
			this.feedbackBtn.disabled = false;
			this.metacogBtn.disabled  = false;
		} catch (e) {
			this.showError(`Note generation failed: ${(e as Error).message}`);
			this.aiNotesStatusEl.empty();
		}
	}

	// ── Quiz ──────────────────────────────────────────────────────────────────

	private async generateQuestions() {
		const apiKey = this.plugin.settings.groqApiKey;
		if (!apiKey) { this.showError("No Groq API key."); return; }

		this.quizQuestionsEl.empty();
		this.quizStatusEl.empty();
		this.quizStatusEl.innerHTML = '<span class="nr-spinner"></span> Generating questions…';
		this.newQuestionsBtn.disabled = true;
		this.newQuestionsBtn.style.display = "";

		try {
			this.quizQuestions = await generateQuizQuestions(this.transcript, this.generatedMarkdown, apiKey);
			this.quizStatusEl.empty();
			this.renderQuizQuestions();
		} catch (e) {
			this.quizStatusEl.empty();
			this.showError(`Quiz generation failed: ${(e as Error).message}`);
		} finally {
			this.newQuestionsBtn.disabled = false;
		}
	}

	private renderQuizQuestions() {
		this.quizQuestionsEl.empty();
		const sections: { type: QuizQuestion["type"]; icon: string; label: string }[] = [
			{ type: "explain", icon: "🧒", label: "Explain Simply" },
			{ type: "whatif",  icon: "🤔", label: "What If?"       },
			{ type: "quiz",    icon: "✏️", label: "Quiz"            },
		];
		for (const { type, icon, label } of sections) {
			const qs = this.quizQuestions.filter((q) => q.type === type);
			if (!qs.length) continue;
			const section = this.quizQuestionsEl.createDiv("nr-quiz-section");
			section.createEl("h4", { text: `${icon}  ${label}`, cls: "nr-quiz-section-title" });
			for (const q of qs) this.renderQuestionCard(section, q);
		}
	}

	private renderQuestionCard(parent: HTMLElement, q: QuizQuestion) {
		const card = parent.createDiv("nr-quiz-card");
		card.createEl("p", { text: q.question, cls: "nr-quiz-question" });
		const textarea = card.createEl("textarea", {
			cls: "nr-quiz-answer",
			attr: { placeholder: "Write your answer here…" },
		}) as HTMLTextAreaElement;

		const actions   = card.createDiv("nr-quiz-actions");
		const checkBtn  = actions.createEl("button", { text: "Check Answer",       cls: "nr-quiz-check-btn"  });
		const revealBtn = actions.createEl("button", { text: "Show Sample Answer", cls: "nr-quiz-reveal-btn" });

		const sampleEl = card.createDiv("nr-quiz-sample");
		sampleEl.createEl("p", { text: "Sample Answer", cls: "nr-quiz-sample-label" });
		sampleEl.createEl("p", { text: q.sampleAnswer,  cls: "nr-quiz-sample-text"  });
		sampleEl.style.display = "none";

		const feedbackEl = card.createDiv("nr-quiz-feedback");
		feedbackEl.style.display = "none";

		checkBtn.addEventListener("click", async () => {
			if (!textarea.value.trim()) return;
			checkBtn.disabled = true;
			checkBtn.setText("Checking…");
			feedbackEl.style.display = "none";
			try {
				const result = await evaluateAnswer(q, textarea.value.trim(), this.transcript, this.plugin.settings.groqApiKey);
				const labels: Record<string, string> = { good: "✓  Good", partial: "◐  Partial", "needs-work": "✗  Needs work" };
				feedbackEl.empty();
				feedbackEl.setAttribute("class", `nr-quiz-feedback nr-quiz-fb-${result.score}`);
				feedbackEl.createEl("strong", { text: labels[result.score] + "  " });
				feedbackEl.createEl("span", { text: result.feedback });
				feedbackEl.style.display = "block";
			} catch (e) {
				this.showError(`Evaluation failed: ${(e as Error).message}`);
			} finally {
				checkBtn.disabled = false;
				checkBtn.setText("Check Answer");
			}
		});

		revealBtn.addEventListener("click", () => {
			const shown = sampleEl.style.display !== "none";
			sampleEl.style.display = shown ? "none" : "block";
			revealBtn.setText(shown ? "Show Sample Answer" : "Hide Sample Answer");
		});
	}

	// ── Save ──────────────────────────────────────────────────────────────────

	private async saveToVault() {
		const now     = new Date();
		const dateStr = now.toISOString().split("T")[0];
		const timeStr = now.toTimeString().slice(0, 5).replace(":", "-");
		const folder  = this.plugin.settings.saveFolder.trim().replace(/\/$/, "");

		if (!this.savedVaultPath) {
			const baseName = `Lecture Notes ${dateStr} ${timeStr}`;
			this.savedVaultPath = folder ? `${folder}/${baseName}.md` : `${baseName}.md`;
		}

		const content = [
			`# ${this.savedVaultPath.split("/").pop()?.replace(".md", "") ?? "Lecture Notes"}`,
			`*Recorded: ${now.toLocaleString()}*`, "",
			"## AI Generated Notes", "",
			this.generatedMarkdown.trim() || "*No notes generated.*", "",
			"---", "",
			"## Transcript", "",
			this.transcript.trim() || "*No transcript available.*", "",
			"---", "",
			"## My Notes", "",
			this.cmEditor.state.doc.toString(),
		].join("\n");

		try {
			if (folder && !(await this.app.vault.adapter.exists(folder))) await this.app.vault.createFolder(folder);
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
		const text  = this.cmEditor.state.doc.toString().trim();
		const count = text === "" ? 0 : text.split(/\s+/).length;
		this.wordCountEl.setText(`${count} ${count === 1 ? "word" : "words"}`);
	}

	private showError(msg: string) {
		this.errorEl.setText(`⚠ ${msg}`);
		this.errorEl.style.display = "block";
	}

	private formatTime(s: number): string {
		const m   = String(Math.floor(s / 60)).padStart(2, "0");
		const sec = String(s % 60).padStart(2, "0");
		return `${m}:${sec}`;
	}
}
