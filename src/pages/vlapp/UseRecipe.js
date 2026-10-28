import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LongPress from "../../components/LongPress";
import Dialog from "../../components/Dialog";
import BackButton from "../../components/BackButton";
import { pdf } from "@react-pdf/renderer";
import GenerateRecipePdf from "../../components/GenerateRecipePdf";
import { getProfile } from "../../api";
import { auth } from "../../firebase";

function UseRecipe() {
    const navigate = useNavigate();
    const location = useLocation();
    const [origRecipe, setOrigRecipe] = useState(location.state?.recipe || {});
    const [recipe, setRecipe] = useState({});
    const [qty, setQty] = useState(0);
    const [open, setOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const sharedRec = useState(location.state?.sharedRec || {});

    useEffect(() => {
        const check = origRecipe;
        if (check) {
            setRecipe(check);
            setQty(check.quantity);
            // setOrigRecipe(check);
        }
    }, [origRecipe]);
    useEffect(() => {
        if (!origRecipe || !origRecipe.ingredients || !origRecipe.quantity) return;
        var fact = qty / origRecipe.quantity;
        if (!qty) fact = 0;
        let newIngredients = [];
        for (var i=0; i<origRecipe.ingredients.length; i++) {
            let ing = {...origRecipe.ingredients[i]};
            ing.quantity = parseFloat((ing.quantity * fact).toFixed(3));
            newIngredients.push(ing);
        }
        setRecipe(prev => ({...prev, ingredients: newIngredients}));
    }, [qty]);

    function openwideTextArea() { setOpen(true); }

    async function editRecipe(rec) {
        if (rec) {
            navigate('/vlapp');
            navigate('/new-recipe', {state: {recipe: rec}});
        } else {
            alert('We\'re sorry there was an error while opening the recipe.');
        }
    }
    function toggleIngredient(el) {
        var newel = el;
        while (!newel.classList.value.includes('list-item')) {
            newel = newel.parentNode;
        }
        newel.classList.toggle('selected');
    }

    const handleGeneratePdf = async () => {
        setIsGeneratingPdf(true);
        const blob = await pdf(<GenerateRecipePdf recipe={recipe} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${recipe.name}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        setIsGeneratingPdf(false);
    };
    return (
        <div className="use-recipe">
            <BackButton />
            <h2>
                {/* <InlineEdit value={recipe.name} onChange={updateRecipe} parms={{field: 'name', type: 'text'}} />  */}
                <p>{recipe.name}</p>
            </h2>
            <div className="d-flex"><span className="instructions">To change the values just adjust the quantity below with the one you want to cook</span></div>
            <div className="recipe-quantity">
                <input type="number" value={qty} onFocus={(e) => e.target.select()}placeholder="Quantity" className="rec-qty center" onChange={e => setQty(parseFloat(e.target.value))} />
                <p className="rec-mu center">{recipe.mu}</p>
                <p className="rec-category center">{recipe.recipecat || 'Other'}</p>
            </div>
            <div className="ingredients-list list">
                {/* <div className="list-title" style={{justifyContent: 'center'}}><div>Ingredients {'('+recipe.ingredients?.length+')'}</div></div> */}
                <div className="list-title" style={{justifyContent: 'center'}}><div>Ingredients {'('+recipe.ingredients?.filter(x => x.mu !== 'div').length+')'}</div></div>
                <div style={{maxHeight: '45vh', overflow: 'auto'}} >
                    {recipe.ingredients?.length > 0 ? recipe.ingredients.map((ing, index) => (
                        <div key={index} index={index} className={ing.mu !== 'div' ? "ingredient list-item" : "ingredient list-item divider"} onClick={ing.mu !== 'div' ? ( (e) => toggleIngredient(e.target) ) : null}>
                            <div className="ing-info name">
                                <span className='ing-info name left' index={index}>
                                    {ing.mu !== 'div' ? ( ing.name+' ('+ing.percentage+' %)') : ing.name}</span>
                                    {ing.notes && <p className="ing-notes">{ing.notes}</p> }
                            </div>
                            {ing.mu !== 'div' && <span className='ing-info quantity center' index={index}>{ing.quantity}</span> }
                            <span className='ing-info mu center' index={index}>{ing.mu}</span>
                        </div>
                    )) : <div style={{'textAlign': 'center', 'marginTop': '1rem'}}>Tap the "EDIT" to add ingredients</div>}
                </div>
            </div>
            <div className="save-recipe bottom-btn">
                {recipe.notes ? (<div className="notes">
                    <LongPress onLongPress={() => openwideTextArea()}>
                        <textarea id='notes' disabled rows={3} style={{ resize: 'none', width: '100%' }} value={recipe.notes}></textarea>
                    </LongPress>
                </div>
                ): (<div style={{textAlign: 'center', marginBottom: '10px'}}><span>There are no notes for this recipe.</span></div>)}
                <div className="btn" onClick={() => handleGeneratePdf()}>DOWNLOAD PDF</div>
                {recipe.userid === auth.currentUser.uid ? <div className="btn" onClick={() => editRecipe(recipe)}>EDIT</div> : <div className="owner"><span>Recipe from the user {sharedRec?.senderFullName || recipe.user}</span></div>}
            </div>
            <Dialog open={open} onClose={() => setOpen(false)} title='Notes and Instructions' >
                <div>
                    <textarea id='dialog-notes' disabled rows={10} value={recipe.notes} style={{resize: 'vertical'}} placeholder="Notes and instructions (not editable)"></textarea>
                </div>
            </Dialog>
            {/* {isGeneratingPdf && (
                <PDFDownloadLink
                document={<generateRecipePdf recipe={recipe} />}
                fileName={`${recipe.name}.pdf`}
                >
                {({ loading, url }) => {
                    if (!loading) {
                        // scarica automaticamente
                        window.open(url, "_blank");
                        setIsGeneratingPdf(false);
                    }
                    return null;
                }}
                </PDFDownloadLink>
            )} */}
        </div>
    );
}

export default UseRecipe;
