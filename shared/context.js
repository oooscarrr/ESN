/**
 * This file contains the Enum-style definitions for the context used im search by both the server and the client, as well as associated utility functions.
 */
export const CONTEXT = Object.freeze({
    CITIZENS: 'citizens',
    ANNOUNCEMENTS: 'announcements',
    PUBLIC_MESSAGES: 'publicMessages',
    PRIVATE_MESSAGES: 'privateMessages',
    OTHER: 'other',
})
export const urlToContext = (url) => {
    let context = CONTEXT.OTHER;
    const urlSegments = url.split('/').slice(1);
    if (urlSegments.length > 0) {
        switch (urlSegments[0]) {
            case 'users':
                context = CONTEXT.CITIZENS;
                break;
            case 'announcements':
                context = CONTEXT.ANNOUNCEMENTS;
                break;
            case 'messages':
                if (urlSegments.length > 1) {
                    switch (urlSegments[1]) {
                        case 'public':
                            context = CONTEXT.PUBLIC_MESSAGES;
                            break;
                        case 'private':
                            context = CONTEXT.PRIVATE_MESSAGES;
                            break;
                    }
                }
                break;
        }
    }
    return context;
}