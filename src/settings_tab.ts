import { App, PluginSettingTab, Setting } from "obsidian";
import JumpPlugin from "./main";

export interface JumpSettings {
	peerJump: boolean;
}

export const DEFAULT_SETTINGS: JumpSettings = {
	peerJump: true,
};

export class JumpSettingTab extends PluginSettingTab {
	plugin: JumpPlugin;
	constructor(app: App, plugin: JumpPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Jump Settings" });

		new Setting(containerEl)
			.setName("Peer Jump ON/OFF")
			.setDesc("Jumps to the last stuck item of the same level.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.peerJump)
					.onChange(async (value) => {
						this.plugin.settings.peerJump = toggle.getValue();
						await this.plugin.saveSettings();
					});
			});
	}
}
