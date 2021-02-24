import React, { useCallback, useEffect } from "react";

import "./mystyles.scss";
import TagInput from "./cooltag";

interface Props {
	readOnly?: boolean;
	allowedTags?: {
		label: string;
		value: string;
	}[];
	mixed?: boolean;
	defaultValue?: string | string[];
	containerClassName?: string;
	innerRef?: any;
	duplicate?: boolean
	onChange?: (inputValue: string) => void;
}

const defaultProps = {
	readOnly: true,
	allowedTags: [],
	mixed: true,
	defaultValue: "",
	containerClassName: "clTag",
	duplicate: true
};

const TaglyReactComponent: React.FunctionComponent<Props> = ({
	readOnly,
	allowedTags,
	defaultValue,
	containerClassName,
	innerRef,
	duplicate,
	onChange,
	mixed
}) => {

	const changeHandler = useCallback((newValues: string) => {
		onChange && onChange(newValues)
	}, [])

	useEffect(() => {
		const coolTag = new TagInput({
			containerClassName,
			readOnly,
			allowedTags,
			changeHandler,
			duplicate,
			mixed
		});

		coolTag.initWithValue(defaultValue);

		innerRef.current = coolTag;

		

		return () => {
			coolTag.destroy();
		};
	}, []);

	return (
		<React.Fragment>
			<div className='clTag'></div>
		</React.Fragment>
	);
};

TaglyReactComponent.defaultProps = defaultProps;
export default TaglyReactComponent;
