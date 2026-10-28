import axios from "axios";
import { db, auth } from "./firebase";
import { collection, getDocs, doc, setDoc, query, where, limit, deleteDoc, orderBy } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

export const createNew = (rectype) => {
  let random = Math.random() * 100;
  let fid = rectype + '_' + new Date().getTime() + '_' + random;
  return { rectype: rectype, fid: fid, userid: auth?.currentUser?.uid, user: localStorage.getItem('loggedInUser') };
}
/* export const getProfile = async() => {
  const oldcache = localStorage.getItem('cache') || {};
  const ret = oldcache.userobj || await aquery('users', [{field: 'firebaseUid', op: '==', value: auth?.currentUser?.uid}]);
  if (ret.length > 0) {
    localStorage.setItem('cache', {...oldcache, userobj: ret[0]});
    return ret[0];
  }
} */


export const getProfile = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const ret = await aquery('users', [{ field: 'firebaseUid', op: '==', value: uid }]);
  return ret.length > 0 ? ret[0] : null;
}

export const togglePassword = (show, setShow) => {
  setShow(!show);
}


export const addSaveRecipe = async (recipe) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User is not authenticated');

  if (recipe._id) {
    recipe.id = recipe._id;
    delete recipe._id;
  }

  if (recipe.userid !== uid) throw new Error('Invalid recipe owner');

  if (recipe.id) {
    await setDoc(doc(db, 'recipes', recipe.id), recipe, { merge: true });
    return recipe.id;
  }

  const q = query(
    collection(db, 'recipes'),
    where('name', '==', recipe.name),
    where('userid', '==', uid),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const existingDoc = snapshot.docs[0];
    await setDoc(existingDoc.ref, recipe, { merge: true });
    return existingDoc.id;
  }

  const newDoc = doc(collection(db, 'recipes'));
  await setDoc(newDoc, recipe);
  return newDoc.id;
};


