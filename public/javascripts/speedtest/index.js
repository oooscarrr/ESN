const socket = io();
let intervalIdPost = null;
let intervalIdGet = null;
let test = true;

const updateNumRequests = () => {
    const duration = 1000 * parseInt($('#speedTestForm .field input[name="duration"]').val())
    const interval = parseInt($('#speedTestForm .field input[name="interval"]').val())
    const numPostRequests = Math.ceil(duration / 2 / interval);
    $('#speedTestForm .field input[name="numPostRequests"]').val(numPostRequests);
}

socket.on('/speedtest/completion:post', (throughput, exceeded) => {
    $('#post_done').css('color', 'green');
    $('#post_throughput').css('color', 'green');
    // console.log(exceeded);
    if (exceeded) {
        // console.log("exceeded");
        stop_test();
        show_exceeded();
        test = false;
    } else {
        $('#post_throughput').text("POST throughput: " + throughput + " requests/s");
    }
});

socket.on('/speedtest/completion:get', (throughput) => {
    if(!test){
        return;
    }
    $('#get_done').css('color', 'green');
    $('#get_throughput').css('color', 'green');
    $('#testing').css('visibility', 'hidden');
    if ($('#toggleButton').hasClass("red")) {
        $('#toggleButton').removeClass("red").addClass("green").text("Start");
    }
    $('#get_throughput').text("GET throughput: " + throughput + " requests/s");
});


const show_exceeded = () => {
    $('#speed_error').show();
    $('#speed_result').hide();
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
    $('#get_throughput').css('color', 'grey').text('GET throughput: 0.0 requests/s');
    $('#post_throughput').css('color', 'grey').text('POST throughput: 0.0 requests/s');
    $('#speed_error').hide();
    $('#speed_result').show();
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
    $('#get_throughput').css('color', 'grey');
    $('#post_throughput').css('color', 'grey');
    if ($('#toggleButton').hasClass("red")) {
        $('#toggleButton').removeClass("red").addClass("green").text("Start");
    }
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


