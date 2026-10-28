import React, { useState, useEffect, setNodeRef, swipeHandlers, listeners } from "react";
import "./SwipeToDeleteItem.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSortable } from "@dnd-kit/sortable";

export default function SwipeToDeleteItem({ children, onDelete, onClick, classes, elkey, draggable = false, id, onEdit, searchField }) {
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenLeft, setIsOpenLeft] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const isSwipable = onDelete !== undefined || onEdit !== undefined;

    // for sortable
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const isDragging = Boolean(transform);

    // Touch
    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX);
        setStartY(e.touches[0].clientY);
        setIsScrolling(false);
    }
    const handleTouchMove = (e) => {
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            setIsScrolling(true);
            return;
        }
        if (isScrolling) return;
        if (deltaX < 0) {
            // we open right part
            if (!isOpenLeft) setTranslateX(Math.max(deltaX, -80)); else setTranslateX(0);
        }
        if (deltaX > 0 && onEdit) {
            // we open left part
            if (!isOpen) setTranslateX(Math.max(deltaX, 80)); else setTranslateX(0);
        }
    };
    const handleTouchEnd = () => {
        if (isScrolling) return;
        if (translateX < -50 && !isOpenLeft) { 
            setTranslateX(-80);
            setIsOpen(true); 
            setIsOpenLeft(false); 
        } else if (translateX > 50 && !isOpen && onEdit) {
            setTranslateX(80);
            setIsOpen(false);
            setIsOpenLeft(true); 
        } else {
            setTranslateX(0);
            setIsOpen(false); 
            setIsOpenLeft(false); 
        }
    };
    const handleClick = (e) => {
        if (isOpen || isOpenLeft) e.stopPropagation();
        setTranslateX(0);
        setIsOpen(false);
        setIsOpenLeft(false);
    };

    // Mouse
    const handleMouseDown = (e) => {
        setStartX(e.clientX);
        setStartY(e.clientY);
        setDragging(true);
        setIsScrolling(false);
    };

    useEffect(() => {
        if (!dragging) return;

        const handleMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                setIsScrolling(true);
                return;
            }
            if (isScrolling) return;
            if (deltaX < 0) {
                // we open right part
                if (!isOpenLeft) setTranslateX(Math.max(deltaX, -80)); else setTranslateX(0);
            }
            if (deltaX > 0 && onEdit) {
                // we open left part
                if (!isOpen) setTranslateX(Math.max(deltaX, 80)); else setTranslateX(0);
            }
        };

        const handleMouseUp = () => {
            setDragging(false);
            if (isScrolling) return;
            if (translateX < -50) {
                setTranslateX(-80);
                setIsOpen(true);
                setIsOpenLeft(false);
            } else if (translateX > 50 && onEdit) {
                setTranslateX(80);
                setIsOpen(false);
                setIsOpenLeft(true);
            } else {
                setTranslateX(0);
                setIsOpen(false);
                setIsOpenLeft(false);
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging, startX, translateX]);

    const handleDelete = (event) => {
        event.stopPropagation();
        if (onDelete) onDelete();
        setTranslateX(0);
        setIsOpen(false);
    };
    const handleEdit = () => {
        if (onEdit) onEdit();
        setTranslateX(0);
        setIsOpen(false);
    }

    // sortable
    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };
    const contentStyle = {
        transform: !isDragging ? `translateX(${translateX}px)` : undefined,
        transition: !isDragging ? "transform 0.2s ease" : "none",
    };

    return (
        <div className="swipe-wrapper"  onClick={onClick} elkey={elkey} style={style} ref={setNodeRef} data-search-field={searchField}>
            {/* <div className="delete-btn" onClick={handleDelete}>{deleteLabel}</div> */}
            {onDelete && <div className="delete-btn" onClick={(event) => handleDelete(event)}><FontAwesomeIcon icon="trash-can" /></div> }
            {onEdit && <div className="edit-btn" onClick={handleEdit}><FontAwesomeIcon icon="pen" /></div> }
            <div
                className={"swipe-item "+classes}
                style={contentStyle}
                onTouchStart={isSwipable ? handleTouchStart : () => {} }
                onTouchMove={isSwipable ? handleTouchMove : () => {} }
                onTouchEnd={isSwipable ? handleTouchEnd : () => {} }
                onMouseDown={isSwipable ? handleMouseDown : () => {} }
                onClickCapture={handleClick}
            >
                {/* <div className="content" {...swipeHandlers}>{children}</div> */}
                {children}
                {draggable && (
                    <div className="sort-handler" {...listeners} {...attributes}>
                        ☰
                        {/* <FontAwesomeIcon icon='hand' /> */}         {/* doesn't work with an icon... */}
                    </div>
                )}
            </div>
        </div>
    );
}
