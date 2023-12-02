const add_components_actions = () => {
    displayOrHideInviteButton();
    $('.ui.accordion').accordion({
        animateChildren: false,
        onChange: displayOrHideInviteButton,
    });
    $('.ui.form').form();
    $('#inviteButton').click((event) => {
        event.preventDefault();
        const inviteeIds = $('#inviteeSelection').form('get value', 'users').filter((id) => id !== false);
        sendInvitation(inviteeIds);
    });

}

const displayOrHideInviteButton = () => {
    if ($('#inviteeSelectionWrapper').hasClass('active')) {
        $('#inviteButton').show();
    } else {
        $('#inviteButton').hide();
    }
}

const sendInvitation = (inviteeIds) => {
    $.ajax({
        url: window.location.pathname.replace('/participants', '/pending-invitations'),
        type: 'POST',
        data: { inviteeIds},
        success: () => {
            window.location.reload();
        },
        error: (error) => {
            console.log('error: ', error);
        }
    });
}



$(document).ready(() => {
    add_components_actions();

});