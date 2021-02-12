import React, { useRef, useCallback, useEffect, useReducer } from "react";

import "./mystyles.scss";

import { position } from "caret-pos";

interface Props {}

interface IState {
	tagStartIndex: number;
	tagInput: string;
	caretPosition: number;
	tagMode: boolean;
	tags: HTMLElement[]
}

type ACTIONTYPE =
  | { type: "setTagStartIndex"; payload: number }
  | { type: "setCaretPosition"; payload: {
	  height: number;
	  left: number;
	  top: number;
	  pos: number;
  }}
  | {type: "setTagInput"; payload: string}
  | {type: "setTagMode"; payload: boolean}
  | {type: "addTag"; payload: any} //TODO

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

	const {
		tagStartIndex,
		caretPosition,
		tagInput,
		tagMode,
		tags,
		
	} = state;

	const text = useRef(null);

	const removePattern = (prefixValue: string) => {

		//remove prefix value
		text.current.innerHTML = text.current.innerHTML.replace(
			`@${prefixValue}`,
			""
		);
	};

	//when @ pressed we take record
	//of caret
	useEffect(() => {
		if (tagMode) {
			dispatch({
				type: "setTagStartIndex",
				payload: caretPosition,
			});
		}
	}, [tagMode]);

	useEffect(() => {
		//when pressed @ enable tag mode
		if (text.current.textContent[caretPosition - 1] == '@') {
			dispatch({
				type: "setTagMode",
				payload: true,
			});
		}

		//if prefix removed disable tag mode
		if(tagMode && text.current.textContent[tagStartIndex - 1] != "@"){
			dispatch({
				type: "setTagMode",
				payload: false,
			});
		}


	}, [caretPosition]);


	const keyDownHandler = useCallback((evt: React.KeyboardEvent) => {
		//if you are in tag mode disable new line when press enter
		if (evt.keyCode == 13 && tagMode) {
			evt.preventDefault();
		}	 

	}, [tagMode]);

	//TODO
	// function setCaretPosition(pos) {

	// 	var sel; 
	// 	text.current.focus();
		
	// 	   sel = window.getSelection();
	// 	  sel.collapse(text.current.firstChild, pos);
		
	// }

	const injectHTMLAtCaret = useCallback((html: string) => { //TODO REFACTOR FOR OLDER BROWSERS
		var sel: Selection, range: Range;
		if (window.getSelection) { //checks if browser IE9 > and non-IE
			
			sel = window.getSelection(); //returns the current position of caret
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);
				range.deleteContents();
	
				
				var el = document.createElement("div") as HTMLDivElement;
				el.innerHTML = html;
				var frag = document.createDocumentFragment(), //we will append tags to this newly created empty object
						node: ChildNode, 
						lastNode: Node;
				while ( (node = el.firstChild) ) {
					lastNode = frag.appendChild(node);
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
		// } else if ( document.selection && document.selection.type != "Control" ) {
		// 	IE < 9
		// 	document.selection.createRange().pasteHTML( html );
		}
	}, [tagMode])

	const keyUpHandler = (evt: React.KeyboardEvent) => {
		const tagText = text.current.textContent;

		console.log(position(text.current));

		dispatch({
			type: "setCaretPosition",
			payload: position(text.current),
		});

		
		if(evt.keyCode == 13 && tagMode){ //if tag mode enabled and pressed enter
			// const lastCaretPosition = caretPosition + 8
			
			const newTag = tagText.slice(tagStartIndex, caretPosition); //get text between last caret position and prefix

			


			injectHTMLAtCaret(`<span
				class="test__span"
				contenteditable='false'
			>
				${newTag}
			</span>`)
	
			removePattern(newTag); //delete prefix value after adding tag
	
			dispatch({
				type: "setTagMode",
				payload: false,
			});
		}
		dispatch({
			type: "setTagInput",
			payload: text.current.textContent,
		});
		

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
				id='editable'
			>
				
			</div>

			<input readOnly value={tagInput} type='text' />
		</div>
	);
};

export default Tagcan;
