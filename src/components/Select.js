import React, { useState } from "react";

function Select({ value, onChange, onBlur, autofocus = true, options, classN, defaultText = 'Select option' }) {
  return (
    <select className={classN} value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} autoFocus={autofocus}>
        <option value="">{defaultText}</option>
        {options && options.map(opt => {
            return <option key={opt.val} value={opt.val}>{opt.text}</option>
        })}
    </select>
  );
}

export default Select;