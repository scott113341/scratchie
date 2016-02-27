import { Observable } from 'rx';
import { h } from '@cycle/dom';
import { makeFirebaseDriver } from 'cycle-firebase-driver';
import csjs from 'csjs-inject';

import { messages } from '../bet';
import { orderedSnapshot, log } from '../util';


export default function Authentication({ DOM, firebase }) {

  const auth$ = firebase.onAuth().map(log('auth$'));
  const loginClick$ = DOM.select('.login').events('click');
  const logoutClick$ = DOM.select('.logout').events('click');
  const loginRequest$ = loginClick$.map(() => ['authWithOAuthPopup', 'google']);
  const logoutRequest$ = logoutClick$.map(() => ['unauth']);

  const makeUserRequest$ = firebase
    .onAuth()
    .filter(auth => auth !== null)
    .map(auth => ({
      ref: `/users/${auth.uid}`,
      action: ['set', {
        name: auth.google.displayName,
        picture: auth.google.profileImageURL,
      }],
    }));

  const vtree$ = Observable.combineLatest(
    auth$,
    (auth) => {
      return h('div', [
        auth ? h('p', `Logged in as ${auth.google.displayName}`): null,
        auth ? null : h('button.login', 'Log In'),
        auth ? h('button.logout', 'Log Out') : null,
      ]);
    }
  );

  const firebaseRequest$ = Observable.merge(
    loginRequest$,
    logoutRequest$,
    makeUserRequest$
  );

  return {
    DOM: vtree$,
    firebase: firebaseRequest$,
  };

}
