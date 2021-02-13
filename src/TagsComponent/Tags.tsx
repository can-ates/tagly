import React, { useRef, useCallback, useEffect, useReducer } from "react";

import "./mystyles.scss";

import { position, offset } from "caret-pos";

interface Props {}

interface IState {
	tagStartIndex: number;
	tagInput: string;
	caretPosition: number;
	tagMode: boolean;
	tags: HTMLElement[];
}

type ACTIONTYPE =
	| { type: "setTagStartIndex"; payload: number }
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
		case "setTagStartIndex":
			return {
				...state,
				tagStartIndex: action.payload,
			};
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

const Tagcan: React.FunctionComponent<Props> = () => {
	const [state, dispatch] = useReducer(reducer, initialState);

	const { tagStartIndex, caretPosition, tagInput, tagMode, tags } = state;

	const text = useRef(null);


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

		dispatch({
			type: "setCaretPosition",
			payload: position(text.current)
		})

		if(tagText.match(/[^{\}]+(?=})/g)){
			const newTag = tagText.match(/[^{\}]+(?=})/g)[0]
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
		text.current.focus()
		position(text.current, caretPosition)

		injectHTMLAtCaret(`<div
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
	</div>`)
	}

	const saveCaret = () => {
		dispatch({
			type: "setCaretPosition",
			payload: position(text.current)
		})
	}

	return (
		<div >
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
				<button onClick={test} >ADD</button>
			<input readOnly value={tagInput} type='text' />
		</div>
	);
};

export default Tagcan;
