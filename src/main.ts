import { Editor, MarkdownView, Plugin } from "obsidian";
import {
	JumpToTarget,
	PeerSlidingInList,
	PeerSlidingInListItemProps,
	getJumpItems,
} from "./utils";
import { DEFAULT_SETTINGS, JumpSettingTab, JumpSettings } from "./settings_tab";

// Remember to rename these classes and interfaces!

export default class JumpPlugin extends Plugin {
	settings: JumpSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new JumpSettingTab(this.app, this));

		// 추가 기능 : peerJump 설정에 따른 동작
		this.addCommand({
			id: "jump-to-previous",
			name: "jump to previous",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// this.goToRelativeHeading(editor, view, 1);
				this.jumpTo(editor, view, -1);
			},
		});
		this.addCommand({
			id: "jump-to-next",
			name: "jump to next",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// this.goToRelativeHeading(editor, view, 1);
				this.jumpTo(editor, view, 1);
			},
		});
		// 추가 기능 : 가까운 좌우 레벨로 이동
		this.addCommand({
			id: "jump-to-previous-level",
			name: "jump to previous level",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// this.goToRelativeHeading(editor, view, 1);
				// this.jumpTo(editor, view, 1);
			},
		});
		this.addCommand({
			id: "jump-to-next-level",
			name: "jump to next level",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// this.goToRelativeHeading(editor, view, 1);
				// this.jumpTo(editor, view, 1);
			},
		});
	}

	jumpTo(editor: Editor, view: MarkdownView, offset: number) {
		const jumpItems = getJumpItems(this.app);

		//  jumpItems가 존재하지 않으면, 문서 처음-끝으로 이동
		// console.log("jumpItems?.length: ", jumpItems?.length);
		if (!jumpItems?.length) {
			if (offset === -1) {
				JumpToTarget(editor, 0, false);
			} else if (offset === 1) {
				JumpToTarget(editor, editor.lastLine(), false);
			}
			return;
		}

		// jumpItems가 존재하는 경우
		const currentPosition = editor.getCursor();
		const currentItem = jumpItems.find(
			(item) => item.position.start.line === currentPosition.line
		);

		// 커서가 jumpItems에 놓여 있지 않으면, 모든 Level 이 이동 범위.
		if (!currentItem) {
			const nearestItemIndex = jumpItems.findLastIndex(
				(item) => item.position.start.line <= currentPosition.line
			);

			if (offset === -1) {
				JumpToTarget(
					editor,
					nearestItemIndex === -1 || nearestItemIndex === 0
						? 0
						: jumpItems[nearestItemIndex].position.start.line
				);
			} else if (offset == 1) {
				const nextItem = jumpItems[nearestItemIndex + 1];

				JumpToTarget(
					editor,
					nextItem ? nextItem.position.start.line : editor.lastLine()
				);
			}
			return;
		}
		// 커서가 jumpItems에 놓여 있는 경우, 동일 Level 이 이동 범위.
		else {
			const filterdJumpItems = jumpItems.filter(
				(item) => item.level === currentItem.level
			);

			const nearestItemIndex = filterdJumpItems.findLastIndex(
				(item) => item.position.start.line <= currentPosition.line
			);

			// console.log("nearestItemIndex: ", nearestItemIndex);
			// console.log("filterdJumpItems: ", filterdJumpItems);

			if (offset === -1) {
				const slidingItemIndex = PeerSlidingInList({
					list: filterdJumpItems as unknown as PeerSlidingInListItemProps[],
					currentIndex: nearestItemIndex,
					direction: -1,
					isPeerJump: this.settings.peerJump,
					isStart: true,
				});

				console.log("filterdJumpItems: ", filterdJumpItems);
				console.log("nearestItemIndex: ", nearestItemIndex);
				console.log("slidingItemIndex: ", slidingItemIndex);

				const previousItem = filterdJumpItems[slidingItemIndex];

				JumpToTarget(
					editor,
					previousItem ? previousItem.position.start.line : 0
				);
			} else if (offset === 1) {
				const slidingItemIndex = PeerSlidingInList({
					list: filterdJumpItems as unknown as PeerSlidingInListItemProps[],
					currentIndex: nearestItemIndex,
					direction: 1,
					isPeerJump: this.settings.peerJump,
					isStart: true,
				});
				console.log("filterdJumpItems: ", filterdJumpItems);
				console.log("nearestItemIndex: ", nearestItemIndex);
				console.log("slidingItemIndex: ", slidingItemIndex);

				const nextItem = filterdJumpItems[slidingItemIndex];

				JumpToTarget(
					editor,
					nextItem ? nextItem.position.start.line : editor.lastLine()
				);
			}
			return;
		}
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
