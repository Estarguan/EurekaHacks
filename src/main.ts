import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { RecorderView, RECORDER_VIEW_TYPE } from "./recorder-view";

export interface NoteRealSettings {
	geminiApiKey: string;
	saveFolder: string;
}

const DEFAULT_SETTINGS: NoteRealSettings = {
	geminiApiKey: "",
	saveFolder: "",
};

export default class NoteRealPlugin extends Plugin {
	settings!: NoteRealSettings;

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
			callback: () => this.activateView(),
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
}

class NoteRealSettingTab extends PluginSettingTab {
	plugin: NoteRealPlugin;

	constructor(app: App, plugin: NoteRealPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Gemini API key")
			.setDesc("Free API key from aistudio.google.com")
			.addText((text) =>
				text
					.setPlaceholder("AIza...")
					.setValue(this.plugin.settings.geminiApiKey)
					.onChange(async (value) => {
						this.plugin.settings.geminiApiKey = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Save folder")
			.setDesc("Vault folder to save notes into (leave blank for root)")
			.addText((text) =>
				text
					.setPlaceholder("Lectures/")
					.setValue(this.plugin.settings.saveFolder)
					.onChange(async (value) => {
						this.plugin.settings.saveFolder = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
