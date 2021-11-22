import { NextApiHandler } from 'next';
import data from '../../movies.json';

interface Movie {
  id: number;
  title: string;
  year: string;
  runtime: string;
  genres: string[];
  director: string;
  actors: string;
  plot: string;
  posterUrl: string;
}

export default (async (req, res) => {
  res.json(data.movies);
}) as NextApiHandler<Movie[]>;
