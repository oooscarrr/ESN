const messageList = {
    1: 'Log in successfully',
    2: 'Wrong username or password',
    3: 'Username does not meet the rule',
    4: 'Password does not meet the rule',
    5: 'Registered successfully',
    6: 'Internal server error'
}

$(document).ready(function () {
    $('.ui.error.message').hide();
    $('#confirmJoinModal').modal('attach events', '.cancelButton', 'hide');
    $('#welcomeModal').modal();
    $('input').click(function () {
        $('.ui.error.message').hide();
        $('#usernameField').removeClass('error');
        $('#passwordField').removeClass('error');
    });
    $("#joinForm").submit(function (e) {
        e.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();
        if (username == '' || password == '') {
            if (username == '') {
                $('#usernameField').addClass('error');
            }
            if (password == '') {
                $('#passwordField').addClass('error');
            }
            showErrorMessage('Please fill in all fields');
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
                console.log(response);
                userId = response.userId;
                localStorage.setItem('userId', userId);
                $.ajax({
                    method: 'PATCH',
                    url: `/users/${userId}/online`,
                }).done(function () {
                    console.log('Logged In');
                    window.location.href = '/users';
                })
                return;
            }
            if (response.code == 5) {
                $("#confirmJoinModal").modal('show');
                $("#confirmJoinModal .confirmButton").off().click(function () {
                    $("#confirmJoinModal").modal('hide');
                    confirmJoin(data);
                });
            } else {
                showErrorMessage(messageList[response.code]);
            }
        }).fail(function (response) {
            // might be something to do
        });
    });
});

const confirmJoin = (data) => {
    $.ajax({
        method: 'POST',
        url: '/users',
        data: data,
    }).done(function (response) {
        userId = response.userId;
        $('#welcomeModal').modal('show');
        $('#welcomeModal .okButton').click(function () {
            $('#welcomeModal').modal('hide');
            window.location.href = '/esnDirectory';
        });
    }).fail(function (response) {
        alert(response.message);
    });
}

const showErrorMessage = (message) => {
    $('#errorHeader').text('Invalid Join');
    $('#errorMessage').text(message);
    $('.ui.error.message').show();
}