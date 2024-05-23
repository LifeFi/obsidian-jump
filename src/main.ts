import { Editor, MarkdownView, Plugin } from "obsidian";
import { jumpToWithLevelChange, jumpToWithSameLevel } from "./libs";
import { DEFAULT_SETTINGS, JumpSettingTab, JumpSettings } from "./settings_tab";

export interface PrevInfo {
	tryCount: number;
	prevDirection: number | null;
	prevLine: number | null;
}

export default class JumpPlugin extends Plugin {
	settings: JumpSettings;
	prevInfo: PrevInfo = {
		tryCount: 0,
		prevDirection: null,
		prevLine: null,
	};

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new JumpSettingTab(this.app, this));

		this.addCommand({
			id: "jump-to-previous",
			name: "Jump to previous",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				jumpToWithSameLevel({
					editor,
					settings: this.settings,
					app: this.app,
					prevInfo: this.prevInfo,
					direction: -1,
				});
			},
		});

		this.addCommand({
			id: "jump-to-next",
			name: "Jump to next",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				jumpToWithSameLevel({
					editor,
					settings: this.settings,
					app: this.app,
					prevInfo: this.prevInfo,
					direction: 1,
				});
			},
		});

		this.addCommand({
			id: "jump-to-upper-level",
			name: "Jump to upper level",
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
			name: "Jump to lower level",
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
