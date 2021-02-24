import "./mystyles.scss";
import { getAllIndexes } from "./utils/helpers";
import { position } from "caret-pos";

interface Tag {
	label: string;
	value: string;
}

interface IOptions {
	containerClassName?: string;
	readOnly?: boolean;
	allowedTags?: Tag[];
	duplicate?: boolean;
	mixed?: boolean;
	changeHandler?: (inputValue: string) => void;
}

export default class TagInput {
	editableMainDiv: HTMLDivElement;
	options: IOptions;
	caretPosition: number = 0;
	editMode: boolean = false;
	inputValue: string;
	tags: string[] = [];

	constructor(options: IOptions) {
		this.options = options;
	}

	initWithValue(defaultValue: string | string[]) {
		this.editableMainDiv = document.createElement("div");
		this.editableMainDiv.contentEditable = "true";
		this.editableMainDiv.classList.add("clTag__input");

		const isMixed = this.options.mixed;
		const allowedTags = this.options.allowedTags;

		isMixed &&
			this.editableMainDiv.addEventListener(
				"keyup",
				this.handleMixedKeyUp
			);

		!isMixed &&
			this.editableMainDiv.addEventListener("click", this.handleClick);

		!isMixed &&
			this.editableMainDiv.addEventListener(
				"keydown",
				this.handleKeyDown
			);
		this.editableMainDiv.addEventListener("input", this.handleChange);
		isMixed && this.editableMainDiv.addEventListener("blur", this.saveCaret);

		const container = document.querySelector(
			`.${this.options.containerClassName}`
		);
		container.appendChild(this.editableMainDiv);

		this.editableMainDiv.focus();

		//Injecting default values
		Array.isArray(defaultValue)
			? defaultValue.map(value => {
					if (allowedTags.length > 0) {
						allowedTags.forEach(allowed => {
							if (allowed.value === value) {
								this.addTag(value, allowed);
							} else {
								return;
							}
						});
					} else {
						this.addTag(value, value);
					}
			  })
			: this.injectHTMLAtCaret(defaultValue);

		//checks if there are tags in default values
		isMixed && this.validateMixedString();
	}

	//basically places caret at end to accomplish the
	//purpose of tag-only input
	handleClick = () => {
		console.log("asd");
		const editable = this.editableMainDiv;
		editable.focus();

		//checks for browser support
		if (
			typeof window.getSelection != "undefined" &&
			typeof document.createRange != "undefined" &&
			!this.editMode
		) {
			let sel = window.getSelection();
			let range = document.createRange();
			//if caret is not over text or distance of caret from tag is 0
			if (sel.focusNode.nodeType == 1 || sel.focusOffset == 0) {
				range.selectNodeContents(editable);
				range.collapse(false); //this sets caret to end
				sel.removeAllRanges();
				sel.addRange(range);
			}

			//@ts-ignore
		} else if (
			//@ts-ignore
			typeof document.body.createTextRange != "undefined" &&
			!this.editMode
		) {
			//@ts-ignore
			let textRange = document.body.createTextRange();
			textRange.moveToElementText(editable);
			textRange.collapse(false);
			textRange.select();
		}
	};

	handleKeyDown = (e: KeyboardEvent) => {
		let sel: Selection = window.getSelection();

		if (
			e.code === "ArrowLeft" &&
			(sel.focusOffset == 0 || sel.focusNode.nodeType == 1)
		) {
			e.preventDefault();
		}
		//prevents starting a new line in tag-only input
		if (e.code === "Enter") {
			e.preventDefault();
			const text = sel.focusNode.nodeValue;

			this.convertText(text);
		}
	};

	handleMixedKeyUp = () => {
		this.validateMixedString();
	};

	handleChange = () => {
		const mixedTags = this.editableMainDiv.childNodes;

		let parsedNodes = [];

		mixedTags.forEach((el: Node) => {
			if (el.firstChild) {
				parsedNodes.push(
					(el as HTMLDivElement).attributes["name"].nodeValue
				);
			} else {
				parsedNodes.push((el as Text).data);
			}
		});
		this.inputValue = parsedNodes.join("");
		this.options.changeHandler(parsedNodes.join(""));
	};

