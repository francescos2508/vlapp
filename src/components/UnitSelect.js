import React, { useState } from "react";

function UnitSelect({ value, onChange, onBlur, autofocus = true, classN }) {
  return (
    <select className={classN} value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} autoFocus={autofocus}>
      <option value="">Select unit</option>
      <option value="g">g</option>
      <option value="kg">kg</option>
      <option value="oz">oz</option>
      <option value="lb">lb</option>
      <option value="ml">ml</option>
      <option value="l">l</option>
      <option value="cup">cup</option>
      <option value="tbsp">tbsp</option>
      <option value="tsp">tsp</option>
      <option value="pc">pc</option>
      <option value="div">div</option>    {/* divider for sections */}
    </select>
  );
}

export default UnitSelect;