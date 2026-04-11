import React,{createContext,useContext,useState,useEffect}from'react';
import{createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged,updateProfile,sendPasswordResetEmail}from'firebase/auth';
import{doc,setDoc,getDoc}from'firebase/firestore';
import{auth,db}from'../firebase/config';
const AuthContext=createContext();
export function useAuth(){return useContext(AuthContext);}
export function AuthProvider({children}){
const[currentUser,setCurrentUser]=useState(null);
const[userData,setUserData]=useState(null);
const[loading,setLoading]=useState(true);
async function register(email,password,nombre){const result=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(result.user,{displayName:nombre});await setDoc(doc(db,'usuarios',result.user.uid),{nombre,email,creadoEn:new Date()});return result;}
async function login(email,password){return signInWithEmailAndPassword(auth,email,password);}
async function logout(){return signOut(auth);}
async function resetPassword(email){return sendPasswordResetEmail(auth,email);}
useEffect(()=>{const unsub=onAuthStateChanged(auth,async(user)=>{setCurrentUser(user);if(user){const snap=await getDoc(doc(db,'usuarios',user.uid));if(snap.exists())setUserData(snap.data());}else{setUserData(null);}setLoading(false);});return unsub;},[]);
const value={currentUser,userData,register,login,logout,resetPassword};
return React.createElement(AuthContext.Provider,{value},!loading&&children);
}
