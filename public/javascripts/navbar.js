const contextDict = {
    '/users': 'citizens',
    '/announcements': 'announcements',
    '/messages/public': 'publicMessages',
    '/messages/private': 'privateMessages'
}

$(document).ready(() => {
    $('#logoutButton').click(function () {
        $.ajax({
            method: 'POST',
            url: '/users/logout',
        }).done(function () {
            localStorage.removeItem("currentUserId");
            socket.disconnect();
            window.location.href = '/';
        });
    });

    $('.ui.dropdown').dropdown();

    searchDropdown();

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

function searchDropdown() {
    if (isUserSearch()) {
        $('#categorySelect').show();
    }

    // Prevent closing the dropdown when interacting with the input and button
    $('.ui.action.input').on('click', function (e) {
        e.stopPropagation();
    });


    $('.ui.action.input button').on('click', function (e) {
        e.stopPropagation();
        search();
        clearSearchInput();
    });

    // Listen for keydown event on the input to handle the Enter key press
    $('.ui.action.input input').on('keydown', function (e) {
        e.stopPropagation();
        if (e.which === 13) {
            search();
            clearSearchInput(); // Call the function to clear the input
        }
    });
}
function isUserSearch() {
    var currentPathname = window.location.pathname;
    console.log((currentPathname));
    if(currentPathname == '/users'){
        return true;
    }
    return false;
}
function clearSearchInput() {
    $('.ui.action.input input').val('');
}


function search() {
    let inputVal = $('.ui.action.input input').val();
    var currentPathname = window.location.pathname;
    let context = findContext(currentPathname);
    console.log(context);

    let criteria;
    if (context == 'citizens') {
        var selectedCategory = $('#categorySelect').val();
        if (selectedCategory == 'status') {
            criteria = {
                status: inputVal,
            }
        } else {
            criteria = {
                usernameFragment: inputVal,
            }
        }
    } else {
        criteria = inputVal;
    }
    console.log(criteria);

    sendSearchRequest(context, criteria);
    // const {context, criteria} = req.body;
}

function sendSearchRequest(inputContext, inputCriteria){
    $.ajax({
        method: 'GET',
        url: '/search',
        data:{
            context: inputContext,
            criteria: inputCriteria,
        },
        success: function(response) {
        //     TODO:
        },
        error: function(xhr, status, error) {
            console.error('AJAX error:', status, error);
        }
    });
}


function findContext(currentPathname) {
    for (const key in contextDict) {
        if (currentPathname.startsWith(key)) {
            return contextDict[key];
        }
    }
    return 'unknownContext';
}