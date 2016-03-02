import { Observable } from 'rx';
import { h } from '@cycle/dom';
import { makeFirebaseDriver } from 'cycle-firebase-driver';
import csjs from 'csjs-inject';

import { orderedSnapshot } from '../util';


export default function Users({ DOM, firebase }) {

  const users$ = firebase
    .on('value', { ref: '/users' })
    .map(data => orderedSnapshot(data));

  const vtree$ = Observable
    .combineLatest(
      users$,
      (users) => {
        return h('div', [
          h('h1', 'Users'),

          users.map(user => (
            h(`div.${styles.user}`, [
              h(`img.${styles.picture}`, { src: user.picture }),
              h(`p.${styles.name}`, `${user.name}`),
            ])
          )),
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


const styles = csjs`

  .user {
    display: inline-block;
    margin: 10px 20px;
  }

  .picture {
    width: 100px;
    max-height: 100px;
  }

  .name {
    margin: 2px 0;
    text-align: center;
  }

`;
