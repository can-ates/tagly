import React from "react";

import "./mystyles.scss";
import ContentEditable from 'react-contenteditable'

interface Props {
  lol: string
}

const TagCan: React.FC<Props> = ({ lol }) => {
  const text = React.useRef(null)

  const handleChange = (evt) => {
    text.current = evt.target.value;
  }

  return (
  <div
    
  >
    <ContentEditable onChange={handleChange} html={text.current} />
    <p>{lol}</p>
  </div>
)};

export default TagCan;
