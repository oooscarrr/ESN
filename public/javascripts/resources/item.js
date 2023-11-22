$(document).ready(() => {
    addElementsBehavior();
});

const addElementsBehavior = () => {
    $('#deleteButton').click(showConfirmDeleteModal);
    $('#confirmDeleteModal').modal('attach events', '#cancelDeleteButton', 'hide');
    $('#editButton').click(showEditModal);
    $('#editModal').modal('attach events', '#cancelEditButton', 'hide');
}

const showConfirmDeleteModal = () => {
    $('#confirmDeleteModal').modal('show');
    $('#confirmDeleteButton').off().click(() => {
        $('#confirmDeleteModal').modal('hide');
        deleteResource();
    });
}

const showEditModal = () => {
    $('#editModal').modal('show');
    $('#confirmEditButton').off().click(() => {
        $('#editModal').modal('hide');
        editResource();
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

const editResource = () => {
    const id = window.location.href.split('/').pop();
    const data = new FormData();
    data.append('name', $('#name').val());
    data.append('quantity', $('#quantity').val());
    data.append('description', $('#description').val());
    if ($('#image')[0].files[0]) {
        data.append('image', $('#image')[0].files[0]);
    }
    $.ajax({
        method: 'PUT',
        url: `/resource/${id}`,
        data: data,
        processData: false,
        contentType: false,
    }).done(() => {
        window.location.href = `/resource/item/${id}`;
    }).fail(response => {
        console.log(response.message);
    });
}