import "./mystyles.scss";
import { generateText, getAllIndexes } from "./utils/helpers";
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
	changeHandler?: (inputValue: string) => void;
}

export default class MixedTagInput {
	editableMainDiv: HTMLDivElement;
	options: IOptions;
	caretPosition: number = 0;
	editMode: boolean = false;
	inputValue: string;
	tags: string[] = [];

	constructor(options: IOptions) {
		this.options = options;
	}

	initWithValue(defaultValue: string) {
		this.editableMainDiv = document.createElement("div");
		this.editableMainDiv.contentEditable = "true";
		this.editableMainDiv.classList.add("clTag__input");

		this.editableMainDiv.addEventListener("keyup", this.handleKeyUp);
		this.editableMainDiv.addEventListener("input", this.handleChange);
		this.editableMainDiv.addEventListener("blur", this.saveCaret);

		const container = document.querySelector(
			`.${this.options.containerClassName}`
		);
		container.appendChild(this.editableMainDiv);

		this.editableMainDiv.focus();

		//Injecting default values
		this.injectHTMLAtCaret(defaultValue);

		//checks if there are tags in default values
		this.validateString();
	}

	handleKeyUp = () => {
		this.validateString();
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

	addTag(search: string, tagDetail: string | Tag) {
		let sel: Selection = window.getSelection();

		let tagIndex: number;

		if (!sel.focusNode) {
			return;
		}

		
		//if duplicate not allowed wont proceed
		if (
			this.options.duplicate === false &&
			this.tags.indexOf(search) > -1
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

	validateString() {
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

	externalTag() {
		const editable = this.editableMainDiv;

		editable.focus();
		//places caret last saved position
		position(editable, this.caretPosition);

		const randomString = generateText(7);

		this.injectHTMLAtCaret(`{${randomString}}`);

		
		let endOfString = position(editable).pos;
		
		endOfString--;
		position(editable, endOfString);
		

		//When external string is inserted, Selection API
		//can't see this change.
		
		this.addTag(`{${randomString}}`, randomString);

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
					(sel.focusNode.parentNode as any).className === "clTag__tag-text"
				) {
					range.setStartAfter(sel.focusNode.parentNode.parentNode.parentNode);
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
