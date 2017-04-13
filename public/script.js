
To use lazy loading, set a data-lazy attribute
on your img tags and leave off the src

$(document).ready(function(){
  $('.slides').slick({
    lazyLoad: 'ondemand',
    slidesToShow: 3,
    slidesToScroll: 1
  });
});

//MomentJS functions.

function dateFormatter(date){
  var format = "LLLL";
  return moment(date).format(format);
}