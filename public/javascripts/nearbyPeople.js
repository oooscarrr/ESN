const socket = io.connect();


function confirm() {
    // Get input values
    var groupName = $('#nameInput').val();
    var description = $('#descriptionInput').val();

    // Group name input cannot be empty or contain only whitespaces
    if (groupName.trim() === "") {
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
            console.error('Failed to create the new group', response);
        });
    }
}

function cancel() {
    // Close the modal
    $('#newGroupModal').modal('hide');
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