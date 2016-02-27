import { Observable } from 'rx';


export function collate(event$) {
  return event$
    .scan((accumulator, current) => {
      return accumulator.concat(current);
    }, [])
    .startWith([]);
}


export function associate(accRequests$, accResponses$, propertyName) {
  return Observable.combineLatest(
    accRequests$,
    accResponses$.catch('aosdifhasdoif'),
    (accRequests, accResponses) => {
      return accRequests.map(request => {
        const response = accResponses.find(res => res[propertyName] === request);
        return [request, response];
      });
    }
  );
}


export function stringify(thing, pretty=false) {
  const spacing = pretty ? 2 : 0;
  return JSON.stringify(thing, null, spacing) || String(thing);
}


export function log(description) {
  return function(thing) {
    console.log(description, thing);
    return thing;
  }
}


export function classesFrom(classes) {
  return Object.entries(classes)
    .filter(c => c[1])
    .map(c => `.${c[0]}`)
    .join();
}


export function orderedSnapshot(dataSnapshot) {
  const acc = [];
  dataSnapshot.forEach(child => {
    acc.push(child.val());
  });
  return acc;
}
