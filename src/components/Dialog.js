import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";

export default function Dialog({open, onClose, title = 'Dialog', autoFocus = true, children}) {
    const dialogRef = useRef(null);
    
    useEffect( () => {
        if (open && autoFocus && dialogRef.current) {
            var input = dialogRef.current.querySelector('input, textarea');
            if (input) input.focus();
        }
    }, [open, autoFocus]);
    
    if (!open) return null;
    return (
        <div id='fondo-dialog' onClick={onClose}>
            <div id='dialog' onClick={(e) => e.stopPropagation()} ref={dialogRef}>
                <div className="title">
                    <span>{title}</span>
                    <FontAwesomeIcon icon='xmark' onClick={onClose}/>    
                </div>
                <div className="dialog-content">
                    {children}
                </div>
            </div>
        </div>
    )
}