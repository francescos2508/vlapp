import React, { useEffect, useState } from "react";
// import styles from "./KaliHome.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { deleteRec, aquery } from "../../api";
import SwipeToDeleteItem from "../../components/SwipeToDeleteItem";
import Sidebar from "../../components/Sidebar";

function KaliHome() {
    const user = localStorage.getItem('loggedInUser');
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    /* const [recipes, setRecipes] = useState([]);

    useEffect( () => {
        const loadUser = async () => {
            const ret = await aquery('users', [{field: 'username', op: '==', value: user}]);
            if (ret && ret.length > 0) setProfile(ret[0]);
        }
        loadUser();
    }, [user]);
    function newRecipe() {
        var name = prompt('Recipe name', '');
        if (name) navigate('/new-recipe', {state: {name: name}}); else alert('Insert a valid name for a recipe.')
    }

    function openRecipe(rec) {
        if (rec) navigate('/use-recipe', {state: {recipe: rec}}); else alert('We\'re sorry there was an error while opening the recipe.');
    }

    async function deleteRecipe(rec) {
        var ok = window.confirm('Do you want to delete '+rec.name+'?');
        if (ok) {
            var res = await deleteRec(rec);
            if (res.result == 'ok') {
                setRecipes(prev => prev.filter(x => x.fid !== rec.fid));
            } else {
                alert('Error while deleting '+rec.name);
            }
        }
    }

    function filterRecipe(val) {
        const contRecs = document.getElementById('recipes-list-container');
        const recs = contRecs.querySelectorAll('.swipe-wrapper');
        // recs.forEach(el => {if (el.attributes.elkey.value.toLowerCase().includes(val.toLowerCase())) el.style.display = ''; else el.style.display = 'none';});
        recs.forEach(el => {if (el.dataset.searchField.toLowerCase().includes(val.toLowerCase())) el.style.display = ''; else el.style.display = 'none';});
    }

    useEffect(() => {
        async function getAllRecipes() {
            var recs = await aquery('recipes', [{field: 'user', op: '==', value: user}]);
            console.log(recs);
            if (!recs) recs = [];
            recs.forEach( x => {
                x._searchField = x.name;
                x.ingredients.forEach( y => x._searchField += ' '+y.name);
            })
            setRecipes(recs);
            setIsLoading(false);
        }
        getAllRecipes();
    }, []); */
    if (isLoading) {
        return (<div className="loader"></div>)
    }

    return (
        <div style={{textAlign: 'center',  width: '100%'}}>
        {/* <div className={styles.container}> */}
            <Sidebar />
            <h3 style={{marginTop: '1rem'}}>Kali App </h3>

            {/* <div>
                <div id="filter-container">
                    <input type='text' placeholder='Filter by recipe or ingredient name...' className="filter-recipes" onChange={(e) => filterRecipe(e.target.value)}/>
                    <div className="icon-search"><FontAwesomeIcon icon="search" /></div>
                </div>
                <div className="recipes-list list" id='recipes-list-container'>
                    {recipes.length > 0 ? recipes.map((rec, index) => (
                        <SwipeToDeleteItem key={index} elkey={rec.name} index={index} classes="recipe list-item" onClick={() => openRecipe(rec)} onDelete={() => deleteRecipe(rec)} searchField={rec._searchField}>
                                <div style={{width: '100%', height: '100%', textAlign: 'left'}} >
                                    <span>{rec.name}</span>
                                </div>
                        </SwipeToDeleteItem>
                    )) : <div style={{'textAlign': 'center', 'marginTop': '1rem'}}>Tap the "+" to add a new recipe</div>}
                </div>
            </div> */}

            {/* <div>
                <button className="icon-button" onClick={newRecipe}>
                    <FontAwesomeIcon icon="plus" />
                </button>
            </div> */}
        </div>
    );
}



export default KaliHome;
