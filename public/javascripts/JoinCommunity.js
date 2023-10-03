let userId;

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
            $('#errorHeader').text('Invalid Join');
            $('#errorMessage').text('Please fill in all fields');
            $('.ui.error.message').show();
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
            const message = messageList[response.code];
            if (response.code == 1) {
                userId = response.userId;
                $.ajax({
                    method: 'PATCH',
                    url: `/users/${userId}/online`,
                }).done(function () {
                    // TODO: Redorect to ESN page
                    console.log('Loged In');
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
                $('#errorHeader').text('Invalid Join');
                $('#errorMessage').text(message);
                $('.ui.error.message').show();
            }
        }).fail(function (response) {
            alert(response.message);
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
            window.location.href = "/";
        });
    }).fail(function (response) {
        alert(response.message);
    });
}