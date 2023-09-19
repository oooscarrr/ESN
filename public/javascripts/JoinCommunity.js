const messageList = {
    1: 'Username exists',
    2: 'Username exists',
    3: 'Username does not meet the username rule',
    4: 'Password does not meet the password rule',
    5: 'Success'
}

$(document).ready(function() {
    $("#joinForm").submit(function(e) {
        e.preventDefault();
        var data = $(this).serialize();
        $.ajax({
            type: 'POST',
            url: '/user/validateUserInfo',
            data: data,
            success: function(response) {
                const message = messageList[response.code];
                alert(message);
            }
        });
    });
});