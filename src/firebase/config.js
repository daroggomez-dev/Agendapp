import{initializeApp}from'firebase/app';
import{getAuth}from'firebase/auth';
import{getFirestore,enableIndexedDbPersistence}from'firebase/firestore';
const firebaseConfig={
apiKey:"AIzaSyCThYvmbWeVhYJK9FGhPmJtpmJNFRiTiGI",
authDomain:"agendapp-4c4e9.firebaseapp.com",
projectId:"agendapp-4c4e9",
storageBucket:"agendapp-4c4e9.firebasestorage.app",
messagingSenderId:"580440694741",
appId:"1:580440694741:web:6049807a6752b27c68a75c"
};
const app=initializeApp(firebaseConfig);
export const auth=getAuth(app);
export const db=getFirestore(app);
enableIndexedDbPersistence(db).catch(()=>{});
export default app;
