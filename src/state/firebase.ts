// Firebase-alustus. Käytetään VAIN Firestorea (data) ja anonyymia kirjautumista
// (jotta Firestore-säännöt voivat vaatia request.auth != null ilman että lapsen
// tarvitsee itse kirjautua mihinkään - tapahtuu automaattisesti taustalla).
// Analytics jätetty tarkoituksella pois: lapsille suunnatussa sovelluksessa ei ole
// syytä kerätä/lähettää ylimääräistä käyttödataa Googlelle, eikä siitä ole tässä
// mitään hyötyä.
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDnbzdtqhbJheIykdb-heKVoO8vr-DgF_U',
  authDomain: 'laksykuulustelu.firebaseapp.com',
  projectId: 'laksykuulustelu',
  storageBucket: 'laksykuulustelu.firebasestorage.app',
  messagingSenderId: '89359103865',
  appId: '1:89359103865:web:314a62de3698c7eeafa1a8',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let valmisPromise: Promise<void> | null = null;

/** Odottaa että anonyymi kirjautuminen on valmis. Kutsutaan jokaisen
 * Firestore-toiminnon alussa - ensimmäinen kutsuja käynnistää kirjautumisen,
 * loput vain odottavat samaa promisea. */
export function varmistaKirjautuminen(): Promise<void> {
  if (!valmisPromise) {
    valmisPromise = new Promise((resolve, reject) => {
      const unsub = onAuthStateChanged(
        auth,
        (kayttaja) => {
          if (kayttaja) {
            unsub();
            resolve();
          } else {
            signInAnonymously(auth).catch(reject);
          }
        },
        reject,
      );
    });
  }
  return valmisPromise;
}
