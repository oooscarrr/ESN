$(document).ready(() => {
    addElementsBehavior();
});

const addElementsBehavior = () => {
    $('#searchResourceButton').click(search);
};

const search = () => {
    const keyword = $('#searchResourceInput').val().trim();
    window.location.href = `/resource?keyword=${keyword}`;
}