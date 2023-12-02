let askedForCancelConfirmation = false;
const add_components_actions = () => {
    $('.ui.accordion').accordion({
        animateChildren: false,
    });
    $('#cancelButton').on('click', (event) => {
        event.preventDefault();
        console.log('askedForCancelConfirmation: ', askedForCancelConfirmation);
        if (!askedForCancelConfirmation) {
            askedForCancelConfirmation = true;
            $('#cancelButton').text('Are you sure?').addClass('orange').removeClass('red');
            setTimeout(() => {
                askedForCancelConfirmation = false;
                $('#cancelButton').text('Cancel').addClass('red').removeClass('orange');
            }, 3000);
        }
        else {
            sendCancellationRequest();
        }
    });
    $('#joinButton').on('click', (event) => {
        event.preventDefault();
        sendJoinRequest();
    });
    $('#leaveButton').on('click', (event) => {
        event.preventDefault();
        sendLeaveRequest();
    });
}

const sendCancellationRequest = () => {
    $.ajax({
        url: window.location.pathname,
        type: 'DELETE',
        success: () => {
            window.location.pathname = '/events';
        },
        error: (error) => {
            console.log('error: ', error);
        }
    });
}

const sendJoinRequest = () => {
    $.ajax({
        url: $('#joinButton').attr('href'),
        type: 'POST',
        success: () => {
            window.location.reload();
        },
        error: (error) => {
            console.log('error: ', error);
        }
    });
}

const sendLeaveRequest = () => {
    $.ajax({
        url: $('#leaveButton').attr('href'),
        type: 'DELETE',
        success: () => {
            window.location.reload();
        },
        error: (error) => {
            console.log('error: ', error);
        }
    });
}

$(document).ready(() => {
    askedForCancelConfirmation = false;
    add_components_actions();
});