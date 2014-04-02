/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* Copyright © 2013, Deutsche Telekom, Inc. */


var shareUI = {

setMessageArea: function(elementRefName) {
  this.messageArea = elementRefName;
},

scrollToBottom: function(htmlElement) {
  // TODO: The animation starts scrollTop at "0" every time, rather than scroll
  // from current position.
  htmlElement.animate({ scrollTop:
    htmlElement.prop('scrollHeight') - htmlElement.height() }, 0);
},

appendTextAndScroll: function(htmlElement, message) {
  htmlElement.val(htmlElement.val() + message);
  this.scrollToBottom(htmlElement);
}

};
