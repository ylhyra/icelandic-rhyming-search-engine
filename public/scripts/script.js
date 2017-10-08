(function () {
  var current_input = ''
  var current_language = ''
  var current_selected = ''
  var $ = function (selector) {
    return document.querySelector(selector)
  }
  var search_box = $('#s')
  var sidebar = $('main > ul')
  var results = $('main > div')
  var last_input = ''
  var timer = 0
  var suggest_request
  var select_request

  search_box.select()

  function title() {
    var input_part = (current_input &&
      current_selected.toLowerCase() !==
      current_input.toLowerCase()) ? '?q=' + current_input : ''
    var uri = ('/' + current_language + '/' + current_selected + input_part).replace('//', '/')
    if (current_selected) {
      document.title = current_selected.replace(/\+/g, ' ') + ' ‹ ' + t
      history.replaceState({}, '', uri)
      set_history(uri)
    } else {
      document.title = t
      history.replaceState({}, '', uri)
    }
  }

  function set_history(uri) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(function (uri) {
      history.pushState({}, '', uri)
    }, 3000)
  }
})()
