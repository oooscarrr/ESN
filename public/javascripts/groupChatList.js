const socket = io.connect();

socket.on('newGroup', async () => {
    location.reload(true);
});

// Onclick declared in nearbyPeople.pug
function showUserListModal(userList) {
    // Select the modal element
    const modal = $('#userListModal');
    // Clear the existing content in the modal
    modal.find('.content').empty();
    // Append the list of usernames to the modal content
    userList.forEach(user => {
      modal.find('.content').append(`<div>${user.username}</div>`);
    });

    modal.modal('show');
}

// Onclick declared in nearbyPeople.pug
function closeUserListModal() {
    $('#userListModal').modal('hide');
}

// Onclick declared in nearbyPeople.pug
function enterGroup(groupId) {
    window.location.href = '/groups/' + groupId;
}

$(document).ready(function () {

});