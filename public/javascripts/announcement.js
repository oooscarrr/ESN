const socket = io.connect();

$(document).ready(function () {
    // Function to post a new announcement
    function postAnnouncement() {
        let announcementContent = $('#announcementInput').val();
        if (announcementContent.trim() !== '') {
            $.ajax({
                method: 'POST',
                url: '/announcements',
                data: {
                    content: announcementContent
                }
            }).done(function (response) {
                $('#announcementInput').val(''); // Clear the input 
                console.log('Announcement posted successfully');
            }).fail(function (error) {
                console.error('Error posting announcement:', error);
            });
        }
    }

    // Event handler for the post button
    $('#postAnnouncementBtn').click(function () {
        postAnnouncement();
    });
});


// Socket event listener for new announcements
socket.on('newAnnouncement', function (announcement) {
    // append the new announcement
    $('#announcementsList').append(`<div><strong>${announcement.posterName}</strong>: ${announcement.content}</div>`);
});



  