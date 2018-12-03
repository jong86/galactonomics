const target = '0x000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

function randomReward() {
  return Math.round(Math.random() * 6000) + 10000
}

module.exports = [
  { name: 'Iodine', symbol: 'IOD', startingReward: randomReward(),  startingTarget: target },
  { name: 'Neon gas', symbol: 'NEG', startingReward: randomReward(),  startingTarget: target },
  { name: 'Iron ore', symbol: 'IRN', startingReward: randomReward(),  startingTarget: target },
  { name: 'Platinum ore', symbol: 'PLT', startingReward: randomReward(),  startingTarget: target },
  { name: 'Gold ore', symbol: 'GLD', startingReward: randomReward(),  startingTarget: target },
  { name: 'Petroleum', symbol: 'PET', startingReward: randomReward(),  startingTarget: target },
  { name: 'Water', symbol: 'WTR', startingReward: randomReward(),  startingTarget: target },
]