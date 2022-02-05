
//sort by date
function sortByDate(a,b) {
  return new Date(a.timeStamp*1000) - new Date(b.timeStamp*1000)
}

function runSerial(tasks) {
  var result = Promise.resolve();
  tasks.forEach(task => {
    result = result.then(() => task());
  });
  return result;
}

const setTimeoutAsync = (cb, delay) => (
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(cb());
    }, delay);
  })
);

module.exports = {
  sortByDate,
  setTimeoutAsync,
  runSerial
}