import React, { useCallback, useEffect } from "react";

import "./mystyles.scss";
import Tagly from "./tagly";

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
	containerClassName: "tagly",
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
		const tagly = new Tagly({
			containerClassName,
			readOnly,
			allowedTags,
			changeHandler,
			duplicate,
			mixed
		});

		tagly.initWithValue(defaultValue);

		innerRef.current = tagly;	

		return () => {
			tagly.destroy();
		};
	}, []);

	return (
		<React.Fragment>
			<div className='tagly'></div>
		</React.Fragment>
	);
};

TaglyReactComponent.defaultProps = defaultProps;
export default TaglyReactComponent;
