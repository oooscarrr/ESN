$(document).ready(() => {
    $('#logoutButton').click(function () {
        $.ajax({
          method: 'POST',
          url: '/users/logout',
        }).done(function () {
          socket.disconnect();
          window.location.href = '/';
        });
      });

    $('.ui.dropdown').dropdown();

    $('#changeStatusModal').modal('attach events', '#changeStatusButton', 'show');
    $('#changeStatusForm').submit(function (e) {
        e.preventDefault();
        const data = $(this).serialize();
        $.ajax({
            method: 'POST',
            url: '/users/status',
            data: data
        }).done(function () {
            $('#changeStatusModal').modal('hide');
            if (location.pathname === '/users') {
                location.reload();
            }
        });
    });

    $('.ui.radio.checkbox').checkbox();
});