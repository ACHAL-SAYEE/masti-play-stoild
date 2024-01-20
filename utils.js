function generateUniqueId() {
  const timestamp = new Date().getTime();
  console.log(timestamp);
  const uniqueId = Math.floor(Math.random() * 1000000);
  const orderId = `${timestamp}${uniqueId}`;
  console.log("generated id", orderId);
  return orderId;
}

function generateUserId(noOfdigits = 8) {
  const min = 10 ** noOfdigits;
  const max = 10 ** (noOfdigits + 1) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.generateUniqueId = generateUniqueId;
module.exports.generateUserId = generateUserId;
module.exports.getRandomInt = getRandomInt;
