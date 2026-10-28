import { useEffect, useState } from "react";
import Switch from "../../components/Switch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Sidebar from "../../components/Sidebar";
import SwipeToDeleteItem from "../../components/SwipeToDeleteItem";
import Dialog from "../../components/Dialog"
import { aquery, createNew, deleteRec, getProfile, saveRec } from "../../api";
import Select from "../../components/Select";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase";


export default function Exchange () {
    const username = localStorage.getItem('loggedInUser');
    const navigate = useNavigate();
    const [showing, setShowing] = useState('Received');
    const [listReceived, setListReceived] = useState([]);
    const [listSent, setListSent] = useState([]);
    const [sharing, setSharing] = useState(false);
    const [myRecs, setMyRecs] = useState([]);
    const [users, setUsers] = useState([]);
    const newShare = createNew('sharedRecipes');
    const [sharingRec, setSharingRec] = useState({...newShare, message: '', receiver: '', recipe_fid: ''});
    const [viewSharedRec, setViewSharedRec] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadLists = async (forceReload) => {
        if (forceReload || listReceived.length < 1) {
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            const ret = await aquery('sharedRecipes', [{field: 'receiverid', op: '==', value: uid}]);
            if (ret) {
                ret.forEach( x => {
                    x._searchField = x.recipe?.name;
                    x.recipe?.ingredients.forEach( y => x._searchField += ' '+y.name);
                })
                setListReceived(ret);
            }
        }
        if (forceReload || listSent.length < 1) {
            const ret = await aquery('sharedRecipes', [{field: 'senderid', op: '==', value: auth.currentUser.uid}]);
            if (ret) {
                ret.forEach( x => {
                    x._searchField = x.recipe?.name;
                    x.recipe?.ingredients?.forEach( y => x._searchField += ' '+y.name);
                })
                setListSent(ret);
            }
        }
    }
    const loadOptions = async () => {
        if (myRecs.length < 1) {
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            const ret = await aquery('recipes', [{field: 'userid', op: '==', value: uid}]);
            if (ret) {
                ret.forEach(x => { x.val = x.fid; x.text = x.name })
                setMyRecs(ret);
            }
        }

        if (users.length < 1) {
            const ret = await aquery('userProfiles', [{ field: 'firebaseUid', op: '!=', value: auth.currentUser.uid }]);
            if (ret) {
                ret.forEach(x => { x.val = x.username; x.text = x.fullname ? x.username + ' (' + x.fullname + ')' : x.username });
                setUsers(ret);
            }
        }

    }
    function filterRecipe(val) {
        const contRecs = document.getElementById('exchange-list-container');
        const recs = contRecs.querySelectorAll('.swipe-wrapper');
        // recs.forEach(el => {if (el.attributes.elkey.value.toLowerCase().includes(val.toLowerCase())) el.style.display = ''; else el.style.display = 'none';});
        recs.forEach(el => {if (el.dataset.searchField.toLowerCase().includes(val.toLowerCase())) el.style.display = ''; else el.style.display = 'none';});
    }
    async function shareRecipe() {
        var rec = myRecs.find(x => x.fid === sharingRec.recipe_fid);
        if (rec) {
            sharingRec.recipe = {...rec};
        } else {
            rec = await aquery('recipes', [{ field: 'fid', op: '==', value: sharingRec.recipe_fid }]);
            if (rec.length > 0) {
                sharingRec.recipe = rec[0];
            } else {
                alert('A problem occured while sharing this recipe, please try again later');
                return;
            }
        }
        sharingRec.sender = username;
        sharingRec.senderid = auth.currentUser.uid;
        var u = await getProfile();
        if (u?.fullname) sharingRec.senderFullName = u.fullname;
        u = users.find(x => x.username === sharingRec.receiver);
        if (u?.fullname) sharingRec.receiverFullName = u.fullname;
        if (u?.firebaseUid) sharingRec.receiverid = u.firebaseUid;

        const now = new Date();
        sharingRec.datems = now.getTime();
        const ret = await saveRec(sharingRec);
        if (ret) alert('Recipe shared successfully');
        setIsLoading(true);
        loadLists(true);
        setSharing(false);
        setIsLoading(false);
    }
    function openSharedRecipe(rec) {
        if (rec.receiverid === auth.currentUser.uid && rec?.recipe) navigate('/use-recipe', {state: {recipe: rec?.recipe, sharedRec: rec}});
        if (rec.senderid === auth.currentUser.uid) setViewSharedRec(rec);
        if ((!rec.sender && !rec.receiver) || !rec?.recipe ) alert('We\'re sorry there was an error while opening the recipe.');
    }
    async function unshareRecipe() {
        const ok = await deleteRec(viewSharedRec);
        if (ok?.result === 'ok') alert('Recipe unshared successfully'); else alert('Error occurred while unsharing the recipe, please try again later');
        setIsLoading(true);
        setViewSharedRec(null);
        loadLists(true);
        setIsLoading(false);
    }
    useEffect( () => { loadLists(); } , [showing] );
    useEffect( () => { loadOptions(); }, [sharing]);

    const buttons = [{val: 'Received', text: 'Received', onclick: () => setShowing('Received')}, {val: 'Sent', text: 'Shared', onclick: () => setShowing('Sent')}];
    if (isLoading) return <div className="loader"></div>;
    return (
        <div className="cont-exchange">
            <Sidebar />
            <h3 style={{margin: '1rem 0'}}>Exchange recipes (testing)</h3>
            <Switch  buttons={buttons}/>
            <div id="filter-container">
                <input type='text' placeholder='Filter by recipe or ingredient name...' className="filter-recipes" onChange={(e) => filterRecipe(e.target.value)}/>
                <div className="icon-search"><FontAwesomeIcon icon="search" /></div>
            </div>

            <div className="cont-received-sent">
                {/* <div className="exchange-title"><h4>{showing}</h4></div> */}
                <div className="exchange-list list" id='exchange-list-container'>
                    {(showing === 'Received'  && listReceived.length > 0) ? listReceived.map((rec, index) => (
                        <SwipeToDeleteItem onClick={() => openSharedRecipe(rec)} key={index} elkey={rec.recipe?.name} index={index} classes="recipe list-item" searchField={rec._searchField}>
                                <div style={{width: '100%', height: '100%', textAlign: 'left'}} >
                                    <span>{rec.recipe?.name} {'('+(rec.senderFullName || rec.sender)+')'}</span>
                                </div>
                        </SwipeToDeleteItem>
                    )) : (showing === 'Received' && listReceived.length < 1) ? (
                        <div style={{'textAlign': 'center', 'marginTop': '1rem'}}>You didn't receive any recipe yet</div>
                    ) : (showing === 'Sent' && listSent.length > 0) ? listSent.map((rec, index) => (
                        <SwipeToDeleteItem onClick={() => openSharedRecipe(rec)} key={index} elkey={rec.recipe?.name} index={index} classes="recipe list-item" searchField={rec._searchField}>
                                <div style={{width: '100%', height: '100%', textAlign: 'left'}} >
                                    <span>{rec.recipe?.name} {'('+(rec.receiverFullName || rec.receiver)+')'}</span>
                                </div>
                        </SwipeToDeleteItem>
                    )) : <div style={{'textAlign': 'center', 'marginTop': '1rem'}}>You didn't share any recipe yet</div>
                    }
                    {showing === 'Sent' && <div>
                        <button className="icon-button" onClick={() => {
                            const newShare2 = createNew('sharedRecipes');
                            setSharingRec({...newShare2, message: '', receiver: '', recipe_fid: ''});
                            setSharing(true); 
                        }}>
                            <FontAwesomeIcon icon="plus" />
                        </button>
                    </div>}

                    <Dialog open={sharing} title="Share recipe" onClose={() => setSharing(false)}>
                        <Select options={myRecs} value={sharingRec.recipe_fid} defaultText="Recipe to share" onChange={(val) => setSharingRec(prev => ({...prev, recipe_fid: val}))} />
                        <Select options={users} value={sharingRec.receiver} defaultText="User receiver" onChange={(val) => setSharingRec(prev => ({...prev, receiver: val}))} />
                        <input type="text" value={sharingRec.message} onChange={(e) => setSharingRec(prev => ({...prev, message: e.target.value}))} placeholder="Message for the receiver"/>
                        <div className="inline-button">
                            <div className="btn" onClick={() => shareRecipe()}>
                                SEND
                            </div>
                        </div>
                    </Dialog>

                    <Dialog open={viewSharedRec ? true : false} title={viewSharedRec?.recipe?.name || ''} onClose={() => setViewSharedRec(null)}>
                        <span><b>Sent to:</b> {viewSharedRec?.receiverFullName || viewSharedRec?.receiver || 'error'}</span>
                        <br />
                        <span><b>Recipe:</b> {viewSharedRec?.recipe?.name || ''}</span>
                        <br />
                        <span><b>Message:</b> {viewSharedRec?.message || 'No message'}</span>
                        <br />
                        <span><b>Date: </b> 
                        {viewSharedRec?.datems && (new Date(viewSharedRec?.datems).getDate()+'/'+(new Date(viewSharedRec?.datems).getMonth()+1)+'/'+new Date(viewSharedRec?.datems).getFullYear())}</span>
                        <span>{viewSharedRec?.datems && ' - '+(new Date(viewSharedRec?.datems).getHours())+':'+(new Date(viewSharedRec?.datems).getMinutes())}</span>
                        <div className="inline-button" onClick={() => unshareRecipe()}>
                            <div className="btn">
                                UNSHARE
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}