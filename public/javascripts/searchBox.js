import { CONTEXT, urlToContext } from '/shared/context.js';


let pageIndex;
/**
 *
 * @returns {CONTEXT} The context of the current page. Will be one of the values in the CONTEXT enum.
 */
export const determineContext = () => {
    var currentPathname = window.location.pathname;
    return urlToContext(currentPathname);
}


export const initializeSearchBox = () => {
    const context = determineContext();
    displayAndHideSearchElements(context);
    addSearchElementBehavior(context);
    pageIndex = 0;
}

const displayAndHideSearchElements = (context) => {
    if (context == CONTEXT.CITIZENS) {
        $('#statusSelect').closest('.ui.dropdown').hide();
        $('#leftArrow').hide()
        $('#rightArrow').hide()
    }
    $('#emptyResultPrompt').hide();
}

const addSearchElementBehavior = (context) => {
    addSearchButtonBehavior(context);
    addEnterToSearchBehavior(context);
    addPaginationBehavior(context);
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

const addEnterToSearchBehavior = (context) => {
    $('.ui.action.input .ui.input').on('keydown', function (e) {
        if (e.which === 13) {
            $('#searchButton').click();
        }
    });
}

const addPaginationBehavior = (context)=>{
    $('#leftArrow').click(getContextSpecificSearchPrevHandler(context));
    $('#rightArrow').click(getContextSpecificSearchNextHandler(context));
}

const getContextSpecificSearchNextHandler = (context) => {
    return () => {
        if (!makeSureTextInputIsNotEmpty()) {
            return;
        }
        pageIndex++;
        console.log(pageIndex);
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


const getContextSpecificSearchPrevHandler = (context) => {
    return () => {
        if (!makeSureTextInputIsNotEmpty() || pageIndex == 0) {
            return;
        }
        pageIndex--;
        console.log(pageIndex);
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

const onPrevPage = (context) =>{
    if(pageIndex == 0){
        return;
    }
    pageIndex--;
    return getContextSpecificSearchButtonClickHandler(context);
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
    makeSearchRequest(CONTEXT.CITIZENS, criteria, pageIndex, onCitizenSearchSuccess, onSearchError);
}

const onCitizenSearchSuccess = (results) => {
    promptOrUnpromptEmptyResults(results);
    $('#searchResults').append(results);
    $('.ui.accordion').accordion();

}

const searchAnnouncements = () => {
    const criteria = $('#announcementSearchInput').val();
    makeSearchRequest(CONTEXT.ANNOUNCEMENTS, criteria, pageIndex, onAnnouncementSearchSuccess, onSearchError);
}

const onAnnouncementSearchSuccess = (results) => {
    promptOrUnpromptEmptyResults(results);
    $('#searchResults').append(results);
}

const searchPublicMessages = () => {
    const criteria = $('#publicMessageSearchInput').val();
    makeSearchRequest(CONTEXT.PUBLIC_MESSAGES, criteria, pageIndex, onPublicMessageSearchSuccess, onSearchError);
}

const onPublicMessageSearchSuccess = (results) => {
    promptOrUnpromptEmptyResults(results);
    $('#searchResults').append(results);
}

const searchPrivateMessages = () => {
    const selectedCategory = $('#privateMessageSearchCategorySelect').val();
    let criteria = {};
    criteria.myUserId = currentUserId;
    criteria.otherUserId = anotherUserId;
    criteria.pageIndex = pageIndex;
    if (selectedCategory == 'message') {
        criteria.query = $('#messageContentInput').val();
    }else{
        criteria.status = true;
    }
    console.log(criteria);
    makeSearchRequest(CONTEXT.PRIVATE_MESSAGES, criteria, pageIndex, onPrivateMessageSearchSuccess, onSearchError);
}

const onPrivateMessageSearchSuccess = (results) => {
    promptOrUnpromptEmptyResults(results);
    $('#searchResults').append(results);

}

const onSearchError = (xhr, status, error) => {
    console.error('AJAX error:', status, error);
}

const promptOrUnpromptEmptyResults = (results) => {
    if(results.trim() == ''){
        $('#emptyResultPrompt').show();
    } else {
        $('#emptyResultPrompt').hide();
    }
}
const makeSearchRequest = (context, criteria, pageIndex, onSuccess, onError) => {
    $('#searchResults').children().not('#emptyResultPrompt').remove();
    const query = {context, criteria, pageIndex};
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
        $('#messageContentInput').show();
    } else {
        $('#messageContentInput').hide();
    }
}