	convertText(text: string) {
		const editable = this.editableMainDiv;

		//when text losing focus, focusNode become null.
		//we set caret position to get text again.
		if (text == null) {
			position(editable, position(editable).pos);
			let sel = window.getSelection();
			this.convertText(sel.focusNode.nodeValue);
		}

		if (text?.length > 0) {
			const allowedTags = this.options.allowedTags;
			if (allowedTags.length > 0) {
				allowedTags.forEach(allowed => {
					if (allowed.value === text) {
						this.addTag(text, allowed);
					} else {
						return;
					}
				});
			} else {
				this.addTag(text, text);
			}
		}
	}

	addTag(search: string, tagDetail: string | Tag) {
		let sel: Selection = window.getSelection();

		let tagIndex: number;

		if (!sel.focusNode) {
			return;
		}

		//if duplicate not allowed wont proceed
		if (
			this.options.duplicate === false &&
			(this.tags.indexOf(search) > -1 ||
				this.tags.indexOf(`{${search}}`) > -1)
		) {
			return;
		}

		//finds index of the pattern
		if (sel.focusNode.nodeValue?.indexOf(search) >= 0) {
			tagIndex = sel.focusNode.nodeValue.indexOf(search);
		} else {
			//In default values, there may be duplicated tag
			//so each time, we are inserting the last one to avoid error
			//!Just because defaultValues are inserted externally
			//!Selection API can't access focusNode
			//!So, we manipulate innerText of our editable div
			const indexes = getAllIndexes(
				this.editableMainDiv.innerText,
				search
			);
			const lastItem = indexes[indexes.length - 1];

			position(this.editableMainDiv, lastItem);
			tagIndex = lastItem;
		}

		let startIndex = tagIndex;
		let endIndex = startIndex + search.length;
		if (startIndex === -1) {
			return;
		}

		let range = document.createRange();

		//Set the range which contains search text
		range.setStart(sel.focusNode, startIndex);
		range.setEnd(sel.focusNode, endIndex);
		//Delete search text
		range.deleteContents();

		const tag = this.generateTag(tagDetail);

		//Insert replace text
		this.injectHTMLAtCaret(tag);
	}

	generateTag(tagDetail: any) {
		const label = tagDetail?.label;
		const value = tagDetail?.value;

		let tagContainer = document.createElement("div");
		tagContainer.contentEditable = "false";
		tagContainer.classList.add("clTag__tag");
		tagContainer.setAttribute("name", `{${value ?? tagDetail}}`);
		//
		//FUTURE OPTIONS MAY BE ADDED
		//
		let removeBtn = document.createElement("span");
		removeBtn.classList.add("clTag__tag__removeBtn");

		let tag = document.createElement("div");
		let tagText = document.createElement("span");
		tagText.classList.add("clTag__tag-text");
		tagText.innerText = label ?? tagDetail;

		tagContainer.appendChild(removeBtn);
		tagContainer.appendChild(tag);
		tag.appendChild(tagText);

		//TAG STRUCTURE
		//<div
		// 	contenteditable='false'
		// 	class="clTag__tag"
		//>
		// 		<span
		// 			class="clTag__tag__removeBtn"
		//		>
		// 		</span>
		// 		<div>
		// 			<span
		// 				class="clTag__tag-text"
		// 			>
		// 				TEXT
		// 			</span>
		// 		</div>
		//</div>`

		//saving tags
		this.tags.push(`{${value ?? tagDetail}}`);

		return tagContainer;
	}

	validateMixedString() {
		const editableText = this.editableMainDiv.innerText;
		const allowedTags = this.options.allowedTags;

		if (editableText.match(/\{([^}]+)\}/g)) {
			const tags = editableText.match(/\{([^}]+)\}/g);

