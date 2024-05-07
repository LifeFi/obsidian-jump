import { App, Editor, Pos } from "obsidian";

export function getJumpItems(app: App) {
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

export function JumpToTarget(
	editor: Editor,
	target: number,
	shouldSelection = true
) {
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

export interface PeerSlidingInListItemProps {
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

export function PeerSlidingInList({
	list,
	currentIndex,
	direction,
	isPeerJump,
	isStart,
}: PeerSlidingInListProps): number {
	const currentItem = list[currentIndex];
	if (direction === -1) {
		const previousItem = list[currentIndex - 1];

		if (!isPeerJump) {
			if (previousItem) {
				return currentIndex - 1;
			} else {
				return -1;
			}
		}

		if (previousItem) {
			if (
				previousItem.position.start.line -
					currentItem.position.start.line ===
				-1
			) {
				return PeerSlidingInList({
					list,
					currentIndex: currentIndex - 1,
					direction,
					isPeerJump,
					isStart: false,
				});
			} else {
				if (isStart) {
					return currentIndex - 1;
				} else {
					return currentIndex;
				}
			}
		} else {
			return -1;
		}
	} else if (direction === 1) {
		// console.log("currentIndex: ", currentIndex);

		const nextItem = list[currentIndex + 1];

		if (!isPeerJump) {
			if (nextItem) {
				return currentIndex + 1;
			} else {
				return -1;
			}
		}
		// console.log("nextItem: ", nextItem);

		if (nextItem) {
			if (
				nextItem.position.start.line -
					currentItem.position.start.line ===
				1
			) {
				return PeerSlidingInList({
					list,
					currentIndex: currentIndex + 1,
					direction,
					isPeerJump,
					isStart: false,
				});
			} else {
				if (isStart) {
					return currentIndex + 1;
				} else {
					return currentIndex;
				}
			}
		} else {
			return -1;
		}
	}
	return -1;
}
