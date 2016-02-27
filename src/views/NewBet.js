import shim from './shim';

import { Observable } from 'rx';
import Cycle from '@cycle/core';
import { div, h1, button, table, tr, th, td, pre, h, makeDOMDriver } from '@cycle/dom';
import { makeFirebaseDriver } from 'cycle-firebase-driver';
import csjs from 'csjs-inject';

import { messages } from './bet';
import { collate, associate, stringify, log } from './util';


export default function NewBet({ DOM, firebase }) {




  // stream of clicks on the .load button
  /*
   const clickMutateButton$ = DOM.select(styles.button.selector).events('click');

   // stream of request objects for firebase driver
   const mutateRequest$ = clickMutateButton$
   .map(() => {
   const rand = Math.ceil(Math.random() * 100);
   return {
   ref: '/bets/wtf',
   action: ['set', { no: `money ${rand}` }],
   };
   })
   .share();

   // accumulated$ of request/response/req-res objects
   const accRequests$ = collate(mutateRequest$);
   const accResponses$ = collate(firebase.response$$.mergeAll());
   const accReqRes$ = associate(accRequests$, accResponses$, 'request');

   // stream of /bets
   const bets$ = firebase
   .on('value', { ref: '/bets' })
   .map(data => data.val() || {})
   .map(log('bet$'))
   .startWith({});
   */



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

  // DOM sink
  const vtree$ = Observable.combineLatest(
    auth$,
    bets$,
    accReqRes$,
    (auth, bets, accReqRes) => {

      console.log({ auth, bets, accReqRes });

      return div([
        h1(`SCRATCHIE`),
        auth ? h('p', `Logged in as ${auth.google.displayName}`): null,
        auth ? null : button('.login', 'Log In'),
        auth ? button('.logout', 'Log Out') : null,


        h1('Bets'),
        button('.new', 'New Bet'),
        //pre(stringify(bets, true)),

        Object.entries(bets).map(([key, bet]) => {
          return h('p', messages.betStatement(bet));
        }),
      ]);
    }
  );

  const request$ = Observable.merge(
    mutateRequest$,
    loginRequest$,
    logoutRequest$,
    makeUser$,
    makeBet$
  );

  return {
    DOM: vtree$,
    firebase: request$,
  };
}


const styles = csjs`

  .button {
    margin-bottom: 10px;
  }

  .table {
    border-collapse: collapse;
    border-spacing: 10px;
  }

  .table th, .table td {
    border: 1px solid black;
  }

`;
