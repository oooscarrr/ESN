const add_components_actions = () => {
    $('.ui.accordion').accordion({
        animateChildren: false,
    });
    $('.menu .item')
        .tab();
}

$(document).ready(() => {
    add_components_actions();
});