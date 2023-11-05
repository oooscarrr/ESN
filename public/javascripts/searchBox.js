import { CONTEXT, urlToContext } from '/shared/context.js';

/**
 *
 * @returns {CONTEXT} The context of the current page. Will be one of the values in the CONTEXT enum.
 */
export const determineContext = () => {
    var currentPathname = window.location.pathname;
    return urlToContext(currentPathname);
}


export const initializeSearchBox = () => {
    console.log('Initializing search box');
    const context = determineContext();
    console.log(context);
    displayAndHideSearchElements(context);
    addSearchElementBehavior(context);

}

const displayAndHideSearchElements = (context) => {
    if (context == CONTEXT.CITIZENS) {
        $('#statusSelect').closest('.ui.dropdown').hide();
    }
}

const addSearchElementBehavior = (context) => {
    addSearchButtonBehavior(context);
    switch (context) {
        case CONTEXT.CITIZENS:
            addCitizensSearchElementsBehavior();
            break;
        case CONTEXT.ANNOUNCEMENTS:
            break;
        case CONTEXT.PUBLIC_MESSAGES:
            break;
        case CONTEXT.PRIVATE_MESSAGES:
            addPrivateMessagesSearchElementsBehavior();
            break;
        default:
            break;
    }
}

const addSearchButtonBehavior = (context) => {
    $('#searchButton').click(getContextSpecificSearchButtonClickHandler(context));
}

const getContextSpecificSearchButtonClickHandler = (context) => {
    return () => {
        if (!makeSureTextInputIsNotEmpty()) {
            return;
        }
        switch (context) {
            case CONTEXT.CITIZENS:
                searchCitizens();
                break;
            case CONTEXT.ANNOUNCEMENTS:
                searchAnnouncements();
                break;
            case CONTEXT.PUBLIC_MESSAGES:
                searchPublicMessages();
                break;
            case CONTEXT.PRIVATE_MESSAGES:
                searchPrivateMessages();
                break;
            default:
                break;
        }

    }
}

const makeSureTextInputIsNotEmpty = () => {
    const input = $('#searchBox .ui.input input');
    if(input.is(':hidden')){
        return true;
    }
    if (input.val().trim() == '') {
        input.closest('.ui.input').addClass('error');
        return false;
    }
    input.closest('.ui.input').removeClass('error');
    return true;
}

const searchCitizens = () => {
    const selectedCategory = $('#citizenSearchCategorySelect').val();
    let criteria;
    if (selectedCategory == 'status') {
        criteria = {
            status: $('#statusSelect').val(),
        }
    } else {
        criteria = {
            usernameFragment: $('#usernameInput').val(),
        }
    }
    makeSearchRequest(CONTEXT.CITIZENS, criteria, onCitizenSearchSuccess, onSearchError);
}

const onCitizenSearchSuccess = (data) => {
    $('#searchResults').append(data);
}

const searchAnnouncements = () => {
    const criteria = $('#announcementSearchInput').val();
    makeSearchRequest(CONTEXT.ANNOUNCEMENTS, criteria, onAnnouncementSearchSuccess, onSearchError);
}

const onAnnouncementSearchSuccess = (data) => {
    // TODO: Display search results

}

const searchPublicMessages = () => {
    const criteria = $('#publicMessageSearchInput').val();
    makeSearchRequest(CONTEXT.PUBLIC_MESSAGES, criteria, onPublicMessageSearchSuccess, onSearchError);
}

const onPublicMessageSearchSuccess = (response) => {
    // TODO: Display search results

}

const searchPrivateMessages = () => {

    // const selectedCategory = $('#privateMessageSearchCategorySelect').val();
    // let criteria;
    // if (selectedCategory == 'message') {
    //     criteria = {
    //         query: $('#messageInput').val(),
    //     }
    // }
    // makeSearchRequest(CONTEXT.PRIVATE_MESSAGES, criteria, onPrivateMessageSearchSuccess, onSearchError);
}

const onPrivateMessageSearchSuccess = (response) => {
    // TODO: Display search results

}

const onSearchError = (xhr, status, error) => {
    console.error('AJAX error:', status, error);
}

const makeSearchRequest = (context, criteria, onSuccess, onError) => {
    $('#searchResults').empty();
    const query = {context, criteria};
    $.ajax({
        method: 'GET',
        url: '/search',
        data: query,
        success: onSuccess,
        error: onError,
    });
}

const addCitizensSearchElementsBehavior = () => {
    $('#citizenSearchCategorySelect').change(onCitizenSearchCategorySelectChange);
}

const onCitizenSearchCategorySelectChange = () => {
    const selectedCategory = $('#citizenSearchCategorySelect').val();
    if (selectedCategory == 'status') {
        $('#statusSelect').closest('.ui.dropdown').show();
        $('#usernameInput').hide();
    } else {
        $('#statusSelect').closest('.ui.dropdown').hide();
        $('#usernameInput').show();
    }

}

const addPrivateMessagesSearchElementsBehavior = () => {
    $('#privateMessageSearchCategorySelect').change(onPrivateMessageSearchCategorySelectChange);
}

const onPrivateMessageSearchCategorySelectChange = () => {
    const selectedCategory = $('#privateMessageSearchCategorySelect').val();
    if (selectedCategory == 'message') {
        $('#messageInput').show();
    } else {
        $('#messageInput').hide();
    }
}


// export function showSearchDropdown(context) {
//     if (context == CONTEXT.CITIZENS) {
//         $('#categorySelect').show();
//     }

//     // Prevent closing the dropdown when interacting with the input and button
//     $('.ui.action.input').on('click', function (e) {
//         e.stopPropagation();
//     });


//     $('.ui.action.input button').on('click', function (e) {
//         e.stopPropagation();
//         search();
//         clearSearchInput();
//     });

//     // Listen for keydown event on the input to handle the Enter key press
//     $('.ui.action.input input').on('keydown', function (e) {
//         e.stopPropagation();
//         if (e.which === 13) {
//             search();
//             clearSearchInput(); // Call the function to clear the input
//         }
//     });
// }



// function clearSearchInput() {
//     $('.ui.action.input input').val('');
// }


// function search() {
//     let inputVal = $('.ui.action.input input').val();
//     var currentPathname = window.location.pathname;
//     let context = findContext(currentPathname);
//     console.log(context);

//     let criteria;
//     if (context == 'citizens') {
//         var selectedCategory = $('#categorySelect').val();
//         if (selectedCategory == 'status') {
//             criteria = {
//                 status: inputVal,
//             }
//         } else {
//             criteria = {
//                 usernameFragment: inputVal,
//             }
//         }
//     } else {
//         criteria = inputVal;
//     }
//     console.log(criteria);

//     sendSearchRequest(context, criteria);
//     // const {context, criteria} = req.body;
// }

// function sendSearchRequest(inputContext, inputCriteria){
//     $.ajax({
//         method: 'GET',
//         url: '/search',
//         data:{
//             context: inputContext,
//             criteria: inputCriteria,
//         },
//         success: function(response) {
//             console.log(response);
//             $('#searchResults').html(response);
//         },
//         error: function(xhr, status, error) {
//             console.error('AJAX error:', status, error);
//         }
//     });
// }


// function findContext(currentPathname) {
//     for (const key in path_to_context) {
//         if (currentPathname.startsWith(key)) {
//             return path_to_context[key];
//         }
//     }
//     return 'unknownContext';
// }