const messageList = {
    1: 'Username exists',
    2: 'Username exists',
    3: 'Username does not meet the rule',
    4: 'Password does not meet the rule',
    5: 'Success'
}

$(document).ready(function () {
    const data = $(this).serialize();
    $('.ui.error.message').hide();
    $('#confirmJoinModal').modal('attach events', '.cancelButton', 'hide');
    $('#welcomeModal').modal();
    $('input').click(function () {
        $('.ui.error.message').hide();
        $('#usernameField').removeClass('error');
        $('#passwordField').removeClass('error');
    });
    $("#confirmJoinModal .confirmButton").click(function () {
        $("#confirmJoinModal").modal('hide');
        confirmJoin(data);
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
        $.ajax({
            type: 'GET',
            url: `/user/validateUserInfo?`,
            data: data,
        }).done(function (response) {
            const message = messageList[response.code];
            if (response.code == 5) {
                $("#confirmJoinModal").modal('show');
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
        type: 'POST',
        url: '/user/createNewUser',
        data: data,
    }).done(function (response) {
        $('#welcomeModal').modal('show');
        $('#welcomeModal .okButton').click(function () {
            $('#welcomeModal').modal('hide');
            // window.location.href = "/";
        });
    }).fail(function (response) {
        alert(response.message);
    });
}