import { useState } from 'react';
import css from './App.module.css';
import toast, { Toaster } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import { useQuery } from '@tanstack/react-query';

import SearchBar from '../SearchBar/SearchBar';
import { fetchMovies } from '../../services/movieService';
import type { Movie } from '../../types/movie';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieModal from '../MovieModal/MovieModal';

export default function App() {
    const [movie, setMovie] = useState('');
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, isSuccess } = useQuery({
        queryKey: ['movies', movie, page],
        queryFn: () => fetchMovies(movie, page),
        enabled: movie != '',
    });

    const totalPages = data?.total_pages ?? 0;
    
    const handleSubmit = async (query: string) => {
        setMovie(query);
        setPage(1);
        const data = await fetchMovies(query, page);
        if (data.results.length === 0) {
            toast.error('No movies found for your request.'); 
        }
    };

    const handleMovieSelect = (movie: Movie) => {
        if (movie) {
            setSelectedMovie(movie);
        }
    };

    const handleCloseModal = () => {
        setSelectedMovie(null);
    };

    return (
        <div className={css.app}>
            <SearchBar
                onSubmit={handleSubmit}
            />
            {isSuccess && totalPages > 1 && (
                <ReactPaginate
                    pageCount={totalPages}
                    pageRangeDisplayed={5}
                    marginPagesDisplayed={1}
                    onPageChange={({ selected }) => setPage(selected + 1)}
                    forcePage={page - 1}
                    containerClassName={css.pagination}
                    activeClassName={css.active}
                    nextLabel="→"
                    previousLabel="←"
                />
            )}
            <Toaster/>
            {isLoading && <Loader />}
            {isError && <ErrorMessage />}
            {data &&
                <MovieGrid movies={data.results} onSelect={handleMovieSelect} />
            }
            {selectedMovie && (
                <MovieModal movie={selectedMovie} onClose={handleCloseModal}/>
            )}
        </div>
    );
}