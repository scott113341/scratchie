import { Observable } from 'rx';
import { h } from '@cycle/dom';
import { makeFirebaseDriver } from 'cycle-firebase-driver';
import csjs from 'csjs-inject';

import { messages } from '../bet';
import { orderedSnapshot } from '../util';


export default function MyBets({ DOM, firebase }) {

  const betQuery = {
    ref: '/bets',
    query: [
      ['orderByChild', 'createdTimestamp'],
    ],
  };
  const bets$ = firebase
    .on('value', betQuery)
    .map(data => orderedSnapshot(data));
  const auth$ = firebase.getAuth();
  const myBets$ = Observable.combineLatest(
    bets$,
    auth$,
    (bets, auth) => {
      return bets.filter(bet => {
        return (
          bet.user1 === auth.uid ||
          bet.user2 === auth.uid
        );
      });
    }
  );

  const users$ = firebase
    .on('value', { ref: '/users' })
    .map(data => data.val());

  const vtree$ = Observable
    .combineLatest(
      myBets$,
      users$,
      (bets, users) => {
        return h('div', [
          h('h1', 'My Bets'),
          bets.reverse().map(bet => h('p', messages.betStatement(bet, users))),
        ]);
      }
    )
    .startWith(
      h('div', [
        h('h1', 'Bets'),
      ])
    );

  return {
    DOM: vtree$,
  };

}
