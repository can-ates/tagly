import React, { useState, useRef, useCallback, useEffect, useReducer } from "react";

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

const Tagcan: React.FunctionComponent<Props> = ({
	readOnly,

}) => {
	const [editMode, setEditMode] = useState(false)
	const [state, dispatch] = useReducer(reducer, initialState);
	const { caretPosition, tagInput, tagMode, tags } = state;
	const text = useRef(null);

	useEffect(() => {
		
		if (!readOnly) {
			document.querySelectorAll(".test__span").forEach(item => {
				item.addEventListener("dblclick", () => {
					setEditMode(true)
					item.setAttribute("contenteditable", "true");
					(item as HTMLSpanElement).focus()
				});

				// item.addEventListener("click", event => {
				// 	if(item.parentNode && item){
				// 		const range = window.getSelection().getRangeAt(0)
				// 		range.selectNode(item)
				// 		range.deleteContents()
				// 	}
					
				// });

				item.addEventListener("focusout", () => {
					(item as HTMLSpanElement).blur()
					item.setAttribute("contenteditable", "false");
					
				});
			});
		}
	}, [caretPosition]);

	const keyDownHandler = (evt: React.KeyboardEvent) => {
		//if you are in tag mode disable new line when press enter
		if (evt.keyCode == 13 && tagMode) {
			evt.preventDefault();
		}
	};

	const injectHTMLAtCaret = useCallback(
		(html: string) => {
			//TODO REFACTOR FOR OLDER BROWSERS
			var sel: Selection, range: Range;

			if (window.getSelection) {
				//checks if browser IE9 > and non-IE
				sel = window.getSelection(); //returns the current position of caret
				if (sel.getRangeAt && sel.rangeCount) {
					range = sel.getRangeAt(0);
					console.log(range);
					range.deleteContents();
					console.log(range);

					var el = document.createElement("div") as HTMLDivElement;
					el.innerHTML = html;
					var frag = document.createDocumentFragment(), //we will append tags to this newly created empty object
						node: ChildNode,
						lastNode: Node;
					while ((node = el.firstChild)) {
						console.log(el.firstChild);
						lastNode = frag.appendChild(node);
						console.log(lastNode);
					}

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

	function addTag(search, replace) {
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

		
		

		if(!editMode){
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
					class="tag"
				>
					<div>
						<span
						class="test__span"
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
		position(text.current, caretPosition);

		

		injectHTMLAtCaret(
		`<div
			contenteditable='false'
			class="tag"
		>
			<div>
				<span
				class="test__span"
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
		
		

		if(!editMode){
			dispatch({
				type: "setCaretPosition",
				payload: position(text.current),
			});
		} else {
			setEditMode(false)
		}
		
	};

	return (
		<div>
			<div
				className='tag__input'
				contentEditable='true'
				ref={text}
				onKeyUp={e => {
					keyUpHandler(e);
				}}
				onKeyDown={keyDownHandler}
				onBlur={saveCaret}
				id='editable'
			></div>
			<button onClick={test}>ADD</button>
			<input readOnly value={tagInput} type='text' />
		</div>
	);
};

Tagcan.defaultProps = defaultProps
export default Tagcan;
