var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => NoteRealPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/recorder-view.ts
var import_obsidian = require("obsidian");
var import_view = require("@codemirror/view");
var import_state = require("@codemirror/state");
var import_commands = require("@codemirror/commands");
var import_language = require("@codemirror/language");

// src/gemini.ts
var GROQ_BASE = "https://api.groq.com/openai/v1";
async function transcribeAudio(blob, apiKey) {
  const form = new FormData();
  form.append("file", blob, "recording.webm");
  form.append("model", "whisper-large-v3-turbo");
  const res = await fetch(`${GROQ_BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq transcription ${res.status}${detail ? ": " + detail : ""}`);
  }
  const data = await res.json();
  return data.text;
}
async function generateFeedback(studentNotes, aiNotes, apiKey) {
  const text = await groqChat(apiKey, `You are an educational feedback assistant. Compare the student's notes against the AI reference notes and identify 3-6 specific issues.

Return ONLY a raw JSON array \u2014 no markdown fences, no explanation, just the array:
[
  {
    "studentText": "exact phrase from student notes to highlight, or empty string if content is completely missing",
    "question": "Socratic question that nudges the student toward the issue without giving the answer",
    "hint": "More direct hint if they are stuck \u2014 still does not give the full answer away",
    "type": "missing|incorrect|incomplete|verbose"
  }
]

Type meanings:
- "missing": important concept absent from student notes \u2014 set studentText to empty string
- "incorrect": student wrote something factually wrong \u2014 copy EXACT text from student notes
- "incomplete": student touched on it but did not fully explain \u2014 copy EXACT text
- "verbose": could be more concise \u2014 copy EXACT text

AI Reference Notes:
${aiNotes}

Student Notes:
${studentNotes}`);
  const clean = text.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
  return JSON.parse(clean);
}
async function groqChat(apiKey, prompt) {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}${detail ? ": " + detail : ""}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}
async function generateNotes(transcript, apiKey) {
  return groqChat(apiKey, `You are a note-taking assistant. Convert this lecture transcript into clear, structured notes. Use markdown with headings (##), bullet points, and **bold** for key terms. Be concise \u2014 capture the key ideas, not every word.

Transcript:
${transcript}`);
}

