function generateRandom(message, array, min = 1) {
    let randomArr = new Array(10);
    randomArr[4] = true;
    let random = randomArr[Math.floor(Math.random() * randomArr.length)]
    if (random == true) min++
    let emptyIndex = getEmptySpaces(array);
    array[emptyIndex[Math.floor(Math.random() * emptyIndex.length)]] = min;
    return array;
}

function getEmptySpaces(array) {
    let emptyIndex = []
    for (let i = 0; i <= array.length - 1; i++) {
        if (!array[i]) emptyIndex.push(i);
    }
    return emptyIndex;
}

function move(message, array, direction, grid, score) {
    if (canMove([...array], direction, grid)) {
        if (direction == "up") {
            return goUp([...array], grid, grid, score);
        } else if (direction == "down") {
            return goDown([...array], grid, grid, score);
        } else if (direction == "left") {
            return goLeft([...array], grid, grid, score);
        } else if (direction == "right") {
            return goRight([...array], grid, grid, score);
        }
    } else if (getEmptySpaces([...array]).length <= 0 && !canMove([...array], direction, grid)) { 
        if (!canMove([...array], "up", grid) && !canMove([...array], "down", grid) && !canMove([...array], "left", grid) && !canMove([...array], "right", grid)) return "gameover";

    } else return false
}

function canMove(array, direction, grid) {
    let newarr = [...array];
    if (direction == "up") {
        newarr = goUp(newarr, grid, grid, 0).positions;
    } else if (direction == "down") {
        newarr = goDown(newarr, grid, grid, 0).positions;
    } else if (direction == "left") {
        newarr = goLeft(newarr, grid, grid, 0).positions;
    } else if (direction == "right") {
        newarr = goRight(newarr, grid, grid, 0).positions;
    }
    return !arraysEqual(newarr, array)
}

function goUp(array, num, grid, score) {
    if (num == 0) {
        array = array.map(a => {
            if (typeof a != "string") return a;
            return parseInt(a.replace("t", ""))
        })
        return { positions: array, score: score }
    }
    for (let i = grid - 1; i >= 0; i--) {
        for (let j = grid + i; j <= (grid * grid); j += grid) {
            if (!array[j]) continue;
            if (!array[j - grid]) {
                array[j - grid] = array[j];
                array[j] = undefined;
            }
            if (array[j] == array[j - grid]) {
                score += Math.pow(2, array[j - grid])*2;
                array[j - grid] = (array[j - grid]+1) + "t";
                array[j] = undefined;
            }
        }
    }
    return goUp(array, num - 1, grid, score)
}

function goDown(array, num, grid, score) {
    if (num == 0) {
        array = array.map(a => {
            if (typeof a != "string") return a;
            return parseInt(a.replace("t", ""))
        })
        return { positions: array, score: score }
    }
    for (let i = grid; i >= 1; i--) {
        for (let j = (((grid * grid) - grid)) - i; j >= 0; j -= grid) {
            if (!array[j]) continue;
            if (!array[j + grid]) {
                array[j + grid] = array[j];
                array[j] = undefined;
            }
            if (array[j] == array[j + grid]) {
                score += Math.pow(2, array[j + grid])*2;
                array[j + grid] = (array[j + grid]+1) + "t";
                array[j] = undefined;
            }
        }
    }
    return goDown(array, num - 1, grid, score)
}

function goLeft(array, num, grid, score) {
    if (num == 0) {
        array = array.map(a => {
            if (typeof a != "string") return a;
            return parseInt(a.replace("t", ""))
        })
        return { positions: array, score: score }
    }
    for (let i = 0; i < grid; i++) {
        for (let j = (i * grid) + 1; j <= ((i * grid) + grid) - 1; j++) {
            if (!array[j]) continue;
            if (!array[j - 1]) {
                array[j - 1] = array[j];
                array[j] = undefined;
            }
            if (array[j] == array[j - 1]) {
                score += Math.pow(2, array[j - 1])*2;
                array[j - 1] = (array[j - 1] +1) + "t";
                array[j] = undefined;
            }
        }
    }
    return goLeft(array, num - 1, grid, score)
}


function goRight(array, num, grid, score) {
    if (num == 0) {
        array = array.map(a => {
            if (typeof a != "string") return a;
            return parseInt(a.replace("t", ""))
        })
        return { positions: array, score: score }
    }
    for (let i = 0; i < grid; i++) {
        for (let j = ((i * grid) + grid) - 2; j >= (i * grid); j--) {
            if (!array[j]) continue;
            if (!array[j + 1]) {
                array[j + 1] = array[j];
                array[j] = undefined;
            }
            if (array[j] == array[j + 1]) {
                score += Math.pow(2, array[j + 1])*2;
                array[j + 1] = (array[j + 1] +1) + "t";
                array[j] = undefined;
            }
        }
    }
    return goRight(array, num - 1, grid, score)
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

module.exports = { generateRandom, getEmptySpaces, canMove, move }