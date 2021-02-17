import React, {
	useState,
	useRef,
	useCallback,
	useEffect,
	useReducer,
} from "react";

import "./mystyles.scss";

import { position } from "caret-pos";
import rangy from "rangy";

interface Props {
	readOnly?: boolean;
}

const defaultProps = {
	readOnly: true,
};

interface IState {
	tagInput: string;
	caretPosition: number;
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

const initialState: IState = {
	tagInput: "",
	caretPosition: 0,
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
		

		default:
			return state;
	}
};

const Tagcan: React.FunctionComponent<Props> = ({ readOnly }) => {
	const [state, dispatch] = useReducer(reducer, initialState);
	const { caretPosition, tagInput } = state;
	const text = useRef(null);

	useEffect(() => {
		// 	const contenteditable = document.getElementById("editable");
		// 	const observer = new MutationObserver(() => {
		// 		const tagText = text.current.textContent;
		// 		console.log('xd');
		// 		if (tagText.match(/[^{\}]+(?=})/g)) {
		// 			const newTag = tagText.match(/[^{\}]+(?=})/g)[0];
		// 			addTag(
		// 				newTag,
		// 				`<div
		// 					contenteditable='false'
		// 					class="clTag__tag"
		// 				>
		// 					<span
		// 						class="clTag__tag__removeBtn"
		// 					>
		// 					</span>
		// 					<div>
		// 						<span
		// 							class="clTag__tag-text"
		// 						>
		// 							${newTag}
		// 						</span>
		// 					</div>
		// 				</div>`,
		// 				caretPosition
		// 			);
		// 		}
		// 	});
		// 	observer.observe(contenteditable, {
		// 		subtree: true,
		// 		characterData: true
		// 	});
	}, []);

	useEffect(() => {
		// 	if (external) {
		// 		console.log(caretPosition);
		// 		position(text.current, caretPosition - 1);
		// 		addTag(
		// 			label,
		// 			`<div
		// 	contenteditable='false'
		// 	class="clTag__tag"
		// >
		// 	<span
		// 		class="clTag__tag__removeBtn"
		// 	>
		// 	</span>
		// 	<div>
		// 		<span
		// 			class="clTag__tag-text"
		// 		>
		// 			${label}
		// 		</span>
		// 	</div>
		// </div>`,
		// 		);
		// 		setLabel("");
		// 		setExternal(false)
		// 		position(text.current, caretPosition + 2);
		// 		dispatch({
		// 			type: "setCaretPosition",
		// 			payload: position(text.current)
		// 		})
		// 	}
	}, [caretPosition]);

	// const keyDownHandler = (evt: React.KeyboardEvent) => {
	// 	//if you are in tag mode disable new line when press enter
	// 	if (evt.keyCode == 13 && tagMode) {
	// 		evt.preventDefault();
	// 	}
	// };

	const injectHTMLAtCaret = (html: string) => {
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

				if (!readOnly && tag) {
					let tagText = tag.children[1].firstElementChild;
					tag.addEventListener("dblclick", () => {
						tag.classList.add("clTag__tag--editable");
						tagText.setAttribute("contenteditable", "true");
						(tagText as HTMLSpanElement).focus();
					});

					tagText.addEventListener("focusout", () => {
						tag.classList.remove("clTag__tag--editable");
						(tagText as HTMLSpanElement).blur();
						tagText.setAttribute("contenteditable", "false");
					});
				}

				let removeBtn = tag?.children[0];

				if (removeBtn) {
					removeBtn.addEventListener("click", () => {
						if (tag.parentNode && tag) {
							const range = window.getSelection().getRangeAt(0);
							range.selectNode(tag);
							range.deleteContents();
						}
					});
				}

				let frag = document.createDocumentFragment(), //we will append tags to this newly created empty object
					node: ChildNode,
					lastNode: Node;
				while ((node = el.firstChild)) {
					lastNode = frag.appendChild(node);
				}

				if (caretPosition != 0) {
					const cl = caretPosition - 1;
					position(text.current, cl);
				}

				if (
					(sel.focusNode.parentNode as any).className === "clTag__tag"
				) {
					range.setStartAfter(sel.focusNode.parentNode);
				}

				range.collapse(false);
				range.insertNode(frag);

				// Preserve the selection
				if (lastNode) {
					range = range.cloneRange();
					range.setStartAfter(lastNode);
					range.collapse(false);
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
	};

	function addTag(search: string, replace: string) {
		let sel = window.getSelection();

		if (!sel.focusNode) {
			return;
		}

		let startIndex = sel.focusNode.nodeValue.indexOf(search);
		let endIndex = startIndex + search.length;
		if (startIndex === -1) {
			return;
		}

		let range = document.createRange();

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
		console.log(window.getSelection());
		dispatch({
			type: "setCaretPosition",
			payload: position(text.current),
		});

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

	//TODO WILL BE DELETED
	function generateText(length) {
		var result = "";
		var characters =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(
				Math.floor(Math.random() * charactersLength)
			);
		}
		return result;
	}

	const externalTag = () => {
		text.current.focus();
		position(text.current, caretPosition);
		const randomString = generateText(7);

		console.log(rangy);

		injectHTMLAtCaret(`{${randomString}}`);

		let endOfString = position(text.current).pos;
		endOfString--;
		position(text.current, endOfString);

		addTag(
			randomString,
				`<div
					contenteditable='false'
					class="clTag__tag"
					tabindex='-1'
				>
					<span
						class="clTag__tag__removeBtn"
					>
	
					</span>
					<div>
						<span
							class="clTag__tag-text"
						>
							${randomString}
						</span>
					</div>
				</div>`
		);

		// let last = position(text.current);
		// last.pos++;

		// position(text.current, last.pos);

		dispatch({
			type: "setCaretPosition",
			payload: position(text.current),
		});
	};

	// const test = () => {
	// 	text.current.focus();
	// 	let sel = window.getSelection();
	// 	let range = sel.getRangeAt(0);

	// 	const cl = caretPosition - 1;
	// 	position(text.current, cl);
	// 	console.log(sel.focusNode);
	// };

	const saveCaret = () => {
		dispatch({
			type: "setCaretPosition",
			payload: position(text.current),
		});
		
	};

	return (
		<React.Fragment>
			<div className='clTag' tabIndex={-1}>
				<div
					className='clTag__input'
					contentEditable='true'
					ref={text}
					onKeyUp={e => {
						keyUpHandler(e);
					}}
					// onKeyDown={keyDownHandler}
					onBlur={saveCaret}
					// onClick={test}
					id='editable'
				></div>
			</div>
			<div>
				<button onClick={externalTag}>ADD</button>
				<textarea readOnly value={tagInput} />
			</div>
		</React.Fragment>
	);
};

Tagcan.defaultProps = defaultProps;
export default Tagcan;
