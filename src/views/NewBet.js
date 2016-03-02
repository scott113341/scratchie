import { Observable } from 'rx';
import Cycle from '@cycle/core';
import { h } from '@cycle/dom';
import csjs from 'csjs-inject';

import { collate, associate, stringify, log } from '../util';


export default function NewBet({ DOM, firebase }) {

  function getValue(target) {
    const casts = {
      user1Bet: Number,
      user2Bet: Number,
      scratchieValue: Number,
      expiresTimestamp: Date.parse,
    };
    const cast = casts[target.ref];
    return cast ? cast(target.value) : target.value;
  }

  const auth$ = firebase.getAuth();
  const users$ = firebase
    .on('value', { ref: '/users' })
    .map(data => data.val());

  const defaultValues$ = Observable
    .combineLatest(auth$, users$)
    .take(1)
    .map(([auth, users]) => {
      const user1 = Object.entries(users).find(([id, user]) => id === auth.uid)[0];
      const user2 = Object.entries(users)[0][0];
      const user1Bet = 1;
      const user2Bet = 1;
      const scratchieValue = 2;

      return {
        user1,
        user2,
        user1Bet,
        user2Bet,
        scratchieValue,

        createdTimestamp: firebase.ServerValue.TIMESTAMP,
        expires: false,
        resolved: false,
        paid: false,
      };
    });

  const inputChange$ = DOM
    .select('input, select')
    .events('change')
    .map(e => ({ [e.target.ref]: getValue(e.target) }))
    .map(log('change'));

  const newBetProperties$ = Observable
    .merge(inputChange$, defaultValues$)
    .scan((acc, curr) => {
      return Object.assign({}, acc, curr);
    }, {})
    .map(log('newBetProperties$'));

  const clickMakeBetButton$ = DOM.select('.makeBet').events('click');
  const makeBet$ = Observable.combineLatest(
    clickMakeBetButton$,
    newBetProperties$,
    (click, newBet) => ({
      ref: '/bets',
      action: ['push', newBet],
    })
  );


  function input(className, { type='text', ...options }={}, { label='' }={}, style={}) {
    const inputId = `newBetInput${label.replace(/\s/, '')}`;
    return [
      h(`label${className}`, { 'for': inputId }, label),
      h(`input${className}#${inputId}`, { type, style, ...options }),
    ];
  }

  const vtree$ = Observable.combineLatest(
    users$,
    auth$,
    (users, auth) => {
      return h('div', [
        h('h1', 'New Bet'),

        h('select.user1', { ref: 'user1' }, Object.entries(users).map(
          ([id, user]) => h('option', { value: id, selected: id === auth.uid }, user.name))
        ),
        h('span', ' bets '),
        h('select.user2', { ref: 'user2' }, Object.entries(users).map(
          ([id, user]) => h('option', { value: id }, user.name))
        ),

        h('span', ' that '),
        input(`.description.${styles.description}`,
          { ref: 'description', placeholder: '(description)', value: '' }
        ),

        h('span', ' with '),
        input(`.user1Bet.${styles.number}`,
          { ref: 'user1Bet', value: 1 }
        ),
        h('span', ' to '),
        input(`.user2Bet.${styles.number}`,
          { ref: 'user2Bet', value: 1 }
        ),
        h('span', ' odds.'),

        h('br'),
        h('br'),

        h('span', 'Scratchie value is $'),
        input(`.scratchieValue.${styles.number}`,
          { ref: 'scratchieValue', value: 2 }
        ),
        h('span', '.'),

        h('br'),
        h('br'),

        input(`.notes.${styles.description}`,
          { ref: 'notes', placeholder: 'Extra notes (optional)' }
        ),

        h('br'),
        h('br'),

        //h('span', 'Expires '),
        //input('',
        //  { ref: 'expiresTimestamp', type: 'date' }
        //),
        //h('br'),
        //h('br'),

        input('.makeBet',
          { type: 'button', value: 'Save' }
        ),
      ]);
    }
  );

  const request$ = Observable.merge(
    makeBet$
  );

  return {
    DOM: vtree$,
    firebase: request$,
  };
}


const styles = csjs`

  .description {
    width: 400px;
  }

  .number {
    width: 35px;
    text-align: center;
  }

`;
