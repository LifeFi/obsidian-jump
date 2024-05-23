import { App, PluginSettingTab, Setting } from "obsidian";
import JumpPlugin from "./main";

export interface JumpSettings {
	peerJump: boolean;
	includeDocumentBoundaries: boolean;
	threshHold: number;
}

export const DEFAULT_SETTINGS: JumpSettings = {
	peerJump: true,
	includeDocumentBoundaries: true,
	threshHold: 0,
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

		// containerEl.createEl("h2", { text: "Jump Settings" });

		new Setting(containerEl)
			.setName("Include first/last line")
			.setHeading()
			.setDesc(
				"Go to the last line after the last item, and to the first line before the first item."
			)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.includeDocumentBoundaries)
					.onChange(async (value) => {
						this.plugin.settings.includeDocumentBoundaries =
							toggle.getValue();
						await this.plugin.saveSettings();
						this.display();
					});
			});
		if (this.plugin.settings.includeDocumentBoundaries) {
			new Setting(containerEl)
				.setName("Threshold")
				.setHeading()
				.setDesc(
					"You can jump if attempts exceed the threshold at the first or last item."
				)
				.addText((text) => {
					text.setValue(
						this.plugin.settings.threshHold?.toString() || "0"
					).onChange(async (value) => {
						const parsedInt = parseInt(value);
						this.plugin.settings.threshHold =
							parsedInt >= 0 ? parsedInt : 0;
						await this.plugin.saveSettings();
					});
					text.inputEl.style.width = "50px";
				});
		}

		new Setting(containerEl)
			.setName("Peer jump")
			.setHeading()
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
