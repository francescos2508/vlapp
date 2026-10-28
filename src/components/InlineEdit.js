import React, { useEffect, useState } from "react";
import UnitSelect from "./UnitSelect";

function InlineEdit({ value, onChange, parms }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const index = parms?.index;
  const field = parms?.field;
  const classNamep = parms?.classNamep;
  const type = parms?.type;
  const htmltype = parms?.htmltype;
  useEffect(() => {
    setText(value);
  }, [value]);

  function handleBlur() {
    setIsEditing(false);
    onChange(field, text, index);
  }

  return isEditing ? (
    type === "unitselect" ? (
      <UnitSelect value={text} onChange={val => setText(val)} onBlur={handleBlur} autofocus={true} />
    ) : (
      <input
        style={{position: 'relative'}}
        type={type}
        autoFocus
        value={text}
        onFocus={(e) => e.target.select()}
        onChange={e => setText(e.target.value)}
        onBlur={handleBlur}
      />
    )
  ) : (
    <span className={classNamep} onClick={() => setIsEditing(true)}>
      {text}
    </span>
  );
}

export default InlineEdit;
