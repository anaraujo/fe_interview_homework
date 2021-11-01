import "./style.css";
import { createDOMNode } from "./utils";
import { onDrag } from "./dnd";

const dragme = createDOMNode(
	"div",
	{
		onmousedown: onDrag,
		className: "dragme rounded-md"
	},
	"Drag me"
);

document.querySelector("#drop-area-a").appendChild(dragme);
