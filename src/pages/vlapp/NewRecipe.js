import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UnitSelect from "../../components/UnitSelect";
import Select from "../../components/Select";
import InlineEdit from "../../components/InlineEdit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addSaveRecipe, createNew } from "../../api";
import SwipeToDeleteItem from "../../components/SwipeToDeleteItem";
import LongPress from "../../components/LongPress";
import Dialog from "../../components/Dialog";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import BackButton from "../../components/BackButton";

function NewRecipe() {
    const navigate = useNavigate();
    const location = useLocation();
    const recipeName = location.state?.name || '';
    const newRec = createNew('recipes');
    const [recipe, setRecipe] = useState({...newRec, name: recipeName, quantity: '1000', mu: 'g', ingredients: [], notes: '', recipecat: 'Other'});
    const [open, setOpen] = useState(false);
    const facts = {
        'g': 1,
        'kg': 1000,
        'oz': 28.35,
        'lb': 453.6,
        'ml': 1,
        'l': 1000,
        'cup': 240,
        'tbsp': 15,
        'tsp': 5,
        'pc': 0,
        'div': 0
    }
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10, // drag start after 10px of movement
            },
        })
    );
    const [openIngredient, setOpenIngredient] = useState(null);
    useEffect(() => {
        const check = location.state?.recipe;
        if (check) {
            if (check.ingredients) check.ingredients = calcRecipePerc(check.ingredients.slice());
            if (!check.recipecat) check.recipecat = 'Other';
            setRecipe(check);
        }
    }, [location.state]);
    useEffect(() => {
        const hasMissingId = recipe.ingredients.some((ingr, ind) => !ingr.id || ingr.id !== ingr.name+ind);
        if (hasMissingId) {
            var newIngrs = recipe.ingredients.slice();
            newIngrs.forEach((ingr, ind) => ingr.id = ingr.name+ind);
            updateRecipe('ingredients', newIngrs);
        }
    }, [recipe.ingredients]);

    function updateRecipe(field, value) {
        setRecipe(prev => ({...prev, [field]: value}));
    }
    function addIngredient() {
        var ingredient = {name: 'New ingredient', quantity: 0, mu: 'g', percentage: 0};
        setRecipe(prev => ({...prev, ingredients: [...prev.ingredients, ingredient]}));
    }
    function removeIngredient(i) {
        var newIngs = [...recipe.ingredients];
        newIngs?.splice(i, 1);
        newIngs = calcRecipePerc(newIngs);
        updateRecipe('ingredients', newIngs);
    }
    function editIngredient(i) {
        setOpenIngredient(recipe.ingredients[i]);
    }
    function editIngField(field, value, index) {
        setRecipe(prev => {
            var updated = [...prev.ingredients];
            updated[index][field] = value;
            updated = calcRecipePerc(updated);
            return {...prev, ingredients: updated};
        })
    }
    function openwideTextArea() {
        setOpen(true);
    }
    async function saveRecipe() {
        var tosave = true;
        // let's control if we are ready to save
        if (!recipe.name) tosave = false;
        if (!recipe.quantity) tosave = false;
        if (!recipe.user) recipe.user = 'unknown';
        if (!recipe.ingredients) recipe.ingredients = [];
        if (!recipe.mu) tosave = false;
        if (recipe._id === undefined) delete recipe._id;
        if (!tosave) {
            alert('Error', 'Fill all the informations to save the recipe');
            return;
        }
        let updated = recipe.ingredients.slice();
        updated = calcRecipePerc(updated);
        updateRecipe('ingredients', updated);

        var data = await addSaveRecipe(recipe);
        console.log("Saved/updated recipe:", data);
        alert('Recipe saved successfully');
        setRecipe(prev => ({ ...prev, _id: data }));     //if we save it several times in the same session
    }
    
    function calcRecipePerc(ingredients) {
        var totrec = 0;
        ingredients.forEach(ing => ing.quantity > 0 && ing.mu ? totrec += ing.quantity * facts[ing.mu] : null);
        for (var i=0; i<ingredients.length ; i++) {
            let ing = ingredients[i];
            if (ing.quantity > 0 && ing.mu) {
                let g = ing.quantity * facts[ing.mu];
                let perc = g / totrec * 100;
                ing.percentage = perc.toFixed(2);
            } else {
                ing.percentage = 0;
            }
        }
        return ingredients;
    }
    async function useRecipe(rec) {
        if (rec) navigate('/use-recipe', {state: {recipe: rec}}); else alert('We\'re sorry there was an error while opening the recipe.');
    }
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = recipe.ingredients.map(x => x.id).indexOf(active.id);
            const newIndex = recipe.ingredients.map(x => x.id).indexOf(over.id);
            // updateRecipe('ingredients', arrayMove(recipe.ingredients, oldIndex, newIndex));
            setRecipe(prev => ({
                ...prev,
                ingredients: arrayMove(prev.ingredients, oldIndex, newIndex)
            }));
        }
    };
    // const ingredientsID = recipe.ingredients.map((ing, index) => ing.id || ing.name + index);
    return (
        <div className="new-recipe">
            <BackButton />
            <h2 className="new-rec-title">
                <InlineEdit value={recipe.name} onChange={updateRecipe} parms={{field: 'name', type: 'text'}} /> 
            </h2>
            <div className="recipe-quantity">
                <input type="number" value={recipe.quantity} placeholder="Quantity" className="rec-qty center" onChange={e => updateRecipe('quantity', parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} />
                <UnitSelect classN="rec-mu center" value={recipe.mu} onChange={val => updateRecipe('mu', val)} /> 
                {/* <InlineEdit value={recipe.mu} onChange={val => updateRecipe('mu', val)} parms={{field: 'mu', type: 'unitselect'}} />  */}
                <Select classN="rec-category center" value={recipe.recipecat} onChange={val => updateRecipe('recipecat', val)}
                options={[{val: 'Bakery', text: 'Bakery'}, {val: 'Pastry', text: 'Pastry'}, {val: 'Kitchen', text: 'Kitchen'}, {val: 'Other', text: 'Other'}]} /> 

            </div>
            <div className="ingredients-list list">
                <div className="list-title">
                    <div>
                        <button className="icon-button" onClick={addIngredient}><FontAwesomeIcon icon="plus" /></button>
                    </div>
                    <div>
                        {/* <span>Ingredients {'('+recipe.ingredients?.length+')'}</span> */}
                        <span>Ingredients {'('+recipe.ingredients?.filter(x => x.mu !== 'div').length+')'}</span>
                    </div>
                    {/* <div><button style={{opacity: 0, pointerEvents: 'none'}} className="icon-button"><FontAwesomeIcon icon="plus" /></button></div> */}
                    <div><button onClick={() => {try {updateRecipe('ingredients', calcRecipePerc(recipe.ingredients.slice())); alert('Percentages recalculated.');} catch(err) {alert('Error occured while recalculating percentages.')}}} className="icon-button"><FontAwesomeIcon icon="arrows-rotate" /></button></div>
                </div>
                <div style={{maxHeight: '45vh', overflow: 'hidden auto'}} >
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}><SortableContext items={recipe.ingredients}>
                        {recipe.ingredients.length > 0 ? recipe.ingredients.map((ing, index) => (
                            <SwipeToDeleteItem key={recipe.ingredients[index].id} index={index} id={recipe.ingredients[index].id} classes={ing.mu !== 'div' ? "ingredient list-item" : "ingredient list-item divider"} onDelete={() => removeIngredient(index)} onEdit={() => editIngredient(index)} draggable={true}>
                                <div className="ing-info name left">
                                    <InlineEdit value={ing.name} onChange={editIngField} parms={{ field: 'name', index: index, type: 'text'}} />
                                    {ing.mu !== 'div' && ( <span> {' ('+ing.percentage+' %)'}</span>) }
                                    {ing.notes && <p className="ing-notes">{ing.notes}</p>}
                                </div>
                                {ing.mu !== 'div' && ( <InlineEdit value={ing.quantity} onChange={editIngField} parms={{classNamep: "ing-info quantity center", field: 'quantity', index: index, type: 'number'}} />) }
                                <InlineEdit value={ing.mu} onChange={editIngField} parms={{classNamep: "ing-info mu center", field: 'mu', index: index, type: 'unitselect'}} />
                            </SwipeToDeleteItem>
                        )) : <div style={{'textAlign': 'center', 'marginTop': '1rem'}}>Tap the "+" to add ingredients</div>}
                    </SortableContext></DndContext>
                </div>
            </div>
            <div className="save-recipe bottom-btn">
                <div className="notes">
                    <LongPress onLongPress={(e) => openwideTextArea(e)}>
                        <textarea id='notes' rows={3} value={recipe.notes} onChange={(e) => {updateRecipe('notes', e.target.value)}} placeholder="Notes and instructions"></textarea>
                    </LongPress>
                </div>
                {/* <div className="btn" onClick={() => {updateRecipe('ingredients', calcRecipePerc(recipe.ingredients.slice()))}}>RECALCULATE PERCENTAGE</div> */}
                <div className="btn" onClick={saveRecipe}>SAVE</div>
            </div>
            <Dialog open={open} onClose={() => setOpen(false)} title='Notes and Instructions' >
                <div>
                    <textarea id='dialog-notes' rows={10} value={recipe.notes} onChange={(e) => {updateRecipe('notes', e.target.value)}} style={{resize: 'vertical'}} placeholder="Notes and instructions"></textarea>
                </div>
            </Dialog>
            <Dialog open={openIngredient ? true : false} onClose={() => setOpenIngredient(null)} title={openIngredient?.name || ''}>
                <div className="dialog-ingredient" >
                    <textarea id='dialog-ingredient-note' rows={10} value={openIngredient?.notes} autoFocus onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                        const updated = { ...openIngredient, notes: e.target.value };
                        setOpenIngredient(updated);
                        const newIngreds = recipe.ingredients.map(x => 
                            x.id === updated.id ? updated : x
                        )
                        updateRecipe('ingredients', newIngreds);
                    }}
                    style={{resize: 'vertical'}} placeholder="Notes and instructions"></textarea>
                </div>
            </Dialog>
        </div>
    );
}

export default NewRecipe;