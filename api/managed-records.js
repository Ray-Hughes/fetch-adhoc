 import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

function retrieve(options = {}) {
  options.page = options.page || 1;

  // peek is to check next page for data
  var peek = 1;
  var limit = 10;
  options.limit = limit + peek;

  if (!options.colors) options.colors = [];
  if (!options["color[]"]) options["color[]"] = [];
  options.colors.forEach(function(color) {
    options["color[]"].push(color);
  });

  options.offset = (options.page - 1) * limit;
  options.color = options.colors;

  var uri = URI(window.path).search(options);

  return fetch(uri)
    .then(res => res.ok ? res.json() : Promise.reject(res.json()))
    .then(payload => setPayload(payload, options))
    .catch((err) => new Error(err));
}

function setPayload(payload, options = {}) {
  var primaryColors = ['red', 'blue', 'yellow'];

  // set required return object
  var data = {
    ids: [],
    open: [],
    closedPrimaryCount: 0,
    previousPage: null,
    nextPage: null
  }

  if (options.page > 1) data.previousPage = options.page - 1;

  if (payload.length > 10) {
    data.nextPage = options.page + 1;
    // don't return the peek page
    payload.pop();
  } else {
    data.nextPage = null;
  }

  // main loop to set data
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

  return data;
}

export default retrieve;
