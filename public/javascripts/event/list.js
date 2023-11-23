const add_components_actions = () => {
    $('.ui.accordion').accordion({
        animateChildren: false,
    });
    $('.menu .item')
        .tab();

    $('#pendingInvitations button.accept').on('click', (event) => {
        event.preventDefault();
        const href = $(event.target).attr('href');
        console.log('href: ', href);
        sendInvitationResponse(href);
    });

    $('#pendingInvitations button.decline').on('click', (event) => {
        event.preventDefault();
        const href = $(event.target).attr('href');
        console.log('href: ', href);
        sendInvitationResponse(href);
    });
}

const sendInvitationResponse = (href) => {
    $.ajax({
        url: href,
        type: 'POST',
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