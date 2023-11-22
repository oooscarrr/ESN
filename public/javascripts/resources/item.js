$(document).ready(() => {
    addElementsBehavior();
});

const addElementsBehavior = () => {
    $('#deleteButton').click(showConfirmDeleteModal);
    $('#confirmDeleteModal').modal('attach events', '#cancelDeleteButton', 'hide');
    $('#editButton').click(showEditModal);
    $('#editModal').modal('attach events', '#cancelEditButton', 'hide');
    $('#requestButton').click(showRequestModal);
    $('#requestModal').modal('attach events', '#cancelSendRequestButton', 'hide');
    $('#cancelRequestButton').click(showCancelRequestModal);
    $('#cancelRequestModal').modal('attach events', '#cancelCancelRequestButton', 'hide');
    $('.viewRequestButton').click(function () {
        const requestId = $(this).data('request-id');
        const requesterName = $(this).data('requester-name');
        const quantity = $(this).data('quantity');
        const message = $(this).data('message');
        showHandleRequestModal(requestId, requesterName, quantity, message);
    });
    $('#handleRequestModal').modal('attach events', '#cancelHandleRequestButton', 'hide');

    $('#editName').click(() => {
        $('#nameField').removeClass('error');
    });
    $('#editQuantity').click(() => {
        $('#quantityField').removeClass('error');
    });
    $('#requestQuantity').click(() => {
        $('#requestQuantityField').removeClass('error');
    });
}

const showConfirmDeleteModal = () => {
    $('#confirmDeleteModal').modal('show');
    $('#confirmDeleteButton').off().click(() => {
        $('#confirmDeleteModal').modal('hide');
        deleteResource();
    });
}

const deleteResource = () => {
    const id = window.location.href.split('/').pop();
    $.ajax({
        method: 'DELETE',
        url: `/resource/${id}`,
    }).done(() => {
        window.location.href = '/resource';
    }).fail(response => {
        console.log(response.message);
    });
}

const checkFields = () => {
    if ($('#editName').val() == '' || $('#editName').val().length > 20) {
        $('#nameField').addClass('error');
        return false;
    }
    if ($('#editQuantity').val() < 1) {
        $('#quantityField').addClass('error');
        return false;
    }
    return true;
}

const showEditModal = () => {
    $('#editModal').modal('show');
    $('#confirmEditButton').off().click(() => {
        if (!checkFields()) {
            return;
        }
        $('#editModal').modal('hide');
        editResource();
    });
}

const editResource = () => {
    const id = window.location.href.split('/').pop();
    const data = new FormData();
    data.append('name', $('#editName').val());
    data.append('quantity', $('#editQuantity').val());
    data.append('description', $('#editDescription').val());
    if ($('#editImage')[0].files[0]) {
        data.append('image', $('#editImage')[0].files[0]);
    }
    $.ajax({
        method: 'PUT',
        url: `/resource/${id}`,
        data: data,
        processData: false,
        contentType: false,
    }).done(() => {
        window.location.reload();
    }).fail(response => {
        console.log(response.message);
    });
}

const showHandleRequestModal = (requestId, requesterName, quantity, message) => {
    $('#handleRequestModal').modal('show');
    $('#requesterNameHeader').text(`Request from ${requesterName}`);
    $('#reqQuantity').text(`Quantity: ${quantity}`);
    $('#reqMessage').text(message);
    if (quantity > getCurrentQuantity()) {
        $('#acceptRequestButton').addClass('disabled');
    } else {
        $('#acceptRequestButton').off().click(() => {
            $('#handleRequestModal').modal('hide');
            acceptRequest(requestId);
        });
    }
    $('#rejectRequestButton').off().click(() => {
        $('#handleRequestModal').modal('hide');
        rejectRequest(requestId);
    });
}

const acceptRequest = (id) => {
    $.ajax({
        method: 'PUT',
        url: `/resource/acceptrequest/${id}`,
    }).done(() => {
        window.location.reload();
    }).fail(response => {
        console.log(response.message);
    });
}

const rejectRequest = (id) => {
    $.ajax({
        method: 'PUT',
        url: `/resource/rejectrequest/${id}`,
    }).done(() => {
        window.location.reload();
    }).fail(response => {
        console.log(response.message);
    });
};

const showRequestModal = () => {
    $('#requestModal').modal('show');
    $('#sendRequestButton').off().click(() => {
        const quantityLeft = getCurrentQuantity();
        if ($('#requestQuantity').val() < 1 || $('#requestQuantity').val() > quantityLeft) {
            $('#requestQuantityField').addClass('error');
            return;
        }
        $('#requestModal').modal('hide');
        sendRequest();
    });
}

const sendRequest = () => {
    const id = window.location.href.split('/').pop();
    $.ajax({
        method: 'POST',
        url: `/resource/sendrequest`,
        data: {
            resourceId: id,
            quantity: $('#requestQuantity').val(),
            message: $('#requestMessage').val(),
        }
    }).done(() => {
        window.location.reload();
    }).fail(response => {
        console.log(response.message);
    });
}

const showCancelRequestModal = () => {
    $('#cancelRequestModal').modal('show');
    $('#confirmCancelRequestButton').off().click(() => {
        $('#cancelRequestModal').modal('hide');
        cancelRequest();
    });
}

const cancelRequest = () => {
    const id = window.location.href.split('/').pop();
    $.ajax({
        method: 'DELETE',
        url: `/resource/deleterequest/${id}`,
    }).done(() => {
        window.location.reload();
    }).fail(response => {
        console.log(response.message);
    });
}

const getCurrentQuantity = () => {
    const quantity = $('#ownerAndQuantity').text().split(',')[1].trim().split(' ')[0];
    return Number(quantity);
}