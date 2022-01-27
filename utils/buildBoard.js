
function buildBoard(array, grid = 4) {
    if (!array) array = new Array(grid * grid);
    const { createCanvas} = require('canvas');
    const canvas = createCanvas(20 + (120 * grid), 20 + (120 * grid));
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(185, 152, 126, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < array.length; i++) {
        if (!array[i]) ctx.fillStyle = 'rgba(213, 192, 175, 255)';
        else {
            switch (array[i]) {
                case 1:
                    ctx.fillStyle = '#eee4da';
                    break;
                case 2:
                    ctx.fillStyle = '#ede0c8';
                    break;
                case 3:
                    ctx.fillStyle = '#f2b179';
                    break;
                case 4:
                    ctx.fillStyle = '#f67c5f';
                    break;
                case 5:
                    ctx.fillStyle = '#f65e3b';
                    break;
                case 6:
                    ctx.fillStyle = '#edcf72';
                    break;
                case 7:
                    ctx.fillStyle = '#edcc61';
                    break;
                case 8:
                    ctx.fillStyle = '#edc850';
                    break;
                case 9:
                    ctx.fillStyle = '#edc53f';
                    break;
                case 10:
                    ctx.fillStyle = '#edc22e';
                    break;
                case 11:
                    ctx.fillStyle = 'rgba(255, 232, 7, 1)';
                    break;
                default:
                    ctx.fillStyle = 'rgba(20, 18, 16, 1)';
                    break;
            }
        }
        let x = 20 + ((i % grid) * 120)
        let y = 20 + (Math.floor((i / grid)) * 120)
        roundRect(ctx, x, y, 100, 100, 8).fill()
        if (!array[i]) continue
        var number = Math.pow(2, array[i]);
        if (array[i] <= 3) {
            ctx.fillStyle = '#776e65';
            fitTextOnCanvas(ctx, number, "Arial", x - 17, y + 80, 90)
        } else {
            ctx.fillStyle = '#f9f6f2';
            fitTextOnCanvas(ctx, number, "Arial", x, y + 60, 90)
        }
    }
    return canvas
}

function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    return ctx;
}


function fitTextOnCanvas(ctx, text, fontface,x,y,width) {

    // start with a large font size
    var fontsize = 90;

    // lower the font size until the text fits the canvas
    do {
        fontsize--;
        ctx.font = fontsize + "px " + fontface;
    } while (ctx.measureText(text).width > width)

    let toAddX = width - ctx.measureText(text).width
    // draw the text
    ctx.fillText(text, x + toAddX, y);

}

module.exports = buildBoard;