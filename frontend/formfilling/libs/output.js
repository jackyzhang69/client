const colors = require('colors');


// print_out is a interface for future GUI as a replacement of console.log
function print(message, style) {
    switch (style) {
        case 'info':
            console.log(`${colors.blue(message)}`);
            break;
        case 'error':
            console.log(`${colors.red(message)}`);
            break;
        case 'success':
            console.log(`${colors.green(message)}`);
            break;
        case 'warning':
            console.log(`${colors.yellow(message)}`);
            break;
        default:
            const darkWhite = colors.white.dim;
            console.log(`${darkWhite(message)}`);
            break;

    }
}


module.exports = {
    print
};
