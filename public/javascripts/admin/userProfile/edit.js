let initialFormValues;
const addComponentsActions = () => {
    $('.ui.radio.checkbox').checkbox();
    $('#profileEditForm').form().on('change', showValidationButton);

    initialFormValues = collectFormData();
    $('#profileEditForm .validate.button').click(onValidateButtonClick);
    $('#profileEditForm .confirm.button').click(onConfirmButtonClick);
    $('#profileEditForm .setPassword.button').click(showPasswordInput);
    $('#profileEditForm .cancelPassword.button').click(hidePasswordInput);
    showValidationButton();
    hidePasswordInput();

}

const onValidateButtonClick = (event) => {
    event.preventDefault();
    $('#profileEditForm .validate.button').addClass('loading');
    const changedValues = getChangedValues();
    validateChangedValues(changedValues);
}

const onConfirmButtonClick = (event) => {
    event.preventDefault();
    const changedValues = getChangedValues();
    updateUserProfile(changedValues);
}

const hidePasswordInput = () => {
    $('#profileEditForm input.password').hide();
    $('#profileEditForm .cancelPassword.button').hide();
    $('#profileEditForm .setPassword.button').show();
}

const showPasswordInput = () => {
    $('#profileEditForm input.password').show();
    $('#profileEditForm .cancelPassword.button').show();
    $('#profileEditForm .setPassword.button').hide();
}



const collectFormData = () => {
    return $('#profileEditForm').form('get values');
}

const getChangedValues = () => {
    const formValues = collectFormData();
    const changedValues = {};
    for (const key in formValues) {
        if (formValues[key] !== initialFormValues[key]) {
            if (key === "isActive") {
                if (initialFormValues[key] === true) {
                    changedValues[key] = false;
                } else {
                    changedValues[key] = true;
                }
            } else {
                changedValues[key] = formValues[key];
            }
        }
    }
    return changedValues;
}

const validateChangedValues = (changedValues) => {
    $('#profileEditForm').form('remove errors');
    if (Object.keys(changedValues).length === 0) {
        $('#profileEditForm .validate.button').removeClass('loading');
        showValidationErrors(["No changes were made."]);
        return
    }
    let validationErrors;
    $.ajax({
        url: window.location.href + '/validate',
        method: 'POST',
        data: changedValues,
        success: (data) => {
            validationErrors = data;
            $('#profileEditForm .validate.button').removeClass('loading');
            if (validationErrors.length > 0) {
                showValidationErrors(validationErrors);
            } else {
                showConfirmButton();
            }
        }
    });

}

const showValidationErrors = (validationErrors) => {
    $('#profileEditForm').form('add errors', validationErrors);
}
const showValidationButton = () => {
    $('#profileEditForm .confirm.button').hide();
    $('#profileEditForm .validate.button').show();
}
const showConfirmButton = () => {
    $('#profileEditForm .validate.button').hide();
    $('#profileEditForm .confirm.button').show();
}

const updateUserProfile = (changedValues) => {
    $.ajax({
        url: window.location.href,
        method: 'PATCH',
        data: changedValues,
        success: (data) => {
            window.location.href = '/admin/users';
        }
    });
}

$(document).ready(() => {
    addComponentsActions();
});