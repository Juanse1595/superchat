import React, {useState, useRef} from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

/* hooks to make easier using firebase with React */
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

/* configuration to initialize firebase backend app */
firebase.initializeApp({
  apiKey: "AIzaSyA8YXLeHDHaa-aMT48iKIAdFHArkhDxDMw",
  authDomain: "superchat-5e639.firebaseapp.com",
  projectId: "superchat-5e639",
  storageBucket: "superchat-5e639.appspot.com",
  messagingSenderId: "875189809831",
  appId: "1:875189809831:web:b844fcda1f1579e6652182",
  measurementId: "G-02DMK43Z93"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  /* when the user logs in, the hook returns an object about the user, when
  logged out, user is null */
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

/* Returns a view component that is rendered if the user is logged out */
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  /* fetchs a collection (like a table) in the firebase database */
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  /* listen to the updates in the database in real time */
  const [messages] = useCollectionData(query, {idField: 'id'});
  /* stateful value to store form value */
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });
    setFormValue('');
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
        value={formValue}
        onChange={(e) => setFormValue(e.target.value)}
        placeholder='Type here man yeah...'/>
        <button type='submit'>Go</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt='pic'/>
      <p>{text}</p>
    </div>
  )
}

export default App;
