function generateUniqueId() {
    const timestamp = new Date().getTime();
    console.log(timestamp)
    const uniqueId = Math.floor(Math.random() * 1000000);
    const orderId = `${timestamp}${uniqueId}`;
    console.log("generated id", orderId);
    return orderId;
}

function generateUserId(){
    const min = 10000000;
    const max = 99999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.generateUniqueId = generateUniqueId;
module.exports.generateUserId=generateUserId;