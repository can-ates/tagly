import React, { useCallback, useEffect } from "react";

import "./mystyles.scss";
import MixedTagInput from "./cooltag";

interface Props {
	readOnly?: boolean;
	allowedTags?: {
		label: string;
		value: string;
	}[];
	mixed?: boolean;
	defaultValue?: string;
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

const MixedTagInputReactComponent: React.FunctionComponent<Props> = ({
	readOnly,
	allowedTags,
	defaultValue,
	containerClassName,
	innerRef,
	duplicate,
	onChange,
}) => {

	const changeHandler = useCallback((newValues: string) => {
		onChange && onChange(newValues)
	}, [])

	useEffect(() => {
		const coolTag = new MixedTagInput({
			containerClassName,
			readOnly,
			allowedTags,
			changeHandler,
			duplicate
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

MixedTagInputReactComponent.defaultProps = defaultProps;
export default MixedTagInputReactComponent;
