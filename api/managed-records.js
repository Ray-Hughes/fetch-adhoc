 import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

async function retrieve(options = {}) {
  options.page = options.page || 1;
  var page = options.page;

  var data = {
    ids: [],
    open: [],
    closedPrimaryCount: 0,
    previousPage: null,
    nextPage: null
  }

  // peek is to check next page for data
  var peek = 1;
  var limit = 10;
  options.limit = limit + peek;

  options.offset = (options.page - 1) * limit;
  options.color = options.colors;

  // default to empty array if nothing passed in options
  if (!options.colors) options.colors = [];

  // API looks for queryParam as "colors[]"
  // Transform call from "colors" => "colors[]"
  if (!options["color[]"]) options["color[]"] = [];
  options.colors.forEach(function(color) {
    options["color[]"].push(color);
  });

  var uri = URI(window.path).search(options);

  // fetch returns a Promise
  return fetch(uri)
    .then(res => res.ok ? res.json() : Promise.reject(res.json()))
    .then(payload => setPayload(data, payload, page))
    .catch((err) => console.log(err));
}

function setPayload(data, payload, page) {
  setPage(data, payload, page);
  setDisposition(data, payload);
  return data;
}

function setPage(data, payload, page) {
  if (page > 1) data.previousPage = page - 1;

  if (payload.length > 10) {
    data.nextPage = page + 1;
    // don't return the peek page
    payload.pop();
  } else {
    data.nextPage = null;
  }
}

function setDisposition(data, payload) {
  var primaryColors = ['red', 'blue', 'yellow'];

  payload.forEach((p) => {
    data.ids.push(p.id);

    var isPrimary = primaryColors.includes(p.color);
    if (p.disposition === 'open') {
      p.isPrimary = isPrimary;
      data.open.push(p);
    } else if (p.disposition === 'closed' && isPrimary) {
      data.closedPrimaryCount++;
    }
  });
}

export default retrieve;
