import { useState } from "react"
/* @buttons: [{val: string, text: string, onclick: function}, {...}] */
export default function Switch ({buttons = [], id}) {
    const [active, setActive] = useState(buttons[0]?.val);

    const handleClick = (btn) => {
        setActive(btn.val);
        if (btn.onclick && typeof btn.onclick === 'function') btn.onclick(btn);
    }

    return (
        <div className="basic-switch" id={id} style={{'--buttons': buttons.length}}>
            <div className="indicator" style={{transform: `translateX(${buttons.findIndex(b => b.val === active) * 100}%)`}}/>
            {buttons.map( (btn) => {
                return <div className={active === btn.val ? "basic-switch-btn active" : "basic-switch-btn"} onClick={() => handleClick(btn)} key={btn.val}>
                    <span>{btn.text}</span>
                </div>
            })}
        </div>
    )
}