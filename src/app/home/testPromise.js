const mypromise = (ms) => new Promise(resolve => setTimeout(resolve, ms));

mypromise(10000).then(() => console.log("10 seconds"));