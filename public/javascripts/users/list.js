const socket = io.connect();
const currentUserId = localStorage.getItem("currentUserId");

const post_load = () => {
  $('.ui.accordion').accordion();
};

const post_update = () => {
  $('.ui.accordion').accordion();
}
$(document).ready(post_load);

socket.on('onlineStatusUpdate', async () => {
  $("#DirectoryBox").load(location.href + " #DirectoryContent", post_update);
});

socket.on('newPrivateMessage', function(message) {
  if (currentUserId === message.receiverId) {
    const senderId = message.senderId;
    $("#"+senderId).append("<div class='newMsg'>New Message</div>");
  }
});