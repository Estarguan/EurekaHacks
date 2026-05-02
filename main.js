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
async function generateNotes(transcript, apiKey) {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `You are a note-taking assistant. Convert this lecture transcript into clear, structured notes. Use markdown with headings (##), bullet points, and **bold** for key terms. Be concise \u2014 capture the key ideas, not every word.

Transcript:
${transcript}`
        }
      ]
    })
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq notes ${res.status}${detail ? ": " + detail : ""}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

// src/recorder-view.ts
var RECORDER_VIEW_TYPE = "notereal-recorder";
var obsidianEditorTheme = import_view.EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "transparent",
    color: "var(--text-normal)",
    fontSize: "var(--font-text-size)",
    fontFamily: "var(--font-text)"
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "inherit",
    lineHeight: "var(--line-height-normal, 1.6)",
    overflow: "auto"
  },
  ".cm-content": {
    padding: "2px 0",
    caretColor: "var(--caret-color, var(--text-normal))",
    minHeight: "100%"
  },
  ".cm-line": { padding: "0" },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--text-accent, var(--text-normal))"
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    background: "var(--text-selection) !important"
  },
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
    const panels = container.createDiv("nr-panels");
    const transcriptPanel = panels.createDiv("nr-panel");
    transcriptPanel.createEl("h3", { text: "Transcript", cls: "nr-panel-title" });
    this.transcriptEl = transcriptPanel.createDiv("nr-transcript");
    this.transcriptEl.createEl("p", {
      text: "Transcript will appear here after recording stops.",
      cls: "nr-placeholder"
    });
    this.audioPlaybackEl = transcriptPanel.createDiv("nr-audio-playback");
    this.audioPlaybackEl.style.display = "none";
    const studentPanel = panels.createDiv("nr-panel");
    studentPanel.createEl("h3", { text: "Your Notes", cls: "nr-panel-title" });
    const editorEl = studentPanel.createDiv("nr-cm-editor");
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
          import_view.EditorView.updateListener.of((update) => {
            if (update.docChanged) this.updateWordCount();
          })
        ]
      }),
      parent: editorEl
    });
    this.wordCountEl = studentPanel.createDiv("nr-wordcount");
    this.wordCountEl.setText("0 words");
    const aiPanel = panels.createDiv("nr-panel");
    aiPanel.createEl("h3", { text: "Lecture Notes", cls: "nr-panel-title" });
    this.aiNotesStatusEl = aiPanel.createDiv("nr-ai-status");
    this.aiNotesEl = aiPanel.createDiv("nr-ai-notes");
    this.aiNotesEl.createEl("p", {
      text: "AI-generated notes will appear here after recording stops.",
      cls: "nr-placeholder"
    });
    const footer = container.createDiv("nr-footer");
    this.saveBtn = footer.createEl("button", {
      text: "Save to Vault",
      cls: "nr-save-btn"
    });
    this.saveBtn.disabled = true;
    this.saveBtn.addEventListener("click", () => this.saveToVault());
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
    } catch (e) {
      this.showError(`Note generation failed: ${e.message}`);
      this.aiNotesStatusEl.empty();
    }
  }
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
          await this.app.vault.modify(
            file,
            content
          );
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
