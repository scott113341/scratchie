import shim from './shim';

import { Observable } from 'rx';
import Cycle from '@cycle/core';
import isolate from '@cycle/isolate';
import { div, h1, button, table, tr, th, td, pre, h, makeDOMDriver } from '@cycle/dom';
import { makeFirebaseDriver } from 'cycle-firebase-driver';
import csjs from 'csjs-inject';

import globalStyles from './styles/global';
import { messages } from './bet';
import { collate, associate, stringify, log } from './util';
import { Tabber } from './components';

import { Authentication, Bets, MyBets, NewBet, Users } from './views';


function main(sources) {
  const { DOM, firebase } = sources;
  firebase.mergeAll().subscribe();

  const authentication = isolate(Authentication)({ DOM, firebase });
  const newBet = isolate(NewBet)({ DOM, firebase });
  const tabberProps$ = Observable.just({
    tabs: [
      { name: 'Bets', content: isolate(Bets)({ DOM, firebase }).DOM, active: true },
      { name: 'My Bets', content: isolate(MyBets)({ DOM, firebase }).DOM },
      { name: 'New Bet', content: newBet.DOM },
      { name: 'Users', content: isolate(Users)({ DOM, firebase }).DOM },
    ],
  });
  const tabber = isolate(Tabber)({ DOM, props$: tabberProps$ });

  const vTree$ = Observable.combineLatest(
    authentication.DOM,
    tabber.DOM,
    (authDom, tabberDom) => {
      return div([
        h1(`SCRATCHIE`),

        authDom,

        h('br'),
        h('hr'),
        h('br'),

        tabberDom,
      ]);
    }
  );


  const firebaseRequest$ = Observable.merge(
    authentication.firebase,
    newBet.firebase
  ).map(log('firebaseRequest$'));

  return {
    DOM: vTree$,
    firebase: firebaseRequest$,
  };
}


Cycle.run(main, {
  DOM: makeDOMDriver('#app'),
  firebase: makeFirebaseDriver('https://scratchie.firebaseio.com/bets'),
});
