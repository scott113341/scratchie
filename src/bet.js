import TimeAgo from 'time-ago';


const ago = TimeAgo().ago;


export const messages = {

  betStatement: (bet, users) => {
    const b = bet;
    const u = users;
    const statement = `
      ${u[b.user1].name} bet ${u[b.user2].name} that ${b.description} with ${b.user1Bet}:${b.user2Bet} odds.
      Time: ${ago(bet.createdTimestamp)}
    `;
    return statement.trim();
  }

};


export function isExpired(bet) {
  const { expires, time } = bet;
  return expires && Date.now() >= time;
}
