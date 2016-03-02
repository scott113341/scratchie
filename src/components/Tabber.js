import { Observable } from 'rx';
import { h } from '@cycle/dom';
import csjs from 'csjs-inject';

import { classesFrom, log } from '../util';


export default function Tabber({ DOM, props$ }) {

  const tabClick$ = DOM.select(styles.tab.selector).events('click').startWith(false);
  const tabs$ = props$.map(props => props.tabs);
  const doms$$ = props$.map(props => props.tabs.map(tab => tab.content)).map(log('doms$$')).share();
  //const doms$ = doms$$
    //.combineLatest(...doms$$, (...a) => {
    //  console.log('wtffffff', a);
    //  return a;
    //})
    //.concatAll()
    //.map(log('wtf'));


  // observable that updates which tab is active after clicks
  const activatedTabs$ = Observable.combineLatest(
    tabs$,
    tabClick$,
    (tabs, tabClick) => {
      if (!tabClick) return tabs;
      return tabs.map((tab, index) => {
        tab.active = index === tabClick.target.index;
        return tab;
      });
    }
  );


  const vtree$ = Observable.combineLatest(
    activatedTabs$,
    doms$$,
    (tabs, doms) => {
      return h('div.tabber', [
        tabs.map((tab, index) => {
          const classes = classesFrom({
            [styles.tab]: true,
            [styles.active]: tab.active,
            [styles.first]: index === 0,
          });
          return h(`span${classes}`, { index }, tab.name);
        }),
        tabs.map((tab, index) => {
          const classes = classesFrom({
            [styles.content]: true,
            [styles.active]: tab.active,
          });
          return h(`div${classes}`, { index }, [ doms[index] ]);
        }),
      ]);
    }
  );

  return {
    DOM: vtree$,
  };
}


const borderStyle = '1px solid black';
const styles = csjs`

  .tab {
    display: inline-block;
    border-top: ${borderStyle};
    border-right: ${borderStyle};
    padding: 2px 5px;
    cursor: pointer;
  }

  .tab.active {
    background: wheat;
  }

  .tab.first {
    border-left: ${borderStyle};
  }

  .content {
    display: none;
  }

  .content.active {
    display: block;
    border: ${borderStyle};
    padding: 10px;
  }

`;
