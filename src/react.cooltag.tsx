import React, { useRef, useEffect } from "react";

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
}

const defaultProps = {
	readOnly: true,
	allowedTags: [],
	mixed: true,
	defaultValue: "",
	containerClassName: "clTag",
};

const MixedTagInputReactComponent: React.FunctionComponent<Props> = ({
	readOnly,
	allowedTags,
	defaultValue,
	containerClassName,
	innerRef,
}) => {
	// const coolTagRef = useRef(innerRef)

	useEffect(() => {
		const coolTag = new MixedTagInput({
			containerClassName,
			readOnly,
			allowedTags
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
