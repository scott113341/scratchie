import { Observable } from 'rx';
import { h } from '@cycle/dom';


export default function Zoom({ DOM, title }) {

  const clickCount$ = DOM.select('h1').events('click').scan(acc => acc + 1, 0).startWith(0);

  const vtree$ = Observable.combineLatest(
    clickCount$,
    clickCount => {
      return h('div', [
        h('h1', title),
        h('p', `${clickCount}`),
      ]);
    }
  );

  return {
    DOM: vtree$,
  };

}
