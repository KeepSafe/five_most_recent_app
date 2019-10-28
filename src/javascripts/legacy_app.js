import BaseApp from "base_app";
import helpers from "helpers";
import Base64 from "base64";
window.helpers = helpers;
window.Base64 = Base64;

const App = (function() {
  return {
    events: {
      "app.activated": "init",
      "fullUserData.done": "handleUserResults",
      "requiredProperties.ready": "getUserData"
    },
    requests: {
      fullUserData: function(userID) {
        return {
          url: helpers.fmt(
            "/api/v2/users/%@/tickets/requested.json?sort_order=desc",
            userID
          ),
          dataType: "json"
        };
      }
    },
    init: function(data) {
      if (!data.firstLoad) {
        return;
      }

      _.defer(
        function() {
          this.trigger("requiredProperties.ready");
        }.bind(this)
      );
    },
    getUserData: function() {
      let requesterKey = 'ticket.requester';
      this.zafClient.get(requesterKey)
          .then((data) => {
            console.log('getUserData', data);
            return data[requesterKey];
          })
          .then((requester) => {
            return this.zafClient.request({
              url: `/api/v2/users/${requester.id}/tickets/requested.json?sort_order=desc`,
              dataType: "json"
            })
          })
          .then((data) => this.handleUserResults(data))
          .catch((err) => this.handleUnknownRequester(err));
    },
    handleUnknownRequester: function(err) {
      console.log('handleUnknownRequester', err);
      this.switchTo("error", {
        message: "Unknown ticket requester!"
      });
    },
    handleUserResults: function(data) {
      var lastestFive = _.first(data.tickets, 5).sort(function(a, b) {
        var aID = a.id;
        var bID = b.id;
        return aID === bID ? 0 : aID < bID ? 1 : -1;
      });

      this.switchTo("lastfive", {
        lastestFiveArr: lastestFive
      });
      $(document).on('click', '.prev-ticket', (el) => {
        let ticketId = el.target.id;
        this.zafClient.invoke('routeTo', 'ticket', ticketId);
      });
    },
    safeGetPath: function(propertyPath) {
      return _.inject(
        propertyPath.split("."),
        function(context, segment) {
          if (context == null) {
            return context;
          }

          var obj = context[segment];

          if (_.isFunction(obj)) {
            obj = obj.call(context);
          }

          return obj;
        },
        this
      );
    },
    validateRequiredProperty: function(propertyPath) {
      var value = this.safeGetPath(propertyPath);
      return value != null && value !== "" && value !== "no";
    }
  };
})();

export default BaseApp.extend(App);
