import shim from './shim';

import { Observable } from 'rx';
import Cycle from '@cycle/core';
import isolate from '@cycle/isolate';
import { div, h1, button, table, tr, th, td, pre, h, makeDOMDriver } from '@cycle/dom';
import { makeFirebaseDriver } from 'cycle-firebase-driver';
import csjs from 'csjs-inject';

import { messages } from './bet';
import { collate, associate, stringify, log } from './util';
import Tabber from './components/Tabber';
import Zoom from './components/Zoom';
import Bets from './views/Bets';
import Authentication from './views/Authentication';


function main(sources) {
  const { DOM, firebase } = sources;
  firebase.mergeAll().subscribe();






  const makeBet$ = DOM
    .select('.new')
    .events('click')
    .map(() => ({
      ref: '/bets',
      action: ['push', {
        user1: 'google:116128316559316728207',
        user2: 'google:fake',
        user1Bet: 1000,
        user2Bet: 1,
        scratchieValue: 2,
        createdTimestamp: firebase.ServerValue.TIMESTAMP,

        description: 'zzy',
        notes: '',

        expires: true,
        expiresTimestamp: 123,

        resolved: true,
        resolvedTimestamp: 123,
        winner: 'google:116128316559316728207',

        paid: true,
        paidTimestamp: 123,
        outcome: 1,
      }],
    }))
    .map(log('makeBet$'));



  const authentication = isolate(Authentication)({ DOM, firebase });

  const tabberProps$ = Observable.just({
    tabs: [
      { name: 'Bets', content: isolate(Bets)({ DOM, firebase }), active: true },
      { name: 'My Bets', content: isolate(Zoom)({ DOM, title: 'ian' }) },
      { name: 'New Bet', content: isolate(Zoom)({ DOM, title: 'asdf' }) },
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
    makeBet$,
    authentication.firebase
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
