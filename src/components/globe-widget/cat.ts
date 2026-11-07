// Dot-matrix cat, sitting and facing left with one paw on the globe.
// '#' fur, 't' tail (wagged from JS). Each map row is one dot row.
const LEFT_PAD = 3; // room for the raised paw to reach toward the globe

const FUR = [
	'..#.......#...........',
	'..##.....##...........',
	'..#########...........',
	'.###########..........',
	'.###########..........',
	'.###########..........',
	'.###########..........',
	'..#########...........',
	'...#######............',
	'...########...........',
	'..##########..........',
	'..###########.........',
	'.#############........',
	'.##############....tt.',
	'.##############.....t.',
	'.###############....t.',
	'.###############...tt.',
	'.#################tt..',
	'..################....',
	'..##.##..#########....',
];

export type Dot = [col: number, row: number];

const shift = (dots: Dot[]): Dot[] => dots.map(([c, r]) => [c + LEFT_PAD, r]);

function collect(ch: string): Dot[] {
	const dots: Dot[] = [];
	FUR.forEach((line, row) => {
		[...line].forEach((c, col) => {
			if (c === ch) dots.push([col, row]);
		});
	});
	return dots;
}

export const CAT = {
	cols: FUR[0].length + LEFT_PAD,
	rows: FUR.length,
	fur: shift(collect('#')),
	tail: shift(collect('t')),
	// Front paw reaching up-left from the chest to rest on the globe.
	paw: [[0, 9], [1, 9], [0, 10], [1, 10], [2, 11], [3, 12]] as Dot[],
	// Light dots drawn over the fur.
	eyes: shift([[3, 4], [3, 5], [9, 4], [9, 5]]),
	dizzyEyes: shift([
		[2, 3], [4, 3], [3, 4], [2, 5], [4, 5],
		[8, 3], [10, 3], [9, 4], [8, 5], [10, 5],
	]),
	nose: shift([[6, 6]]),
	// Faint dots poking out either side of the face.
	whiskers: shift([[-1, 5], [-2, 5], [-1, 7], [-2, 7.4], [12, 5], [13, 5], [12, 7], [13, 7.4]]),
	// Where the tail joins the body, used as the wag pivot.
	tailPivot: shift([[17, 17]])[0],
};

// Head only (rows 0-8), used for the collapsed launcher button.
export const CAT_HEAD = {
	cols: 13,
	rows: 9,
	fur: collect('#').filter(([, r]) => r < 9),
	eyes: [[3, 4], [3, 5], [9, 4], [9, 5]] as Dot[],
	nose: [[6, 6]] as Dot[],
};