export const aquery = async (coll, conditions = [], options = {}) => {
  const colRef = collection(db, coll);
  let qRef = colRef;
  conditions.forEach((cond) => { qRef = query(qRef, where(cond.field, cond.op || '==', cond.value)); });

  if (options.orderBy) qRef = query(qRef, orderBy(options.orderBy, options.orderDir || 'asc'));
  if (options.limit) qRef = query(qRef, limit(options.limit));

  const snapshot = await getDocs(qRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


export const deleteRec = async (rec) => {
  const uid = auth.currentUser?.uid;
  if (!uid || rec.rectype !== 'recipes') return { result: 'ko' };

  try {
    const q = query(
      collection(db, 'recipes'),
      where('fid', '==', rec.fid),
      where('userid', '==', uid),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return { result: 'ko' }; 

    await deleteDoc(snapshot.docs[0].ref);
    return { result: 'ok' };

  } catch (error) {
    console.error('Error deleting recipe:', error);
    return { result: 'ko' };
  }
};


export const saveRec = async (rec) => {
  const uid = auth.currentUser?.uid;
  const now = Date.now();

  if (!uid) {
    throw new Error('User is not authenticated');
  }

  if (!rec?.rectype) {
    throw new Error('Record type is missing');
  }

  const rectype = rec.rectype;

  // Only allow supported collections.
  if (!['users', 'recipes', 'sharedRecipes'].includes(rectype)) {
    throw new Error('Unsupported collection: ' + rectype);
  }

  // Avoid modifying the original object.
  const data = { ...rec };

  if (data._id) {
    data.id = data._id;
    delete data._id;
  }

  try {
    // USERS
    if (rectype === 'users') {
      if (data.firebaseUid !== uid) {
        throw new Error('Cannot save another user profile');
      }

      if ('password' in data) {
        throw new Error('Password must not be stored in Firestore');
      }

      if (data.id) {
        data._upd = now;

        await setDoc(
          doc(db, 'users', data.id),
          data,
          { merge: true }
        );

        return data.id;
      }

      const newDoc = doc(collection(db, 'users'));

      data._ins = now;
      data._upd = now;

      await setDoc(newDoc, data);

      return newDoc.id;
    }

    // RECIPES
    if (rectype === 'recipes') {
      if (data.userid !== uid) {
        throw new Error('Cannot save a recipe owned by another user');
      }

      if (data.id) {
        data._upd = now;

        await setDoc(
          doc(db, 'recipes', data.id),
          data,
          { merge: true }
        );

        return data.id;
      }

      if (!data.fid) {
        throw new Error('Recipe fid is missing');
      }

      const q = query(
        collection(db, 'recipes'),
        where('fid', '==', data.fid),
        where('userid', '==', uid),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const existingDoc = snapshot.docs[0];

        data._upd = now;

        await setDoc(existingDoc.ref, data, { merge: true });

        return existingDoc.id;
      }

      const newDoc = doc(collection(db, 'recipes'));

      data._ins = now;
      data._upd = now;

      await setDoc(newDoc, data);

      return newDoc.id;
    }

    // SHARED RECIPES
    if (rectype === 'sharedRecipes') {
      if (data.senderid !== uid) {
        throw new Error('Cannot share a recipe as another user');
      }

      if (typeof data.receiverid !== 'string' || !data.receiverid) {
        throw new Error('Recipient ID is missing or invalid');
      }

      if (data.id) {
        data._upd = now;

        await setDoc(
          doc(db, 'sharedRecipes', data.id),
          data,
          { merge: true }
        );

        return data.id;
      }

      // Search only shares created by the current user.
      // This is compatible with the sharedRecipes read rules.
      if (data.fid) {
        const q = query(
          collection(db, 'sharedRecipes'),
          where('fid', '==', data.fid),
          where('senderid', '==', uid),
          limit(1)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const existingDoc = snapshot.docs[0];

          data._upd = now;

          await setDoc(existingDoc.ref, data, { merge: true });

          return existingDoc.id;
        }
      }

      const newDoc = doc(collection(db, 'sharedRecipes'));

      data._ins = now;
      data._upd = now;

      await setDoc(newDoc, data);

      return newDoc.id;
    }
  } catch (error) {
    console.error('Error while saving record:', error);
    throw error;
  }
};

export const createUserProfile = async (firebaseUid, username, fullname) => {
  await setDoc(doc(db, 'userProfiles', firebaseUid), {
    firebaseUid,
    username,
    fullname: fullname || username
  });
};


export const updateUserProfile = async (firebaseUid, username, fullname) => {
  await setDoc(doc(db, 'userProfiles', firebaseUid), {
    firebaseUid,
    username,
    fullname: fullname || username
  }, { merge: true });
};


export const migrateSharedRecipesToFirebase = async () => {
  const sharedRecipes = await aquery("sharedRecipes");
  const users = await aquery("users");

  const userMap = {};

  users.forEach((user) => {
    if (user.firebaseUid) {
      userMap[user.username] = user.firebaseUid;
    }
  });

  let migrated = 0;
  let skipped = 0;

  for (const sharedRecipe of sharedRecipes) {
    const senderid = userMap[sharedRecipe.sender];
    const receiverid = userMap[sharedRecipe.receiver];
    const userid = userMap[sharedRecipe.user];

    if (!senderid || !receiverid || !userid) {
      console.warn(
        `Skipping sharedRecipe ${sharedRecipe.id} - missing Firebase UID`
      );
      skipped++;
      continue;
    }

    if (
      sharedRecipe.senderid &&
      sharedRecipe.receiverid &&
      sharedRecipe.userid
    ) {
      console.log(`Already migrated: ${sharedRecipe.id}`);
      skipped++;
      continue;
    }

    await setDoc(
      doc(db, "sharedRecipes", sharedRecipe.id),
      {
        senderid,
        receiverid,
        userid
      },
      { merge: true }
    );

    migrated++;
    console.log(`Migrated sharedRecipe: ${sharedRecipe.id}`);
  }

  console.log(
    `Migration completed: ${migrated} migrated, ${skipped} skipped`
  );

  return {
    migrated,
    skipped
  };
};

export const migrateUserToFirebase = async (
  username,
  oldPassword,
  email,
  newPassword
) => {
  try {
    // Find the existing VLApp user
    const users = await aquery('users', [
      { field: 'username', op: '==', value: username }
    ]);

    if (!users || users.length !== 1) {
      throw new Error('VLAPP_USER_NOT_FOUND');
    }

    const user = users[0];

    // Verify the old VLApp password
    if (user.password !== oldPassword) {
      throw new Error('INVALID_OLD_PASSWORD');
    }

    // Create Firebase Authentication account
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      newPassword
    );

    const firebaseUser = credential.user;

    // Link Firebase UID to the existing VLApp user
    user.email = email;
    user.firebaseUid = firebaseUser.uid;

    const ret = await saveRec(user);

    if (!ret) {
      throw new Error('FIRESTORE_UPDATE_FAILED');
    }

    return {
      success: true,
      username: user.username,
      firebaseUid: firebaseUser.uid
    };

  } catch (error) {
    console.error('User migration error:', error);
    throw error;
  }
};

export const migrateUsersToUserProfiles = async () => {
  const users = await aquery('users');

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    if (!user.firebaseUid || !user.username) {
      console.warn('Skipping user without Firebase UID or username');
      skipped++;
      continue;
    }

    await setDoc(
      doc(db, 'userProfiles', user.firebaseUid),
      {
        firebaseUid: user.firebaseUid,
        username: user.username,
        fullname: user.fullname || user.username
      },
      { merge: true }
    );

    migrated++;
  }

  return { migrated, skipped };
};