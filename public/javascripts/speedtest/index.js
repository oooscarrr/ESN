socket = io.connect();


const updateNumRequests = () => {
    const duration = parseInt($('#speedTestForm .field input[name="duration"]').val())
    const interval = parseInt($('#speedTestForm .field input[name="interval"]').val())
    const numPostRequests = Math.ceil(duration / 2 / interval);
    $('#speedTestForm .field input[name="numPostRequests"]').val(numPostRequests);
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

$(document).ready(function () {
    updateNumRequests();
    add_components_actions();
});