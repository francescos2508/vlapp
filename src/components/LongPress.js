import { useRef } from "react";


export default function LongPress({onLongPress, children, duration = 500}) {
    const timeRef = useRef(null);

    const start = (e) => {
        timeRef.current = setTimeout(() => onLongPress(e), duration);
    }

    const stop = () => {
        clearTimeout(timeRef.current);
    }

    return (
      <div
        onMouseDown={start}
        onMouseUp={stop}
        onTouchStart={start}
        onTouchEnd={stop}
      >
        {children}
      </div>  
    );
}