const socket = io.connect();

$(document).ready(function () {
    addElementsBehavior();
});

// Function to post a new announcement
function postAnnouncement() {
    const announcementContent = $('#announcementInput').val();
    if (announcementContent.trim() !== '') {
        $.ajax({
            method: 'POST',
            url: '/announcements',
            data: {
                content: announcementContent
            }
        }).done(function (response) {
            $('#announcementInput').val(''); // Clear the input
        }).fail(function (error) {
            console.error('Error posting announcement:', error);
        });
    }
}

function addElementsBehavior() {
    $('#postAnnouncementBtn').click(postAnnouncement);
    
    $('#announcementInput').on('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            postAnnouncement();
        }
    });
}  

// Socket event listener for new announcements
socket.on('newAnnouncement', function (announcement) {
    // append the new announcement
    $('#announcementsList').prepend(announcementObj(announcement));
});

function announcementObj(announcement) {
    const localTime = new Date(announcement.createdAt).toLocaleString()
    return "<li class='announcement-item'><div class='announcement-content'><strong>" + announcement.posterName
        + ":</strong><span>" + announcement.content + "</span></div><div class='announcement-timestamp'><span>"
        + localTime + "</span></div></li>"
}