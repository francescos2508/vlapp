import React, { useEffect, useState } from "react";
import styles from "./HomeVlapp.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { deleteRec, aquery, migrateSharedRecipesToFirebase, getProfile, migrateUsersToUserProfiles } from "../../api";
import SwipeToDeleteItem from "../../components/SwipeToDeleteItem";
import Sidebar from "../../components/Sidebar";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

function HomeVlapp() {
    const user = localStorage.getItem('loggedInUser');
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect( () => {
        const loadUser = async () => {
            const ret = await getProfile();
            if (ret) setProfile(ret);
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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) { setRecipes([]); setIsLoading(false); return; }

            try {
                var recs = await aquery('recipes', [{ field: 'userid', op: '==', value: firebaseUser.uid }]);
                recs.forEach(x => {
                    x._searchField = x.name;
                    x.ingredients?.forEach(y => x._searchField += ' ' + y.name);
                });
                setRecipes(recs);
            } catch (error) {
                console.error(error);
                setRecipes([]);
            } finally {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return (<div className="loader"></div>)
    }

    return (
        <div className={styles.container}>
            <Sidebar />
            <h3 style={{marginTop: '1rem'}}>Your recipes {'('+recipes.length+')'}</h3>

            <div>
                <div id="filter-container">
                    <input type='text' placeholder='Filter by recipe or ingredient name...' className="filter-recipes" onChange={(e) => filterRecipe(e.target.value)}/>
                    <div className="icon-search"><FontAwesomeIcon icon="search" /></div>
                </div>
                {/* <h4>Your Recipes</h4> */}
                <div className="recipes-list list" id='recipes-list-container'>
                    {recipes.length > 0 ? recipes.map((rec, index) => (
                        <SwipeToDeleteItem key={index} elkey={rec.name} index={index} classes="recipe list-item" onClick={() => openRecipe(rec)} onDelete={() => deleteRecipe(rec)} searchField={rec._searchField}>
                                <div style={{width: '100%', height: '100%', textAlign: 'left'}} >
                                    <span>{rec.name}</span>
                                </div>
                        </SwipeToDeleteItem>
                    )) : <div style={{'textAlign': 'center', 'marginTop': '1rem'}}>Tap the "+" to add a new recipe</div>}
                </div>
            </div>

            <div>
                <button className="icon-button" onClick={newRecipe}>
                    <FontAwesomeIcon icon="plus" />
                </button>
            </div>
        </div>
    );
}



export default HomeVlapp;