// src/sample-data.ts
var TEST_MODE = true;
var SAMPLE_TRANSCRIPT = `
Alright everyone, settle down, let's get started. Today we're going to be talking about naming alkanes,
which is part of our unit on organic chemistry nomenclature. This is IUPAC naming, so the International
Union of Pure and Applied Chemistry \u2014 they set the rules that chemists worldwide follow so everyone's
on the same page.

So first things first, what is an alkane? Alkanes are hydrocarbons \u2014 meaning they only contain carbon
and hydrogen \u2014 and they have only single bonds between carbons. We call them saturated hydrocarbons
because they're saturated with hydrogen. The general formula is C n H 2n plus 2. So for one carbon,
methane, you get CH4. Two carbons, ethane, C2H6. Three carbons, propane, C3H8. You see the pattern.

Now the first four names \u2014 methane, ethane, propane, butane \u2014 those you just have to memorize, they're
from old common names. From five carbons onwards, the prefix is Greek: penta, hexa, hepta, octa, nona,
deca. Five carbons is pentane, six is hexane, and so on.

Okay so how do we name a branched alkane? Here are the steps. Step one: find the longest carbon chain.
That becomes your parent chain and tells you the base name. If your longest chain is seven carbons,
you're looking at heptane. Step two: number the carbons in that chain so that the substituents \u2014 the
branches \u2014 get the lowest possible numbers. So if you have a branch, you start numbering from the end
closest to it.

Step three: name the substituents. A branch that's just one carbon is called a methyl group. Two carbons
is ethyl. And you put the number of the carbon it's attached to as a prefix, like 2-methyl or 3-ethyl.

Step four: if you have multiple substituents of the same type, use di, tri, tetra as prefixes. So two
methyl groups is dimethyl, three is trimethyl.

Step five \u2014 and this one students always forget \u2014 when you have different substituents, you list them
in alphabetical order. Not based on their position numbers, alphabetical. So ethyl comes before methyl.
The di and tri prefixes don't count for alphabetical order, by the way.

Finally you put it all together: substituents listed alphabetically with their position numbers,
then the parent chain name. Like 3-ethyl-2-methylpentane. The parent chain is pentane, five carbons,
there's an ethyl group on carbon 3 and a methyl group on carbon 2.

One common mistake: students sometimes choose a shorter chain because the longer chain is harder to
see when the molecule is drawn in a zig-zag. Always make sure you've found the absolute longest chain.

Alright, we'll do some practice problems next.
`.trim();
var SAMPLE_AI_NOTES = `
## Alkanes \u2014 Definition and Formula

- **Alkanes** are saturated hydrocarbons: contain only C and H, single bonds only
- General formula: **C\u2099H\u2082\u2099\u208A\u2082**
- First four names are memorized: **methane, ethane, propane, butane**
- C5 onwards use Greek prefixes: penta-, hexa-, hepta-, octa-, nona-, deca-

## IUPAC Naming Steps for Branched Alkanes

1. **Find the longest carbon chain** \u2192 this is the parent chain (gives the base name)
2. **Number the chain** from the end closest to a substituent (lowest locants rule)
3. **Name substituents** with their position number (e.g. 2-methyl, 3-ethyl)
   - 1 C branch = **methyl**, 2 C branch = **ethyl**
4. **Multiple identical substituents** \u2192 use di-, tri-, tetra- prefixes
5. **List substituents alphabetically** (di/tri prefixes are ignored for alphabetical order)

## Putting It Together

- Format: *[substituents alphabetically with locants]-[parent chain name]*
- Example: **3-ethyl-2-methylpentane**
  - Parent chain: pentane (5 C)
  - Ethyl on C3, methyl on C2
  - Ethyl listed before methyl (alphabetical)

## Common Mistakes

- **Missing the longest chain** \u2014 always double-check zig-zag drawn structures
- Forgetting alphabetical order and using numerical order instead
- Counting di/tri when alphabetizing (don't \u2014 ignore them)
`.trim();

