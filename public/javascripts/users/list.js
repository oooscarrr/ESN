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

const post_update = () => {
  $('.ui.accordion').accordion();
}
$(document).ready(post_load);

socket.on('onlineStatusUpdate', async () => {
  $("#DirectoryBox").load(location.href + " #DirectoryContent", post_update);
});