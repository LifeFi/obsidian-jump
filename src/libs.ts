import { App, Editor, Pos } from "obsidian";
import { JumpSettings } from "./settings_tab";

export function jumpToWithSameLevel({
	editor,
	settings,
	app,
	direction,
}: {
	editor: Editor;
	settings: JumpSettings;
	app: App;
	direction: -1 | 1;
}) {
	const jumpItems = getJumpItems(app);

	//  jumpItems가 존재하지 않으면, 문서 처음-끝으로 이동
	if (!jumpItems?.length) {
		if (direction === -1) {
			JumpToTarget(editor, 0, false);
		} else if (direction === 1) {
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

		if (direction === -1) {
			JumpToTarget(
				editor,
				nearestItemIndex === direction
					? 0
					: jumpItems[nearestItemIndex].position.start.line
			);
		} else if (direction == 1) {
			const nextItem = jumpItems[nearestItemIndex + direction];

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

		const slidingItemIndex = PeerSlidingInList({
			list: filterdJumpItems as unknown as PeerSlidingInListItemProps[],
			currentIndex: nearestItemIndex,
			direction,
			isPeerJump: settings.peerJump,
			isStart: true,
		});

		const foundItem = filterdJumpItems[slidingItemIndex];

		JumpToTarget(
			editor,
			foundItem
				? foundItem.position.start.line
				: direction === -1
				? 0
				: editor.lastLine()
		);

		return;
	}
}

export function jumpToWithLevelChange({
	editor,
	settings,
	app,
	direction,
}: {
	editor: Editor;
	settings: JumpSettings;
	app: App;
	direction: -1 | 1;
}) {
	const jumpItems = getJumpItems(app);
	if (!jumpItems?.length) return;

	const currentPosition = editor.getCursor();
	const currentItem = jumpItems.find(
		(item) => item.position.start.line === currentPosition.line
	);
	if (!currentItem) return;

	if (direction === -1) {
		const nearestItemIndex = jumpItems.findLastIndex(
			(item) =>
				item.level < currentItem.level &&
				item.position.start.line <= currentPosition.line
		);
		if (nearestItemIndex !== -1) {
			JumpToTarget(
				editor,
				jumpItems[nearestItemIndex].position.start.line
			);
		}
	} else if (direction === 1) {
		const currentItemIndex = jumpItems.findIndex(
			(item) => item.position.start.line === currentPosition.line
		);

		const nearestItemIndex = jumpItems.findIndex(
			(item, index) =>
				index > currentItemIndex &&
				item.level > currentItem.level &&
				item.position.start.line > currentPosition.line
		);

		if (nearestItemIndex !== -1) {
			JumpToTarget(
				editor,
				jumpItems[nearestItemIndex].position.start.line
			);
		}
	}
	return;
}

function getJumpItems(app: App) {
	const activeFile = app.workspace.getActiveFile();
	if (!activeFile) return undefined;

	const fileCache = app.metadataCache.getFileCache(activeFile);
	if (!fileCache) return undefined;

	const leveledListItems = fileCache.listItems?.map((item) => {
		return { ...item, level: item.position.start.col + 11 };
	});

	const jumpItems = [
		...(fileCache.headings ?? []),
		...(leveledListItems ?? []),
	];

	const sortedJumpItems = jumpItems.sort(
		(first, second) =>
			first.position.start.line - second.position.start.line
	);

	// console.log("sortedJumpItems: ", sortedJumpItems);
	return sortedJumpItems;
}

function JumpToTarget(editor: Editor, target: number, shouldSelection = true) {
	editor.setCursor(target);

	const newPosition = editor.getCursor();

	if (shouldSelection) {
		editor.setSelection({ ...newPosition, ch: 0 }, newPosition);
	}

	const range = editor.wordAt(newPosition) ?? {
		from: newPosition,
		to: newPosition,
	};
	editor.scrollIntoView(range, true);
}

interface PeerSlidingInListItemProps {
	position: Pos;
	level: number;
}

interface PeerSlidingInListProps {
	list: PeerSlidingInListItemProps[];
	currentIndex: number;
	direction: -1 | 1;
	isPeerJump: boolean;
	isStart: boolean;
}

function PeerSlidingInList({
	list,
	currentIndex,
	direction,
	isPeerJump,
	isStart,
}: PeerSlidingInListProps): number {
	const currentItem = list[currentIndex];

	const targetItem = list[currentIndex + direction];

	if (!isPeerJump) {
		if (targetItem) {
			return currentIndex + direction;
		} else {
			return -1;
		}
	}

	if (targetItem) {
		if (
			targetItem.position.start.line - currentItem.position.start.line ===
			direction
		) {
			return PeerSlidingInList({
				list,
				currentIndex: currentIndex + direction,
				direction,
				isPeerJump,
				isStart: false,
			});
		} else {
			if (isStart) {
				return currentIndex + direction;
			} else {
				return currentIndex;
			}
		}
	} else {
		return -1;
	}
}
