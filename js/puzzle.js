var puzzle = (function () {
    "use strict";
    return {
        dimensions: [1, 1],
        pieces: [],
        selectedPiece: null,
        image: new Image(),
        initPieces: function (width, height) {
            var hsize = this.dimensions[0], vsize = this.dimensions[1];
            var hunit = Math.floor(width / hsize);
            var vunit = Math.floor(height / vsize);
            this.pieces = new Array(hsize * vsize).fill(0).map(function (_, i) {
                var correctPosition = [hunit * (i % hsize), vunit * (Math.floor(i / hsize))]; // oh yeah !
                return {current: [width, height], goal: correctPosition};
            });
        },
        setImage: function (img) {
            this.image = img;
            this.initPieces(img.width, img.height);
        },
        setDimensions: function (hnum, vnum) {
            this.dimensions = [hnum, vnum];
            this.initPieces(this.image.width, this.image.height);
        },
        shuffle: function (width, height) {
            var hsize = this.dimensions[0], vsize = this.dimensions[1];
            var hmax = width - Math.floor(width / hsize);
            var vmax = height - Math.floor(height / vsize);
            this.pieces.forEach(function (piece) {
                piece.current = [hmax * Math.random() + width, vmax * Math.random()];
            });
        },
        draw: function (ctx) {
            var hsize = this.dimensions[0], vsize = this.dimensions[1];
            var img = this.image;
            ctx.clearRect(0, 0, img.width * 2, img.height * 2);
            ctx.globalAlpha = 0.8;
            ctx.drawImage(img, 0, 0);
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.strokeStyle = "#ddd";
            this.pieces.forEach(function (piece) {
                var h = piece.goal[0], v = piece.goal[1];
                ctx.rect(h, v, img.width / hsize, img.height / vsize);
            });
            ctx.stroke();
            this.pieces.forEach(function (piece) {
                var h = piece.current[0], v = piece.current[1],
                        correctH = piece.goal[0], correctV = piece.goal[1];
                ctx.drawImage(img, correctH, correctV, img.width / hsize, img.height / vsize,
                        h, v, img.width / hsize, img.height / vsize);
            });
        },
        inRect: function (pos, rect) {
            var posX = pos[0], posY = pos[1], rectX = rect[0], rectY = rect[1], rectW = rect[2], rectH = rect[3];
            return posX >= rectX && posX <= rectX + rectW && posY >= rectY && posY <= rectY + rectH;
        }
    };
}());

$(function () {
    "use strict";
    var puzzleCtx = $("#puzzle-img")[0].getContext("2d");
    var uploaded = Object.assign(document.createElement("input"), {type: "file", style: "display:none", accept: "image/gif, image/jpeg, image/png"});

    puzzle.dimensions = [3, 3];
    $("#puzzle-game")[0].appendChild(uploaded);
    $("#load-image").click(function (e) {
        uploaded.click();
    });
    uploaded.onchange = function (e) {
        var READER = new FileReader();
        READER.onload = function (e) {
            var imageBuffer = READER.result;
            puzzle.image.src = URL.createObjectURL(new Blob([imageBuffer], {type: uploaded.files[0].type}));
        };
        READER.readAsArrayBuffer(uploaded.files[0]);
    };
    $(puzzle.image).load(function (e) {
        URL.revokeObjectURL(puzzle.image.src);
        puzzleCtx.canvas.width = puzzle.image.width * 2;
        puzzleCtx.canvas.height = puzzle.image.height;
        puzzle.setImage(puzzle.image);
        puzzle.draw(puzzleCtx);
    });
    $("#shuffle").click(function (e) {
        puzzle.shuffle(puzzle.image.width, puzzle.image.height);
        puzzle.draw(puzzleCtx);
    });
    $("#size-selector").click(function (e) {
        puzzle.setDimensions(e.target.cellIndex + 1, e.target.parentNode.rowIndex + 1);
        puzzle.draw(puzzleCtx);
    });
    function handleMove(e) {
        var hsize = puzzle.dimensions[0], vsize = puzzle.dimensions[1];
        if (puzzle.selectedPiece === null) {
            return;
        }
        puzzle.selectedPiece.current = [e.offsetX - 0.5 * puzzle.image.width / hsize, e.offsetY - 0.5 * puzzle.image.height / vsize];
        puzzle.draw(puzzleCtx);
    }
    $("#puzzle-img").mousedown(function (e) {
        var hsize = puzzle.dimensions[0], vsize = puzzle.dimensions[1];
        var oldSelectedPiece = puzzle.selectedPiece;
        puzzle.pieces.forEach(function (piece, i) {
            var posH = piece.current[0], posV = piece.current[1];
            var rect = [posH, posV, puzzle.image.width / hsize, puzzle.image.height / vsize];
            if (puzzle.inRect([e.offsetX, e.offsetY], rect)) {
                puzzle.selectedPiece = puzzle.pieces[i];
                puzzle.pieces[i] = puzzle.pieces[puzzle.pieces.length - 1];
                puzzle.pieces[puzzle.pieces.length - 1] = puzzle.selectedPiece;
            }
        });
        if (oldSelectedPiece === puzzle.selectedPiece) {
            puzzle.selectedPiece = null;
        }
        puzzle.draw(puzzleCtx);
        $("#puzzle-img").on("mousemove", handleMove);
    });
    $("#puzzle-img").mouseup(function (e) {
        puzzle.selectedPiece = null;
        $("#puzzle-img").off("mousemove", handleMove);
    });
});
