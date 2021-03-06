$(() => {
  $(".jumbotron")
    .css({"background":"url(https://source.unsplash.com/collection/624382/1000x850)", "background-size": "cover"})
  $.ajax({
    method: "GET",
    url: `/api/maps/`
  }).done(maps => {
    for (const [index, map] of maps.entries()) {
      console.log(index, map);
      if (index < 40) {
        $.ajax({
          method: "GET",
          url: `/api/maps/${index + 1}`
        }).done(map => {
          $(".row").append(createMapElement(map));
        });
      }
    }
  });
});