// src/recorder-view.ts
var RECORDER_VIEW_TYPE = "notereal-recorder";
var setHighlights = import_state.StateEffect.define();
var highlightField = import_state.StateField.define({
  create() {
    return import_view.Decoration.none;
  },
  update(deco, tr) {
    deco = deco.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setHighlights)) {
        const sorted = [...effect.value].sort((a, b) => a.from - b.from);
        const builder = new import_state.RangeSetBuilder();
        for (const { from, to, id, type } of sorted) {
          builder.add(from, to, import_view.Decoration.mark({ class: `nr-highlight nr-hl-${id} nr-hl-type-${type}` }));
        }
        deco = builder.finish();
      }
    }
    return deco;
  },
  provide: (f) => import_view.EditorView.decorations.from(f)
});
var FeedbackModal = class extends import_obsidian.Modal {
  constructor(app, item) {
    super(app);
    this.item = item;
  }
  onOpen() {
    var _a;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("nr-feedback-modal");
    const typeLabel = {
      missing: "Missing content",
      incorrect: "Incorrect",
      incomplete: "Incomplete",
      verbose: "Too verbose"
    };
    contentEl.createEl("span", {
      text: (_a = typeLabel[this.item.type]) != null ? _a : this.item.type,
      cls: `nr-type-badge nr-type-${this.item.type}`
    });
    if (this.item.studentText) {
      contentEl.createDiv("nr-feedback-quote").createEl("p", {
        text: `"${this.item.studentText}"`
      });
    }
    contentEl.createEl("p", { text: this.item.question, cls: "nr-feedback-question" });
    const hintBtn = contentEl.createEl("button", {
      text: "I'm stuck \u2014 give me a hint",
      cls: "nr-hint-btn"
    });
    const hintEl = contentEl.createDiv("nr-hint");
    hintEl.setText(this.item.hint);
    hintEl.style.display = "none";
    hintBtn.addEventListener("click", () => {
      hintEl.style.display = "block";
      hintBtn.style.display = "none";
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var obsidianEditorTheme = import_view.EditorView.theme({
  "&": { height: "100%", backgroundColor: "transparent", color: "var(--text-normal)", fontSize: "var(--font-text-size)", fontFamily: "var(--font-text)" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "inherit", lineHeight: "var(--line-height-normal, 1.6)", overflow: "auto" },
  ".cm-content": { padding: "2px 0", caretColor: "var(--caret-color, var(--text-normal))", minHeight: "100%" },
  ".cm-line": { padding: "0" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--text-accent, var(--text-normal))" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { background: "var(--text-selection) !important" },
  ".cm-activeLine": { backgroundColor: "transparent" },
  ".cm-placeholder": { color: "var(--text-faint)", fontStyle: "italic" }
});
var RecorderView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.transcript = "";
    this.generatedMarkdown = "";
    this.feedbackItems = [];
    this.timerInterval = null;
    this.seconds = 0;
    this.isRecording = false;
    this.savedVaultPath = null;
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
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("nr-container");
    const header = container.createDiv("nr-header");
    const titleRow = header.createDiv("nr-title-row");
    titleRow.createEl("span", { text: "NoteReal", cls: "nr-title" });
    titleRow.createEl("span", { text: "Anti-AI", cls: "nr-badge" });
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
    this.errorEl = container.createDiv("nr-error");
    this.errorEl.style.display = "none";
    const tabBar = container.createDiv("nr-tab-bar");
    const recordTab = tabBar.createEl("button", { text: "Record", cls: "nr-tab nr-tab-active" });
    const reviewTab = tabBar.createEl("button", { text: "Review", cls: "nr-tab" });
    const recordPane = container.createDiv("nr-pane nr-pane-active");
    recordPane.createEl("h3", { text: "Your Notes", cls: "nr-panel-title nr-pane-title" });
    const editorEl = recordPane.createDiv("nr-cm-editor");
    this.cmEditor = new import_view.EditorView({
      state: import_state.EditorState.create({
        doc: "",
        extensions: [
          (0, import_commands.history)(),
          (0, import_view.drawSelection)(),
          (0, import_language.indentOnInput)(),
          (0, import_language.bracketMatching)(),
          import_view.EditorView.lineWrapping,
          import_view.keymap.of([...import_commands.defaultKeymap, ...import_commands.historyKeymap]),
          (0, import_view.placeholder)("Write your own notes here\u2026\n\nCapture ideas in your own words."),
          obsidianEditorTheme,
          highlightField,
          import_view.EditorView.updateListener.of((update) => {
            if (update.docChanged) this.updateWordCount();
          })
        ]
      }),
      parent: editorEl
    });
    this.cmEditor.dom.addEventListener("mousedown", (e) => {
      const target = e.target;
      const hl = target.closest('[class*="nr-hl-f"]');
      if (!hl) return;
      const cls = [...hl.classList].find((c) => c.startsWith("nr-hl-f"));
      if (cls) this.openFeedbackPopup(cls.replace("nr-hl-", ""));
    });
    this.wordCountEl = recordPane.createDiv("nr-wordcount");
    this.wordCountEl.setText("0 words");
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
    const panes = [recordPane, reviewPane];
    const tabs = [recordTab, reviewTab];
    const switchTab = (idx) => {
      tabs.forEach((t, i) => t.toggleClass("nr-tab-active", i === idx));
      panes.forEach((p, i) => p.toggleClass("nr-pane-active", i === idx));
    };
    tabs.forEach((tab, i) => tab.addEventListener("click", () => switchTab(i)));
    const footer = container.createDiv("nr-footer");
    this.saveBtn = footer.createEl("button", { text: "Save to Vault", cls: "nr-save-btn" });
    this.saveBtn.disabled = true;
    this.saveBtn.addEventListener("click", () => this.saveToVault());
    this.feedbackBtn = footer.createEl("button", { text: "Get Feedback", cls: "nr-feedback-btn" });
    this.feedbackBtn.disabled = true;
    this.feedbackBtn.addEventListener("click", () => this.runFeedback());
  }
  async onClose() {
    var _a;
    if (this.isRecording) await this.stopRecording();
    (_a = this.cmEditor) == null ? void 0 : _a.destroy();
  }
  async toggleRecording() {
    this.isRecording ? await this.stopRecording() : await this.startRecording();
  }
  async populateMicList() {
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
    } catch (e) {
    }
  }
  async startRecording() {
    try {
      const deviceId = this.micSelect.value;
      const audioConstraints = deviceId ? { deviceId: { exact: deviceId } } : true;
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
      this.transcriptEl.createEl("p", { text: "Recording\u2026 transcript will appear when done.", cls: "nr-placeholder" });
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
      }, 1e3);
    } catch (e) {
      this.showError("Microphone access denied.");
    }
  }
  async stopRecording() {
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
  async processRecording() {
    const blob = new Blob(this.audioChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    this.audioPlaybackEl.empty();
    this.audioPlaybackEl.createEl("p", { text: "Temp Playback", cls: "nr-playback-label" });
    const audio = this.audioPlaybackEl.createEl("audio");
    audio.src = url;
    audio.controls = true;
    this.audioPlaybackEl.style.display = "block";
    if (TEST_MODE) {
      this.transcript = SAMPLE_TRANSCRIPT;
      this.generatedMarkdown = SAMPLE_AI_NOTES;
      this.transcriptEl.setText(this.transcript);
      await import_obsidian.MarkdownRenderer.render(this.app, this.generatedMarkdown, this.aiNotesEl, "", this);
      this.saveBtn.disabled = false;
      this.feedbackBtn.disabled = false;
      return;
    }
    const apiKey = this.plugin.settings.groqApiKey;
    if (!apiKey) {
      this.showError("No Groq API key. Add it in Settings \u2192 NoteReal.");
      return;
    }
    this.aiNotesStatusEl.setText("Transcribing\u2026");
    this.transcriptEl.empty();
    try {
      this.transcript = await transcribeAudio(blob, apiKey);
      this.transcriptEl.setText(this.transcript);
    } catch (e) {
      this.showError(`Transcription failed: ${e.message}`);
      this.aiNotesStatusEl.empty();
      return;
    }
    this.aiNotesStatusEl.innerHTML = '<span class="nr-spinner"></span> Generating notes\u2026';
    this.aiNotesEl.empty();
    try {
      this.generatedMarkdown = await generateNotes(this.transcript, apiKey);
      this.aiNotesStatusEl.empty();
      await import_obsidian.MarkdownRenderer.render(this.app, this.generatedMarkdown, this.aiNotesEl, "", this);
      this.saveBtn.disabled = false;
      this.feedbackBtn.disabled = false;
    } catch (e) {
      this.showError(`Note generation failed: ${e.message}`);
      this.aiNotesStatusEl.empty();
    }
  }
  // ── Feedback ──────────────────────────────────────────────────────────────
  async runFeedback() {
    const studentNotes = this.cmEditor.state.doc.toString().trim();
    if (!studentNotes) {
      this.showError("Write some notes first before getting feedback.");
      return;
    }
    if (!this.generatedMarkdown) {
      this.showError("No AI notes yet \u2014 record a lecture first.");
      return;
    }
    const apiKey = this.plugin.settings.groqApiKey;
    if (!apiKey) {
      this.showError("No Groq API key. Add it in Settings \u2192 NoteReal.");
      return;
    }
    this.feedbackBtn.disabled = true;
    this.feedbackBtn.setText("Analyzing\u2026");
    this.clearHighlights();
    try {
      const raw = await generateFeedback(studentNotes, this.generatedMarkdown, apiKey);
      this.feedbackItems = raw.map((item, i) => {
        const id = `f${i}`;
        let from = 0, to = 0;
        if (item.studentText) {
          const idx = studentNotes.indexOf(item.studentText);
          if (idx !== -1) {
            from = idx;
            to = idx + item.studentText.length;
          }
        }
        return { ...item, id, from, to };
      });
      this.applyHighlights();
      const count = this.feedbackItems.filter((f) => f.from < f.to).length;
      new import_obsidian.Notice(`${count} issue${count !== 1 ? "s" : ""} highlighted \u2014 click any underlined text to see feedback.`);
    } catch (e) {
      this.showError(`Feedback failed: ${e.message}`);
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
  openFeedbackPopup(id) {
    const item = this.feedbackItems.find((f) => f.id === id);
    if (!item) return;
    new FeedbackModal(this.app, item).open();
  }
  applyHighlights() {
    const highlights = this.feedbackItems.filter((item) => item.from < item.to).map(({ from, to, id, type }) => ({ from, to, id, type }));
    this.cmEditor.dispatch({ effects: setHighlights.of(highlights) });
  }
  clearHighlights() {
    this.cmEditor.dispatch({ effects: setHighlights.of([]) });
  }
  // ── Save ──────────────────────────────────────────────────────────────────
  async saveToVault() {
    var _a, _b;
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().slice(0, 5).replace(":", "-");
    const folder = this.plugin.settings.saveFolder.trim().replace(/\/$/, "");
    if (!this.savedVaultPath) {
      const baseName = `Lecture Notes ${dateStr} ${timeStr}`;
      this.savedVaultPath = folder ? `${folder}/${baseName}.md` : `${baseName}.md`;
    }
    const content = [
      `# ${(_b = (_a = this.savedVaultPath.split("/").pop()) == null ? void 0 : _a.replace(".md", "")) != null ? _b : "Lecture Notes"}`,
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
      this.cmEditor.state.doc.toString()
    ].join("\n");
    try {
      if (folder && !await this.app.vault.adapter.exists(folder)) {
        await this.app.vault.createFolder(folder);
      }
      const exists = await this.app.vault.adapter.exists(this.savedVaultPath);
      if (exists) {
        const file = this.app.vault.getAbstractFileByPath(this.savedVaultPath);
        if (file && "extension" in file) {
          await this.app.vault.modify(file, content);
          new import_obsidian.Notice(`Updated: ${this.savedVaultPath}`);
        }
      } else {
        await this.app.vault.create(this.savedVaultPath, content);
        new import_obsidian.Notice(`Saved: ${this.savedVaultPath}`);
      }
      this.saveBtn.setText("Update in Vault");
    } catch (e) {
      new import_obsidian.Notice(`Failed to save: ${e.message}`);
    }
  }
  // ── Helpers ───────────────────────────────────────────────────────────────
  updateWordCount() {
    const text = this.cmEditor.state.doc.toString().trim();
    const count = text === "" ? 0 : text.split(/\s+/).length;
    this.wordCountEl.setText(`${count} ${count === 1 ? "word" : "words"}`);
  }
  showError(msg) {
    this.errorEl.setText(`\u26A0 ${msg}`);
    this.errorEl.style.display = "block";
  }
  formatTime(s) {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  }
};

// src/main.ts
var DEFAULT_SETTINGS = {
  groqApiKey: "",
  saveFolder: ""
};
var NoteRealPlugin = class extends import_obsidian2.Plugin {
  async onload() {
    await this.loadSettings();
    this.registerView(
      RECORDER_VIEW_TYPE,
      (leaf) => new RecorderView(leaf, this)
    );
    this.addRibbonIcon("mic", "NoteReal", () => this.activateView());
    this.addCommand({
      id: "open-notereal",
      name: "Open NoteReal recorder",
      callback: () => this.activateView()
    });
    this.addSettingTab(new NoteRealSettingTab(this.app, this));
  }
  onunload() {
    this.app.workspace.detachLeavesOfType(RECORDER_VIEW_TYPE);
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(RECORDER_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: RECORDER_VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var NoteRealSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(containerEl).setName("Groq API key").setDesc("Free API key from console.groq.com").addText(
      (text) => text.setPlaceholder("AIza...").setValue(this.plugin.settings.groqApiKey).onChange(async (value) => {
        this.plugin.settings.groqApiKey = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Save folder").setDesc("Vault folder to save notes into (leave blank for root)").addText(
      (text) => text.setPlaceholder("Lectures/").setValue(this.plugin.settings.saveFolder).onChange(async (value) => {
        this.plugin.settings.saveFolder = value;
        await this.plugin.saveSettings();
      })
    );
  }
};
