/*
    fill the form with the data
*/

const Filler = require('./filler');

async function fill(args, buildPages) {

    // build filler
    filler = new Filler(args);

    // Print out all the pages. The page are not used in this case, so we can pass in null.
    const webpages = buildPages(null, args)
    webpages.print_page_list();

    // Fill the pages if args.print is false.
    if (!args.print) await filler.fill(buildPages);
}

module.exports = { fill };