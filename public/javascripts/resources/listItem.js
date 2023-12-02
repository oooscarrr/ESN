$(document).ready(() => {
    addElementsBehavior();
});

const addElementsBehavior = () => {
    $('#submitButton').click(submitForm);
    $('#cancelButton').click(cancelForm);
    $('#name').click(() => {
        $('#nameField').removeClass('error');
    });
    $('#quantity').click(() => {
        $('#quantityField').removeClass('error');
    });
};

const checkFields = () => {
    if ($('#name').val() == '' || $('#name').val().length > 20) {
        $('#nameField').addClass('error');
        return false;
    }
    if ($('#quantity').val() < 1) {
        $('#quantityField').addClass('error');
        return false;
    }
    return true;
}

const submitForm = (e) => {
    e.preventDefault();
    if (!checkFields()) {
        return;
    }
    const data = new FormData();
    data.append('name', $('#name').val());
    data.append('quantity', $('#quantity').val());
    data.append('description', $('#description').val());
    if ($('#image')[0].files[0]) {
        data.append('image', $('#image')[0].files[0]);
    }
    $.ajax({
        method: 'POST',
        url: '/resources',
        data: data,
        processData: false,
        contentType: false,
    }).done(function (response) {
        console.log(response);
        window.location.href = `/resources`;
    }).fail(function (response) {
        console.log(response.message);
    });
};

const cancelForm = () => {
    window.location.href = '/resources';
}