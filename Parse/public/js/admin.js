function refreshList() {
  clearResponses();

  var Text = Parse.Object.extend("Text");

  var filteredQuery = getFilteredQuery(Text);

  filteredQuery.descending("createdAt");

  filteredQuery.find({
    success: function(results) {
      for (var i = 0; i < results.length; i++) {
        addResponse(results[i], false);
      }
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
}

function clearResponses() {
  var responses = document.getElementById('responses');

  var innerHTML = responses.innerHTML;

  innerHTML = '';

  responses.innerHTML = innerHTML;
}

function filterSelected(query) {
  var filterSelected = document.getElementById('filterSelected');
  var filterUnselected = document.getElementById('filterUnselected');

  if (!filterSelected.checked && !filterUnselected.checked) {
   query.equalTo("selected", "none");
  }
  else if (!(filterSelected.checked && filterUnselected.checked)) {
    if (filterSelected.checked) {
      query.equalTo("selected", true);
    }
    else if (filterUnselected.checked) {
      query.equalTo("selected", false);
    }
  }

  return query;
}

function getAfterDate() {
  var afterYear = document.getElementById('afterYear');
  var afterMonth = document.getElementById('afterMonth');
  var afterDay = document.getElementById('afterDay');
  var afterHour = document.getElementById('afterHour');
  var afterMinute = document.getElementById('afterMinute');
  var afterSecond = document.getElementById('afterSecond');

  return new Date(afterYear.value, afterMonth.value, afterDay.value, afterHour.value, afterMinute.value, afterSecond.value);
}

function getBeforeDate() {
  var beforeYear = document.getElementById('beforeYear');
  var beforeMonth = document.getElementById('beforeMonth');
  var beforeDay = document.getElementById('beforeDay');
  var beforeHour = document.getElementById('beforeHour');
  var beforeMinute = document.getElementById('beforeMinute');
  var beforeSecond = document.getElementById('beforeSecond');

  return new Date(beforeYear.value, beforeMonth.value, beforeDay.value, beforeHour.value, beforeMinute.value, beforeSecond.value);
}

function filterDate(query) {
  var afterDate = getAfterDate();

  query.greaterThan("createdAt", afterDate);

  var beforeDate = getBeforeDate();

  query.lessThan("createdAt", beforeDate);

  return query;
}

function getFilteredQuery(Text) {
  var query = new Parse.Query(Text);

  query = filterSelected(query);
  query = filterDate(query);

  return query;
}

function addResponse(text, top) {
  var responses = document.getElementById('responses');

  var innerHTML = responses.innerHTML;

  if (top) {
      innerHTML = '>' + text.get("message") + '</label></br>' + innerHTML;

      if (text.get("selected")) {
          innerHTML = ' checked' + innerHTML;
      }

      innerHTML = '<label><input id="' + text.id + '" type="checkbox" onClick="toggleSelected(this)"' + innerHTML;
  }
  else {
      innerHTML = innerHTML + '<label><input id="' + text.id + '" type="checkbox" onClick="toggleSelected(this)"';

      if (text.get("selected")) {
          innerHTML = innerHTML + ' checked';
      }

      innerHTML = innerHTML + '>' + text.get("message") + '</label></br>';
  }

  responses.innerHTML = innerHTML;
}

function toggleSelected(e) {
    var Text = Parse.Object.extend("Text");

    var query = new Parse.Query(Text);

    query.get(e.id, {
        success: function(text) {
            text.save({
                selected: !text.get("selected")
            }, {
                success: function(text) {
                    pubnub.publish({
                        channel: 'audite-audience',
                        message: text.toJSON()
                    });
                }
            });
        }
    });
}

function update(message) {
  var Text = Parse.Object.extend("Text");

  var query = new Parse.Query(Text);

  query.get(message.objectId, {
    success: function(text) {
      addResponse(text, true);
    }
  });
}

function saveFilter() {
  var afterDate = getAfterDate();
  var beforeDate = getBeforeDate();
  var filterSelected = document.getElementById('filterSelected');
  var filterUnselected = document.getElementById('filterUnselected');
  var name = document.getElementById('name');

  var Filter = Parse.Object.extend("Filter");
  var filter = new Filter();

  filter.set("afterDate", afterDate);
  filter.set("beforeDate", beforeDate);
  filter.set("selected", filterSelected.checked);
  filter.set("unselected", filterUnselected.checked);
  filter.set("name", name.value);

  filter.save(null, {
    error: function(filter, error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
}