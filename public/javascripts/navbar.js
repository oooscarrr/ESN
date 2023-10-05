$(document).ready(() => {
    $('#logoutButton').click(function () {
        $.ajax({
          method: 'POST',
          url: '/users/logout',
        }).done(function () {
          socket.disconnect();
          window.location.href = '/';
        });
      });
});