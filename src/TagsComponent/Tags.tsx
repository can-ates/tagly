import React, {
	useState,
	useRef,
	useCallback,
	useEffect,
	useReducer,
} from "react";

import "./mystyles.scss";

import { position } from "caret-pos";

interface Props {
	readOnly?: boolean;
}

const defaultProps = {
	readOnly: true,
};

interface IState {
	tagStartIndex: number;
	tagInput: string;
	caretPosition: number;
	tagMode: boolean;
	tags: HTMLElement[];
}

type ACTIONTYPE =
	| {
			type: "setCaretPosition";
			payload: {
				height: number;
				left: number;
				top: number;
				pos: number;
			};
	  }
	| { type: "setTagInput"; payload: string }
	| { type: "setTagMode"; payload: boolean }
	| { type: "addTag"; payload: any }; //TODO

const initialState: IState = {
	tagStartIndex: 0,
	tagInput: "",
	caretPosition: 0,
	tagMode: false,
	tags: [],
};

const reducer = (state: typeof initialState, action: ACTIONTYPE) => {
	switch (action.type) {
		case "setCaretPosition":
			return {
				...state,
				caretPosition: action.payload.pos,
			};
		case "setTagInput":
			return {
				...state,
				tagInput: action.payload,
			};
		case "setTagMode":
			return {
				...state,
				tagMode: action.payload,
			};
		case "addTag":
			return {
				...state,
				tags: [...state.tags, action.payload],
			};

		default:
			return state;
	}
};

const Tagcan: React.FunctionComponent<Props> = ({ readOnly }) => {
	const [editMode, setEditMode] = useState(false);
	const [state, dispatch] = useReducer(reducer, initialState);
	const { caretPosition, tagInput, tagMode, tags } = state;
	const text = useRef(null);

	const keyDownHandler = (evt: React.KeyboardEvent) => {
		//if you are in tag mode disable new line when press enter
		if (evt.keyCode == 13 && tagMode) {
			evt.preventDefault();
		}
	};

	const injectHTMLAtCaret = useCallback(
		(html: string) => {
			let sel: Selection, range: Range;

			if (window.getSelection) {
				//checks if browser IE9 > and non-IE
				sel = window.getSelection(); //returns the current position of caret
				if (sel.getRangeAt && sel.rangeCount) {
					range = sel.getRangeAt(0);

					range.deleteContents();

					let el = document.createElement("div") as HTMLDivElement;
					el.innerHTML = html;

					let tag = el.firstElementChild;

					if (!readOnly) {
						let tagText = tag.children[1].firstElementChild;
						tag.addEventListener("dblclick", () => {
							tag.classList.add("clTag__tag--editable");
							tagText.setAttribute("contenteditable", "true");
							(tagText as HTMLSpanElement).focus();
							setEditMode(true);
						});

						tagText.addEventListener("focusout", () => {
							tag.classList.remove("clTag__tag--editable");
							(tagText as HTMLSpanElement).blur();
							tagText.setAttribute("contenteditable", "false");
						});
					}

					let removeBtn = tag.children[0];
					removeBtn.addEventListener("click", () => {
						if (tag.parentNode && tag) {
							const range = window.getSelection().getRangeAt(0);
							range.selectNode(tag);
							range.deleteContents();
						}
					});

					let frag = document.createDocumentFragment(), //we will append tags to this newly created empty object
						node: ChildNode,
						lastNode: Node;
					while ((node = el.firstChild)) {
						lastNode = frag.appendChild(node);
					}
					console.log(node);
					range.insertNode(frag);

					// Preserve the selection
					if (lastNode) {
						range = range.cloneRange();
						range.setStartAfter(lastNode);
						range.collapse(true);
						sel.removeAllRanges();
						sel.addRange(range);
					}
				}
			} else if (
				//@ts-ignore
				document.selection &&
				//@ts-ignore
				document.selection.type != "Control"
			) {
				//IE < 9
				//@ts-ignore
				document.selection.createRange().pasteHTML(html);
			}
		},
		[tagMode]
	);

	function addTag(search: string, replace: string) {
		var sel = window.getSelection();
		if (!sel.focusNode) {
			return;
		}

		var startIndex = sel.focusNode.nodeValue.indexOf(search);
		var endIndex = startIndex + search.length;
		if (startIndex === -1) {
			return;
		}

		var range = document.createRange();
		//Set the range to contain search text
		range.setStart(sel.focusNode, startIndex - 1);
		range.setEnd(sel.focusNode, endIndex + 1);
		//Delete search text
		range.deleteContents();

		//Insert replace text
		injectHTMLAtCaret(replace);
	}

	const keyUpHandler = (evt: React.KeyboardEvent) => {
		const tagText = text.current.textContent;

		if (!editMode) {
			dispatch({
				type: "setCaretPosition",
				payload: position(text.current),
			});
		}

		if (tagText.match(/[^{\}]+(?=})/g)) {
			const newTag = tagText.match(/[^{\}]+(?=})/g)[0];
			addTag(
				newTag,
				`<div
					contenteditable='false'
					class="clTag__tag"
				>
					<span
						class="clTag__tag__removeBtn"
					>
					
					</span>
					<div>
						<span
							class="clTag__tag-text"
						>
							${newTag}
						</span>
					</div>
				</div>`
			);
		}

		dispatch({
			type: "setTagInput",
			payload: text.current.innerText,
		});
	};

	const test = () => {
		text.current.focus();

		let sel = window.getSelection();
		if ((sel as any).focusNode.nextElementSibling) {
			position(text.current, caretPosition);
		} else {
			position(text.current, caretPosition + 1);
		}

		injectHTMLAtCaret(
			`<div
				contenteditable='false'
				class="clTag__tag"
			>
				<span
					class="clTag__tag__removeBtn"
				>
					
				</span>
				<div>
					<span
						class="clTag__tag-text"
					>
						asd
					</span>
				</div>
		</div>`
		);

		dispatch({
			type: "setCaretPosition",
			payload: position(text.current),
		});
	};

	const saveCaret = () => {
		if (!editMode) {
			dispatch({
				type: "setCaretPosition",
				payload: position(text.current),
			});
		} else {
			setEditMode(false);
		}
	};

	return (
		<React.Fragment>
			<div className='clTag'>
				<div
					className='clTag__input'
					contentEditable='true'
					ref={text}
					onKeyUp={e => {
						keyUpHandler(e);
					}}
					onKeyDown={keyDownHandler}
					onBlur={saveCaret}
					id='editable'
				></div>
			</div>
			<div>
				<button onClick={test}>ADD</button>
				<textarea readOnly value={tagInput} />
			</div>
		</React.Fragment>
	);
};

Tagcan.defaultProps = defaultProps;
export default Tagcan;