			for (let i = tags.length - 1; i != -1; i--) {
				const newTag = tags[i].slice(1, -1);

				if (allowedTags.length > 0) {
					allowedTags.forEach(allowed => {
						if (allowed.value === newTag) {
							this.addTag(`{${allowed.value}}`, allowed);
						} else {
							return;
						}
					});
				} else {
					this.addTag(`{${newTag}}`, newTag);
				}
			}
		}
	}

	externalTag(newTag: string) {
		const editable = this.editableMainDiv;

		editable.focus();
		//places caret last saved position
		position(editable, this.caretPosition);

		this.injectHTMLAtCaret(newTag);

		let endOfString = position(editable).pos;

		endOfString--;
		position(editable, endOfString);

		//When external string is inserted, Selection API
		//can't see this change.

		this.validateMixedString();

		this.caretPosition = position(editable).pos;
	}

	setAttributes(tag: Element) {
		if (!this.options.readOnly && tag) {
			let tagText = tag.children[1].firstElementChild;
			tag.addEventListener("dblclick", () => {
				tag.classList.add("clTag__tag--editable");
				tagText.setAttribute("contenteditable", "true");
				(tagText as HTMLSpanElement).focus();
				this.editMode = true;
			});

			tagText.addEventListener("focusout", () => {
				tag.classList.remove("clTag__tag--editable");
				(tagText as HTMLSpanElement).blur();
				tagText.setAttribute("contenteditable", "false");
			});

			tagText.addEventListener("input", (e: InputEvent) => {
				console.log(e);
			});
		}

		let removeBtn = tag?.children[0];

		if (removeBtn) {
			removeBtn.addEventListener("click", () => {
				if (tag.parentNode && tag) {
					//removing from "tags" array
					this.tags.splice(
						this.tags.indexOf(tag.getAttribute("name")),
						1
					);

					const range = window.getSelection().getRangeAt(0);
					range.selectNode(tag);
					range.deleteContents();
				}
			});
		}
	}

	injectHTMLAtCaret(html: HTMLDivElement | string) {
		let sel: Selection, range: Range;

		if (window.getSelection) {
			//checks if browser IE9 > and non-IE
			sel = window.getSelection(); //creates Selection
			if (sel.getRangeAt && sel.rangeCount) {
				range = sel.getRangeAt(0);

				range.deleteContents();

				let el = document.createElement("div") as HTMLDivElement;
				(el as any).innerHTML =
					typeof html === "string"
						? html
						: (html as HTMLDivElement).outerHTML;

				let tag = el.firstElementChild;

				//check whether inserted Node is Tag or Text
				if (tag) {
					this.setAttributes(tag);
				}

				//we will append tags to this newly created empty fragment
				//createDocumentFragment does not have any effect on DOM
				let frag = document.createDocumentFragment(),
					node: ChildNode,
					lastNode: Node;
				while ((node = el.firstChild)) {
					lastNode = frag.appendChild(node);
				}

				//Before the insertion, we first must check previos position
				//of the caret.
				if (this.caretPosition != 0) {
					//Omitting first position
					const cl = this.caretPosition - 1;
					position(this.editableMainDiv, cl); //moves caret left by 1
				}

				//If there is a tag element, we insert newly created
				//tag after this tag.
				//!If we don't, it adds the tag inside other tag

				if (
					//TODO use better comparison
					(sel.focusNode.parentNode as any).className ===
					"clTag__tag-text"
				) {
					range.setStartAfter(
						sel.focusNode.parentNode.parentNode.parentNode
					);
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
	}

	//to be able to insert external tag
	//we must store last position of caret
	saveCaret = () => {
		const editable = this.editableMainDiv;

		if (!this.editMode) {
			this.caretPosition = position(editable).pos;
		} else {
			this.editMode = false;
		}
	};

	//prevents rendering new object by any changes made in component
	destroy() {
		this.editableMainDiv.remove();
	}
}
