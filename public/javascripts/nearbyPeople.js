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
            // window.location.href = '/groups/' + response.groupId;
            console.log(response.groupId);
        }).fail(function (response) {
            console.error('Failed to create the new group', response);
        });
    }
}

function cancel() {
    // Close the modal
    $('#newGroupModal').modal('hide');
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