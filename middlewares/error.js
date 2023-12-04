import createError from 'http-errors';

// catch 404 and forward to error handler
function catchError(req, res, next) {
    next(createError(404));
}

function setLocals(err, req, res) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
}

// render the error page
function renderErrorPage(err, req, res) {
    res.status(err.status || 500);
    res.render('error');
}

// error handler
function handleError(err, req, res) {
    setLocals(err, req, res);
    renderErrorPage(err, req, res);
}

export { catchError, handleError }; 