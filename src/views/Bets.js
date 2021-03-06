import { Observable } from 'rx';
import { h } from '@cycle/dom';
import { makeFirebaseDriver } from 'cycle-firebase-driver';
import csjs from 'csjs-inject';

import { messages } from '../bet';
import { orderedSnapshot } from '../util';


export default function Bets({ DOM, firebase }) {

  const betQuery = {
    ref: '/bets',
    query: [
      ['orderByChild', 'createdTimestamp'],
    ],
  };
  const bets$ = firebase
    .on('value', betQuery)
    .map(data => orderedSnapshot(data));
  const users$ = firebase
    .on('value', { ref: '/users' })
    .map(data => data.val());

  const vtree$ = Observable
    .combineLatest(
      bets$,
      users$,
      (bets, users) => {
        return h('div', [
          h('h1', 'Bets'),
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
