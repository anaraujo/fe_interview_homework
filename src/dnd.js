import { Mediator } from "./mediator";
import { px, setNodeStyle, translate3d } from "./utils";

const dropAreaB = document.querySelector("#drop-area-b");

function reset(mediator) {
	document.removeEventListener("mousemove", mediator.receive);
	document.removeEventListener("mouseup", mediator.receive);
	mediator.setState("idle");
	document.body.removeChild(cachedDragImage);

	if (dropAreaB.hasChildNodes()) dropAreaB.removeChild(dropShadow);
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

const dndMediator = new Mediator("idle", {
	idle: {
		async mousedown(evt) {
			evt.preventDefault();
			evt.stopPropagation();

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
				opacity: 0.5
			});
			dropShadow = defaultDragObject(cachedCurrentTarget, {
				pointerEvents: "none",
				opacity: 0.2,
				backgroundColor: "gray"
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
			if (evt.path[0].id === "drop-area-b") {
				dropAreaB.appendChild(dropShadow);
			} else if (dropAreaB.hasChildNodes()) {
				dropAreaB.removeChild(dropAreaB.childNodes[0]);
			}

			setNodeStyle(cachedDragImage, {
				transform: translate3d(evt.clientX - cachedOffsetCoords[0], evt.clientY - cachedOffsetCoords[1])
			});
		},
		mouseup() {
			reset(dndMediator);
			dndMediator.setState("idle");
		}
	}
});

export function onDrag(evt) {
	dndMediator.receive(evt);
}
