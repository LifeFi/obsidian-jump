import { Editor, MarkdownView, Plugin } from "obsidian";
import { jumpToWithLevelChange, jumpToWithSameLevel } from "./libs";
import { DEFAULT_SETTINGS, JumpSettingTab, JumpSettings } from "./settings_tab";

// Remember to rename these classes and interfaces!

export default class JumpPlugin extends Plugin {
	settings: JumpSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new JumpSettingTab(this.app, this));

		this.addCommand({
			id: "jump-to-previous",
			name: "Jump to Previous",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				jumpToWithSameLevel({
					editor,
					settings: this.settings,
					app: this.app,
					direction: -1,
				});
			},
		});

		this.addCommand({
			id: "jump-to-next",
			name: "Jump to Next",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				jumpToWithSameLevel({
					editor,
					settings: this.settings,
					app: this.app,
					direction: 1,
				});
			},
		});

		this.addCommand({
			id: "jump-to-Upper-level",
			name: "Jump to Upper Level",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				jumpToWithLevelChange({
					editor,
					settings: this.settings,
					app: this.app,
					direction: -1,
				});
			},
		});

		this.addCommand({
			id: "jump-to-lower-level",
			name: "Jump to Lower Level",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				jumpToWithLevelChange({
					editor,
					settings: this.settings,
					app: this.app,
					direction: 1,
				});
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
