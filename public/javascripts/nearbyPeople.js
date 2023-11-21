const socket = io.connect();
const currentUserId = localStorage.getItem("currentUserId");

socket.on('newGroup', async () => {
    location.reload(true);
});

// socket.on('newNearbyPeople', async (nearbyUserIds) => {
//     location.reload(true);
// });


function confirm() {
    // Get input values
    let groupName = $('#nameInput').val().trim();
    let description = $('#descriptionInput').val();

    // Group name input cannot be empty or contain only whitespaces
    if (groupName === "") {
        alert("Group name input cannot be empty");
        $('#nameInput').val('');
        $('#descriptionInput').val('');
    } else {
        // Call API to create a new group
        $.ajax({
            method: 'POST',
            url: '/groups',
            data: {
                groupName: groupName,
                description: description
            }
        }).done(function (response) {
            // Close the modal
            $('#newGroupModal').modal('hide');
            // Redirect to the group chat page
            window.location.href = '/groups/' + response.groupId;
        }).fail(function (response) {
            alert(response.responseText);
        });
    }
}

function cancel() {
    // Close the modal
    $('#newGroupModal').modal('hide');
    $('#nameInput').val('');
    $('#descriptionInput').val('');
}

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
  
    // Show the modal
    modal.modal('show');
}

// Onclick declared in nearbyPeople.pug
function closeUserListModal() {
    // Close the modal
    $('#userListModal').modal('hide');
}

// Onclick declared in nearbyPeople.pug
function joinGroup(groupId) {
    $.ajax({
        method: 'POST',
        url: '/groups/join',
        data: {
            groupId: groupId
        }
    }).done(function () {
        window.location.href = '/groups/' + groupId;
    }).fail(function (response) {
        alert(response.responseText);
    });
}


$(document).ready(function () {
    $('.ui.accordion').accordion();

    // Initialize modal
    $('#newGroupButton').click(function() {
        $('#newGroupModal').modal('show');
    });

    // Handle confirm button click
    $('#confirmCreateGroupButton').click(confirm);

    // Handle cancel button click
    $('#cancelCreateGroupButton').click(cancel);
});