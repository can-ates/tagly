import React, {
	useState,
	useRef,
} from "react";

import "./mystyles.scss";

import { position } from "caret-pos";

interface Props {
	readOnly?: boolean;
	allowedTags?: {
		label: string;
		value: string;
	}[];
	mixed?: boolean;

}

const defaultProps = {
	readOnly: true,
	allowedTags: [],
	mixed: true,
	
};

const Tagcan: React.FunctionComponent<Props> = ({ readOnly, allowedTags}) => {
	const [editMode, setEditMode] = useState(false);
	const [caretPosition, setCaretPosition] = useState(0)
	const [tagInput, setTagInput] = useState('')
	
	const text = useRef(null);


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
						setEditMode(true);
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

				
				//Before the insertion, we first must check previos position
				//of the caret. 
				if (caretPosition != 0) { //Omitting first position
					const cl = caretPosition - 1;
					position(text.current, cl); //this returns previos position
				}

				//If there is a tag element, we insert newly created
				//tag after this tag.
				//!If we don't, it adds the tag inside other tag
				if (
					//TODO use better comparison
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

		//finds the pattern
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
		
		setCaretPosition(position(text.current).pos)

		// console.log(tagText.match(/\{([^}]+)\}/g));
		// /[^{\}]+(?=})/g

		//TODO Replace with better regex :P
		if (tagText.match(/\{([^}]+)\}/g)) {
			const newTag = tagText.match(/\{([^}]+)\}/g)[0]

			//TODO REPLACE WITH RECURSIVE CALL FOR MULTIPLE INSERTION
			if (allowedTags.length > 0) {
				
				console.log(newTag);
					allowedTags.forEach(tag => {
						if (tag.label === newTag.slice(1,-1)) {
							addTag(
								newTag.slice(1,-1),
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
											${newTag.slice(1,-1)}
										</span>
									</div>
								</div>`
							);
						}
					});
				
			} else {
				
					addTag(
						newTag.slice(1,-1),
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
									${newTag.slice(1, -1)}
								</span>
							</div>
						</div>`
					);
				
			}
		}

		setTagInput(text.current.innerText)
	};

	const pasteHandler = () => {
		console.log('Paste');
	}

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

		setCaretPosition(position(text.current).pos)
	};


	const saveCaret = () => {
		if (!editMode) {
			setCaretPosition(position(text.current).pos)
		} else {
			setEditMode(false);
		}
	};

	return (
		<React.Fragment>
			<div data-testid="xd" className='clTag' tabIndex={-1}>
				<div
					className='clTag__input'
					contentEditable='true'
					ref={text}
					onKeyUp={e => {
						keyUpHandler(e);
					}}
					// onKeyDown={keyDownHandler}
					onBlur={saveCaret}
					onPaste={pasteHandler}
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
