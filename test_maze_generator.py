import unittest

from maze_generator import generate_maze


class MazeGeneratorTests(unittest.TestCase):
    def test_seed_produces_deterministic_maze(self) -> None:
        maze_one = generate_maze(4, 4, seed=123)
        maze_two = generate_maze(4, 4, seed=123)
        self.assertEqual(maze_one.grid, maze_two.grid)

    def test_maze_dimensions(self) -> None:
        maze = generate_maze(3, 2, seed=5)
        ascii_maze = maze.to_ascii()
        rows = ascii_maze.splitlines()
        self.assertEqual(len(rows), 2 * 2 + 1)
        for row in rows:
            self.assertEqual(len(row), 2 * 3 + 1)

    def test_invalid_dimensions(self) -> None:
        with self.assertRaises(ValueError):
            generate_maze(0, 1)
        with self.assertRaises(ValueError):
            generate_maze(1, -1)


if __name__ == "__main__":
    unittest.main()
