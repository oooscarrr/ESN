const add_components_actions = () => {
    addCalendars();

    $('#eventForm').form({
        on: 'submit',
        fields: {
            startDateTime: 'empty',
            endDateTime: 'empty',
            title: 'empty',
            description: 'empty'
        },
        onSuccess: (event) => {
            // console.log('onSuccess: ', event);
            event.preventDefault();
            const data = prepareRequestData();
            console.log('data: ', data);
            sendRequest(data);
        }
    }); 
}

const addCalendars = () => {
    const context = $('#eventForm').attr('data-context');
    if (context === 'create') {
        $('#startTime').calendar({
            type: 'datetime',
            endCalendar: $('#endTime'),
            minDate: new Date()
        });
    } else {
        $('#startTime').calendar({
            type: 'datetime',
            endCalendar: $('#endTime')
        });
    }
    $('#endTime').calendar({
        type: 'datetime',
        startCalendar: $('#startTime')
    });
}

const prepareRequestData = () => {
    const startDateTime = $('#startTime').calendar('get date');
    const endDateTime = $('#endTime').calendar('get date');
    const title = $('#eventForm input[name="title"]').val();
    const description = $('#eventForm textarea[name="description"]').val();
    const newEvent = { startDateTime, endDateTime, title, description };
    return newEvent;
}

const sendRequest = (data) => {
    const context = $('#eventForm').attr('data-context');
    console.log('context: ', context);
    if (context === 'create') {
        $.ajax({
            url: '/events',
            type: 'POST',
            data: data,
            success: (result) => {
                console.log('result: ', result);
                window.location.href = result.redirect;
            },
            error: (error) => {
                console.log('Error: ', error);
            }
        });
    } else {
        const targteUrl = window.location.pathname.replace('/edit', '');
        $.ajax({
            url: targteUrl,
            type: 'PUT',
            data: data,
            success: (result) => {
                window.location.pathname = targteUrl;
            },
            error: (error) => {
                console.log('Error: ', error);
            }
        });
    }
}

$(document).ready(() => {
    add_components_actions();
});