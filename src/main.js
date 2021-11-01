import "./style.css";
import { createDOMNode } from "./utils";
import { onDrag } from "./dnd";

const dragme = createDOMNode(
	"div",
	{
		onmousedown: onDrag,
		className: "dragme px-2 py-4 rounded-md"
	},
	"Drag me"
);

document.querySelector("#drop-area-a").appendChild(dragme);
