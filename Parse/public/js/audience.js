function addResponse(text, top) {
    var responses = document.getElementById('responses');

    var innerHTML = responses.innerHTML;

    if (top) {
        innerHTML = '<div id="' + text.id + '">' + text.get("message") + '</div>' + innerHTML;
    }
    else {
        innerHTML = innerHTML + '<div id="' + text.id + '">' + text.get("message") + '</div>';
    }

    responses.innerHTML = innerHTML;
}

function update(message) {
    if (message.selected) {
        var Text = Parse.Object.extend("Text");

        var query = new Parse.Query(Text);

        query.get(message.objectId, {
            success: function(text) {
              addResponse(text, true);
            }
        });
    }
    else {
        var element = document.getElementById(message.objectId);

        element.remove()
    }
}