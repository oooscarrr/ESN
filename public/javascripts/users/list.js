const post_load = () => {
  $('.ui.accordion').accordion();
  $('#logoutButton').click(function () {
    $.ajax({
      method: 'POST',
      url: '/users/logout',
    }).done(function () {
      window.location.href = '/';
    });
  });
};



$(document).ready(post_load);