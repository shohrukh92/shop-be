const axios = require("axios").default;

class CachedRequest {
  constructor(fetchFunction, minutesToLive = 2) {
    this.millisecondsToLive = minutesToLive * 60 * 1000;
    this.fetchFunction = fetchFunction;
    this.cache = null;
    this.fetchDate = new Date(0);
  }

  isCacheExpired() {
    return (
      this.fetchDate.getTime() + this.millisecondsToLive < new Date().getTime()
    );
  }

  async getData() {
    if (!this.cache || this.isCacheExpired()) {
      console.log("Cache expired - fetching new data");
      this.cache = await this.fetchFunction();
      this.fetchDate = new Date();
    }
    return this.cache;
  }

  resetCache() {
    this.fetchDate = new Date(0);
  }
}

async function getProductsList() {
  const productsServiceUrl = process.env["products"];
  const axiosConfig = {
    method: "GET",
    url: productsServiceUrl + "/products",
  };

  const response = await axios(axiosConfig);
  console.log("Response from products list (cached)");
  return response;
}

module.exports = {
  "GET:/products": new CachedRequest(getProductsList),
};
