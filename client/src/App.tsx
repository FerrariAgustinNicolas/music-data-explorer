import { Route, Routes } from "react-router-dom";
import SearchPage from "./pages/SearchPage";
import ArtistPage from "./pages/ArtistPage";
import AlbumPage from "./pages/AlbumPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/artist/:name" element={<ArtistPage />} />
      <Route path="/album/:artist/:name" element={<AlbumPage />} />
    </Routes>
  );
};

export default App;
