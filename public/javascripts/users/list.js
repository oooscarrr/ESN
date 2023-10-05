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
};

$(document).ready(post_load);

socket.on('onlineStatusUpdate', () => {
  console.log('onlineStatusUpdate');
  $("#DirectoryBox").load(location.href + " #DirectoryContent");
});