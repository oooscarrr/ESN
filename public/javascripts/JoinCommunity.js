const messageList = {
    1: 'Log in successfully',
    2: 'Wrong username or password',
    3: 'Username does not meet the rule',
    4: 'Password does not meet the rule',
    5: 'Registered successfully',
    6: 'Internal server error',
    7: 'User is inactive'
}

$(document).ready(function () {
    addElementsBehavior();
});

const confirmJoin = (data) => {
    $.ajax({
        method: 'POST',
        url: '/users',
        data: data,
    }).done(function (response) {
        localStorage.setItem("currentUserId", response.userId);
        $('#welcomeModal').modal('show');
        $('#welcomeModal .okButton').click(function () {
            $('#welcomeModal').modal('hide');
            window.location.href = '/users';
        });
    }).fail(function () {
        showErrorMessage(messageList[6]);
    });
}

const showErrorMessage = (message) => {
    $('#errorHeader').text('Invalid Join');
    $('#errorMessage').text(message);
    $('.ui.error.message').show();
}

const usernameAndPasswordAreNotEmpty = (username, password) => {
    if (username == '' || password == '') {
        if (username == '') {
            $('#usernameField').addClass('error');
        }
        if (password == '') {
            $('#passwordField').addClass('error');
        }
        showErrorMessage('Please fill in all fields');
        return false;
    }
    return true;
}

const submitJoinForm = function (e) {
    e.preventDefault();
    const username = $('#username').val();
    const password = $('#password').val();
    if (!usernameAndPasswordAreNotEmpty(username, password)) {
        return;
    }
    const data = $(this).serialize();

    $.ajax({
        method: 'GET',
        url: `/users/${username}/validation`,
        data: {
            "password": password,
        },
    }).done(function (response) {
        if (response.code == 1) {
            onLoginSuccess(response);
        }
        else if (response.code == 5) {
            onRegistrationSuccess(data);
        } else {
            showErrorMessage(messageList[response.code]);
        }
    });
};
function onRegistrationSuccess(data) {
    $("#confirmJoinModal").modal('show');
    $("#confirmJoinModal .confirmButton").off().click(function () {
        $("#confirmJoinModal").modal('hide');
        confirmJoin(data);
    });
}

function onLoginSuccess(response) {
    window.location.href = '/users';
    localStorage.setItem("currentUserId", response.userId);
}

function addElementsBehavior() {
    $('.ui.error.message').hide();
    $('#confirmJoinModal').modal('attach events', '.cancelButton', 'hide');
    $('#welcomeModal').modal();
    $('input').click(function () {
        $('.ui.error.message').hide();
        $('#usernameField').removeClass('error');
        $('#passwordField').removeClass('error');
    });
    $("#joinForm").submit(submitJoinForm);
}
