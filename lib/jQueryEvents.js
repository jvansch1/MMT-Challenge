function Events() {
  $('#toggle-trades').on("click", (e) => {
    if ($('.trades').css("visibility") === "visible") {
      $('.trades').css("visibility", "hidden")
    } else {
      $('.trades').css("visibility", "visible")
    }
  })

  $('#toggle-e').on("click", (e) => {
    if ($('.E').css("visibility") === "visible") {
      $('.E').css("visibility", "hidden")
    } else {
      $('.E').css("visibility", "visible")
    }
  })

  $('#toggle-p').on("click", (e) => {
    if ($('.P').css("visibility") === "visible") {
      $('.P').css("visibility", "hidden")
    } else {
      $('.P').css("visibility", "visible")
    }
  })
}
