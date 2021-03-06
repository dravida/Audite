Parse.Cloud.define("save", function(request, response) {
  var Text = Parse.Object.extend("Text");
  var text = new Text();
  var fromId = request.params.session.from.id;
  text.set("fromId", fromId);
  var toId = request.params.session.to.id;
  text.set("toId", toId);
  var message = request.params.session.initialText;
  text.set("message", message);
  var requestBody = request.body;
  text.set("raw", requestBody);
  text.set("visible", false);
  text.set("selected", false);
  text.save();
});
