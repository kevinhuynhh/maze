"""Command-line tool for generating perfect mazes.

This module provides a depth-first-search based maze generator that can be
used as a standalone script or imported as a library.  The generated mazes are
perfect mazes (they contain exactly one path between any two cells).

Examples
--------
Generate a 10x6 maze and print it to the console::

    python maze_generator.py 10 6 --seed 42

Save a 20x10 maze to a file using custom wall and path characters::

    python maze_generator.py 20 10 --wall "#" --path " " --output maze.txt

"""
from __future__ import annotations

from dataclasses import dataclass
import argparse
import random
from typing import Iterable, List, Optional, Sequence, Tuple


Direction = Tuple[int, int]

# Orthogonal directions: west, east, north, south.
_DIRECTIONS: Sequence[Direction] = ((-1, 0), (1, 0), (0, -1), (0, 1))


@dataclass
class Maze:
    """A generated maze backed by a boolean grid.

    The grid contains ``True`` for walkable tiles and ``False`` for walls.
    """

    width: int
    height: int
    grid: List[List[bool]]

    def to_ascii(self, wall: str = "#", path: str = " ") -> str:
        """Return an ASCII representation of the maze.

        Parameters
        ----------
        wall:
            Character (or short string) used for walls.
        path:
            Character (or short string) used for open spaces.
        """

        if not wall:
            raise ValueError("wall character must be a non-empty string")
        if not path:
            raise ValueError("path character must be a non-empty string")

        rows = []
        for row in self.grid:
            rows.append("".join(path if cell else wall for cell in row))
        return "\n".join(rows)

    def __str__(self) -> str:  # pragma: no cover - delegated to to_ascii
        return self.to_ascii()


def _validate_dimensions(width: int, height: int) -> None:
    if width <= 0 or height <= 0:
        raise ValueError("width and height must be positive integers")


def _create_grid(width: int, height: int) -> List[List[bool]]:
    rows = 2 * height + 1
    cols = 2 * width + 1
    return [[False for _ in range(cols)] for _ in range(rows)]


def _cell_index(x: int, y: int) -> Tuple[int, int]:
    return 2 * y + 1, 2 * x + 1


def _carve_passage(grid: List[List[bool]], x1: int, y1: int, x2: int, y2: int) -> None:
    row1, col1 = _cell_index(x1, y1)
    row2, col2 = _cell_index(x2, y2)
    grid[row1][col1] = True
    grid[row2][col2] = True
    wall_row = row1 + (row2 - row1) // 2
    wall_col = col1 + (col2 - col1) // 2
    grid[wall_row][wall_col] = True


def _neighbors(x: int, y: int, width: int, height: int) -> Iterable[Tuple[int, int]]:
    for dx, dy in _DIRECTIONS:
        nx, ny = x + dx, y + dy
        if 0 <= nx < width and 0 <= ny < height:
            yield nx, ny


def generate_maze(
    width: int,
    height: int,
    *,
    algorithm: str = "dfs",
    seed: Optional[int] = None,
) -> Maze:
    """Generate a new maze using the requested algorithm.

    Parameters
    ----------
    width, height:
        Maze dimensions in cells.
    algorithm:
        Currently only ``"dfs"`` (recursive backtracker) is supported.
    seed:
        Optional random seed to make generation deterministic.
    """

    _validate_dimensions(width, height)

    if algorithm.lower() != "dfs":
        raise ValueError("unsupported algorithm: {0}".format(algorithm))

    rng = random.Random(seed)
    grid = _create_grid(width, height)

    stack: List[Tuple[int, int]] = [(0, 0)]
    visited = {(0, 0)}
    start_row, start_col = _cell_index(0, 0)
    grid[start_row][start_col] = True

    while stack:
        x, y = stack[-1]
        unvisited = [n for n in _neighbors(x, y, width, height) if n not in visited]
        if not unvisited:
            stack.pop()
            continue

        nx, ny = rng.choice(unvisited)
        _carve_passage(grid, x, y, nx, ny)
        visited.add((nx, ny))
        stack.append((nx, ny))

    # Create entrance and exit.
    grid[1][0] = True
    grid[2 * height - 1][2 * width] = True

    return Maze(width=width, height=height, grid=grid)


def _parse_args(argv: Optional[Sequence[str]]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate perfect ASCII mazes")
    parser.add_argument("width", type=int, help="Maze width in cells")
    parser.add_argument("height", type=int, help="Maze height in cells")
    parser.add_argument(
        "-a",
        "--algorithm",
        default="dfs",
        choices=["dfs"],
        help="Generation algorithm (currently only dfs)",
    )
    parser.add_argument("--seed", type=int, default=None, help="Optional random seed")
    parser.add_argument(
        "--wall",
        default="#",
        help="Character used for maze walls (default: '#')",
    )
    parser.add_argument(
        "--path",
        default=" ",
        help="Character used for maze paths (default: space)",
    )
    parser.add_argument(
        "-o",
        "--output",
        default=None,
        help="Optional path to write the generated maze",
    )
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> None:
    args = _parse_args(argv)
    maze = generate_maze(args.width, args.height, algorithm=args.algorithm, seed=args.seed)
    ascii_maze = maze.to_ascii(wall=args.wall, path=args.path)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(ascii_maze + "\n")

    print(ascii_maze)


if __name__ == "__main__":
    main()
