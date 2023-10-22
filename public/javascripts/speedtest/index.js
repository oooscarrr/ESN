socket = io("/speedtest");
let intervalIdPost = null;
let intervalIdGet = null;
let test = true;

const updateNumRequests = () => {
    const duration = 1000 * parseInt($('#speedTestForm .field input[name="duration"]').val())
    const interval = parseInt($('#speedTestForm .field input[name="interval"]').val())
    const numPostRequests = Math.ceil(duration / 2 / interval);
    $('#speedTestForm .field input[name="numPostRequests"]').val(numPostRequests);
}

socket.on('completion:post', (throughput, exceeded) => {
    $('#post_done').css('color', 'green');
    if (exceeded) {
        show_exceeded();
    }
    $('#post_throughput').text(throughput);
});

socket.on('completion:get', (throughput) => {
    getThroughput = throughput;
    $('#get_done').css('color', 'green');
    $('#testing').css('visibility', 'hidden');
    if ($('#toggleButton').hasClass("red")) {
        $('#toggleButton').removeClass("red").addClass("green").text("Start");
    }
    $('#get_throughput').text(throughput);
});


const show_exceeded = () => {
    $('#post_throughput').text('error: max number of post requests exceeded');
    //TODO: better way to do this
}

const add_components_actions = () => {
    $('#speedTestForm .field input[name="duration"], #speedTestForm .field input[name="interval"]').on('input', function () {
        updateNumRequests();
    });
    $('#speedTestForm').form({
        inline: true,
        fields: {
            duration: "empty",
            interval: "empty",
            numPostRequests: ["maxValue[1000]", "empty"],
        },
        onSuccess: (event, fields) => {
            event.preventDefault();
        }
    });
}

const send_test_post_req = () => {
    const messageContent = '20CharacterStringMsg';
    $.ajax({
        method: 'POST',
        url: '/messages/public',
        data: {
            content: messageContent,
        }
    })
}

const send_test_get_req = () => {
    $.ajax({
        method: 'GET',
        url: '/messages/public',
    })
}

const start_test = () => {
    test = true;
    $('#post_done').css('color', 'grey');
    $('#get_done').css('color', 'grey');
    $('#testing').css('visibility', 'visible');
    const duration = 1000 * parseInt($('#speedTestForm .field input[name="duration"]').val());
    const interval = parseInt($('#speedTestForm .field input[name="interval"]').val());

    console.log("Start ESN Speed Test with duration: " + duration + "ms, interval: " + interval);

    $.ajax({
        url: '/speedtest/start',
        type: 'PATCH',
        data: {
            duration: duration,
            interval: interval,
        },
        success: () => {
            if (test) {
                intervalIdPost = setInterval(send_test_post_req, interval);
                setTimeout(() => {
                    clearInterval(intervalIdPost);
                    if (test) {
                        intervalIdGet = setInterval(send_test_get_req, interval);
                        setTimeout(() => {
                            clearInterval(intervalIdGet);
                        }, duration / 2);
                    }
                }, duration / 2);
            }
        },
        error: () => {
            console.error("error setting up speed test");
        }
    });
}
const stop_test = () => {
    test = false;
    clearInterval(intervalIdPost);
    clearInterval(intervalIdGet);

    $.ajax({
        method: 'PATCH',
        url: '/speedtest/stop',
    });
    $('#post_done').css('color', 'grey');
    $('#get_done').css('color', 'grey');
    $('#testing').css('visibility', 'hidden');
}
$(document).ready(function () {
    updateNumRequests();
    add_components_actions();
    $("#toggleButton").click(function () {
        if ($(this).hasClass("green")) {
            $(this).removeClass("green").addClass("red").text("Stop");
            start_test();
        } else {
            $(this).removeClass("red").addClass("green").text("Start");
            stop_test()
        }
    });
});


