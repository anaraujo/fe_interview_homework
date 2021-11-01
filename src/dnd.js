import { Mediator } from "./mediator";
import { px, setNodeStyle, translate3d } from "./utils";

const validColumns = [ "drop-area-a", "drop-area-b" ];

function hasColumnChanged(evt) {
	const currentTarget = evt.target;
	const isValidColumn = !!(currentTarget.id && validColumns.includes(targetColumn.id));

	return !!(isValidColumn && originColumn !== currentTarget);
}

function reset(mediator) {
	document.removeEventListener("mousemove", mediator.receive);
	document.removeEventListener("mouseup", mediator.receive);
	mediator.setState("idle");
	document.body.removeChild(cachedDragImage);

	if (targetColumn.hasChildNodes()) targetColumn.removeChild(dropShadow);
}

function defaultDragObject(node, style) {
	const clone = node.cloneNode(true);
	setNodeStyle(clone, style);
	return clone;
}

let cachedCurrentTarget;
let cachedOffsetCoords;
let cachedDragImage;
let dropShadow;
var originColumn;
var targetColumn;

const dndMediator = new Mediator("idle", {
	idle: {
		async mousedown(evt) {
			evt.preventDefault();
			evt.stopPropagation();

			const originId = evt.path[1].id;
			const targetId = validColumns.find((e) => e !== originId);

			originColumn = document.getElementById(originId);
			targetColumn = document.getElementById(targetId);

			cachedCurrentTarget = evt.currentTarget;
			const rect = cachedCurrentTarget.getBoundingClientRect();
			const offsetX = evt.clientX - rect.left;
			const offsetY = evt.clientY - rect.top;
			cachedOffsetCoords = [ offsetX, offsetY ];
			cachedDragImage = defaultDragObject(cachedCurrentTarget, {
				willChange: "transform",
				position: "fixed",
				pointerEvents: "none",
				top: 0,
				left: 0,
				opacity: 0.5,
				backgroundColor: "#564260"
			});
			dropShadow = defaultDragObject(cachedCurrentTarget, {
				pointerEvents: "none",
				color: "#7a43f3",
				backgroundColor: "rgba(122, 67, 243, .1)",
				border: "1px dashed #7a43f3"
			});

			setNodeStyle(cachedDragImage, {
				transform: translate3d(rect.left, rect.top),
				width: px(rect.width),
				height: px(rect.height)
			});

			document.addEventListener("mousemove", dndMediator.receive);
			document.addEventListener("mouseup", dndMediator.receive);

			dndMediator.setState("dragging");

			await Promise.resolve();
			document.body.appendChild(cachedDragImage);
		}
	},
	dragging: {
		mousemove(evt) {
			if (hasColumnChanged(evt)) {
				targetColumn.appendChild(dropShadow);
			} else if (targetColumn.hasChildNodes()) {
				targetColumn.removeChild(targetColumn.childNodes[0]);
			}

			setNodeStyle(cachedDragImage, {
				transform: translate3d(evt.clientX - cachedOffsetCoords[0], evt.clientY - cachedOffsetCoords[1])
			});
		},
		mouseup(evt) {
			if (hasColumnChanged(evt)) targetColumn.appendChild(cachedCurrentTarget);
			reset(dndMediator);
			dndMediator.setState("idle");
		}
	}
});

export function onDrag(evt) {
	dndMediator.receive(evt);
}
