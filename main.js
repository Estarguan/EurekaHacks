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

// src/gemini.ts
async function generateNotes(transcript, apiKey) {
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
                text: `You are a note-taking assistant. Convert this lecture transcript into clear, structured notes. Use markdown with headings (##), bullet points, and **bold** for key terms. Be concise \u2014 capture the key ideas, not every word.

Transcript:
${transcript}`
              }
            ]
          }
        ]
      })
    }
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini API ${res.status}${detail ? ": " + detail : ""}`);
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

// src/recorder-view.ts
var RECORDER_VIEW_TYPE = "notereal-recorder";
var RecorderView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recognition = null;
    this.transcript = "";
    this.generatedMarkdown = "";
    this.timerInterval = null;
    this.seconds = 0;
    this.isRecording = false;
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
    this.timerEl = recBar.createDiv("nr-timer");
    this.timerEl.style.display = "none";
    this.errorEl = container.createDiv("nr-error");
    this.errorEl.style.display = "none";
    const panels = container.createDiv("nr-panels");
    const aiPanel = panels.createDiv("nr-panel");
    aiPanel.createEl("h3", { text: "Lecture Notes", cls: "nr-panel-title" });
    this.processingEl = aiPanel.createDiv("nr-processing");
    this.processingEl.innerHTML = '<span class="nr-spinner"></span> Generating notes\u2026';
    this.processingEl.style.display = "none";
    this.aiNotesEl = aiPanel.createDiv("nr-ai-notes");
    this.aiNotesEl.createEl("p", {
      text: "Record a lecture and notes will appear here automatically.",
      cls: "nr-placeholder"
    });
    const studentPanel = panels.createDiv("nr-panel");
    studentPanel.createEl("h3", { text: "Your Notes", cls: "nr-panel-title" });
    this.studentTextarea = studentPanel.createEl("textarea", {
      cls: "nr-textarea",
      attr: {
        placeholder: "Write your own notes here\u2026\n\nCapture ideas in your own words.",
        spellcheck: "true"
      }
    });
    this.studentTextarea.addEventListener(
      "input",
      () => this.updateWordCount()
    );
    this.wordCountEl = studentPanel.createDiv("nr-wordcount");
    this.wordCountEl.setText("0 words");
    const footer = container.createDiv("nr-footer");
    this.saveBtn = footer.createEl("button", {
      text: "Save to Vault",
      cls: "nr-save-btn"
    });
    this.saveBtn.disabled = true;
    this.saveBtn.addEventListener("click", () => this.saveToVault());
  }
  async onClose() {
    if (this.isRecording) await this.stopRecording();
  }
  async toggleRecording() {
    this.isRecording ? await this.stopRecording() : await this.startRecording();
  }
  async startRecording() {
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
        cls: "nr-placeholder"
      });
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
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        this.recognition = new SR();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";
        this.recognition.onresult = (e) => {
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal)
              this.transcript += e.results[i][0].transcript + " ";
          }
        };
        this.recognition.onend = () => {
          var _a;
          if (this.isRecording) (_a = this.recognition) == null ? void 0 : _a.start();
        };
        this.recognition.start();
      }
    } catch (e) {
      this.showError("Microphone access denied.");
    }
  }
  async stopRecording() {
    var _a;
    (_a = this.recognition) == null ? void 0 : _a.stop();
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
    this.recordBtn.innerHTML = '<span class="nr-dot"></span> Start Recording';
    this.timerEl.style.display = "none";
    if (this.transcript.trim()) await this.runNoteGeneration();
  }
  async runNoteGeneration() {
    const apiKey = this.plugin.settings.geminiApiKey;
    if (!apiKey) {
      this.showError("No Gemini API key. Add it in Settings \u2192 NoteReal.");
      return;
    }
    this.processingEl.style.display = "flex";
    this.aiNotesEl.empty();
    try {
      this.generatedMarkdown = await generateNotes(this.transcript, apiKey);
      this.processingEl.style.display = "none";
      await import_obsidian.MarkdownRenderer.render(
        this.app,
        this.generatedMarkdown,
        this.aiNotesEl,
        "",
        this
      );
      this.saveBtn.disabled = false;
    } catch (e) {
      this.processingEl.style.display = "none";
      this.showError(e.message);
    }
  }
  async saveToVault() {
    const now = /* @__PURE__ */ new Date();
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
      this.studentTextarea.value
    ].join("\n");
    try {
      if (folder && !await this.app.vault.adapter.exists(folder)) {
        await this.app.vault.createFolder(folder);
      }
      await this.app.vault.create(path, content);
      new import_obsidian.Notice(`Saved: ${path}`);
    } catch (e) {
      new import_obsidian.Notice(`Failed to save: ${e.message}`);
    }
  }
  updateWordCount() {
    const text = this.studentTextarea.value.trim();
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
  geminiApiKey: "",
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
    new import_obsidian2.Setting(containerEl).setName("Gemini API key").setDesc("Free API key from aistudio.google.com").addText(
      (text) => text.setPlaceholder("AIza...").setValue(this.plugin.settings.geminiApiKey).onChange(async (value) => {
        this.plugin.settings.geminiApiKey = value;
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
