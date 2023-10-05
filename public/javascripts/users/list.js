const socket = io.connect();

const post_load = () => {
  $('.ui.accordion').accordion();
  $('#logoutButton').click(function () {
    $.ajax({
      method: 'POST',
      url: '/users/logout',
    }).done(function () {
      socket.disconnect();
      window.location.href = '/';
    });
  });

  // socket.on('userOnlineStatusChanged', function (data) {
  //   const userId = data.userId;
  //   const userStatus = data.userStatus;
  //   const userStatusElement = $(`#userStatus${userId}`);
  //   userStatusElement.text(userStatus);
  // });
};


$(document).ready(post_load);