import axios from "axios";

export default {
  //this part populates the URL and sends the data as the request

  setSearchString: function(searchString) {
    return axios.post("/api/data/setSearchString", searchString)
  },
  startSearch: function(searchParam) {
    return axios.post("/api/data/startSearch", searchParam)
  },
  checkResult: function(searchId) {
    return axios.post("/api/data/checkResult", searchId)
  },
  removeDbEntry: function(searchId) {
    return axios.post("/api/data/removeDbEntry", searchId)
  }
};
