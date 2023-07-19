export const catchAsyncError = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

export const catchAsyncParamsError = (fn) => {
    return (req, res, next, id) => {
        fn(req, res, next, id).catch(next);
    };
};
