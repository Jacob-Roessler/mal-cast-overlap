import { useState, useEffect } from 'react';
import useDebounce from './UseDebounce';

function PersonForm() {
  const [apiSearch, setApiSearch] = useState('');
  const [autoComplete, setAutocomplete] = useState([]);
  const [serachBy, setSearchBy] = useState('favorites');

  const [selectedPeople, setSelectedPeople] = useState([]);
  const [commonAnime, setCommonAnime] = useState([]);

  const getCommonAnime = () => {
    console.log('common anime called');
    if (selectedPeople.length < 2) {
      setCommonAnime([]);
      return;
    }

    let anime_lists = selectedPeople.map((p) => p.anime);
    anime_lists = anime_lists.map((anime_list) => anime_list.map((anime) => anime.anime));
    if (!anime_lists) {
      setCommonAnime([]);
      return;
    }

    let common_anime = anime_lists.reduce((list1, list2) =>
      list1.filter((anime) => list2.some((anime2) => anime.mal_id === anime2.mal_id))
    );

    common_anime.sort((a1, a2) => a1.title.localeCompare(a2.title));
    common_anime = common_anime.filter(
      (v, i, a) => a.findIndex((v2) => v2.mal_id === v.mal_id) === i
    );

    setCommonAnime(common_anime);
  };

  useDebounce(
    () => {
      console.log('api request made');
      fetch(`https://api.jikan.moe/v4/people?q=${apiSearch}&order_by=${serachBy}&sort=desc`)
        .then((response) => response.json())
        .then((json) => setAutocomplete(json.data))
        .catch((error) => console.error(error));
    },
    [apiSearch, serachBy],
    500
  );

  useEffect(() => {
    getCommonAnime();
  }, [selectedPeople]);

  const addPeople = async (e) => {
    let { id, name } = e.target;
    let object = {
      id,
      name,
    };
    if (
      selectedPeople.filter((p) => {
        return p.id === id;
      }).length === 0
    ) {
      const response = await fetch(`https://api.jikan.moe/v4/people/${id}/full`);
      const data = await response.json();
      console.log(data.data);
      let object = {
        ...data.data,
        anime: [...data.data.anime, ...data.data.voices],
      };
      setSelectedPeople([...selectedPeople, object]);
    }
  };

  const removePeople = (index) => {
    let data = [...selectedPeople];
    data.splice(index, 1);
    setSelectedPeople(data);
  };

  const handleSearchForm = (e) => {
    let name = e.target.value;
    setApiSearch(name);
  };

  return (
    <>
      <div className="flex flex-col items-center mx-4 text-white">
        <div className="flex flex-row">
          <input
            name="name"
            placeholder="Find people"
            className="border text-sm rounded-lg w-[250px] sm:w-[400px] p-3 my-5 dark:bg-gray-700 border-gray-600 placeholder-gray-400  focus:outline-none focus:ring-green-500 focus:border-green-500 "
            onChange={(event) => handleSearchForm(event)}
          />

          <select
            id="search_by"
            class=" w-[112px] sm:w-[200px] p-3 my-5 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-700 border-gray-600 placeholder-gray-400 focus:outline-none dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(e) => setSearchBy(e.target.value)}
          >
            <option selected value="favorites">
              Favorites
            </option>
            <option value="mal_id">MAL ID</option>
            <option value="birthday">Birthday</option>
          </select>
        </div>
        <div>
          <ul className="py-5 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 ">
            {autoComplete?.map((person, index) => {
              return (
                <li key={index} className="bg-slate-900 p-2 flex items-center justify-center">
                  <img
                    className="h-12 w-auto inline mr-auto"
                    src={Object.values(person?.images)[0].image_url}
                    alt={person.name}
                  ></img>
                  <a
                    className="mx-2 text-xs md:text-lg text-blue-600 dark:text-blue-500 hover:underline"
                    href={person.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {person?.name}
                  </a>

                  {selectedPeople.filter((p) => p.mal_id === person.mal_id).length > 0 ? (
                    <button
                      className="cursor-pointer ml-auto text-xl p-1 bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/50 md:rounded-lg"
                      onClick={() =>
                        removePeople(selectedPeople.findIndex((p) => p.mal_id === person.mal_id))
                      }
                    >
                      Rem
                    </button>
                  ) : (
                    <button
                      id={person.mal_id}
                      name={person.name}
                      className="cursor-pointer ml-auto text-xl p-1 bg-indigo-500 hover:bg-indigo-400 shadow-lg shadow-indigo-500/50  md:rounded-lg"
                      onClick={(e) => addPeople(e)}
                    >
                      Add
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center text-white">
        <h1>Selected</h1>
        <div className="w-[400px]">
          {selectedPeople.map((person, index) => {
            return (
              <div key={index} className="bg-slate-900 p-2 flex items-center justify-center">
                <div className="mr-2">
                  <img
                    className="h-12 w-auto inline mr-auto"
                    src={Object.values(person?.images)[0].image_url}
                    alt={person.name}
                  ></img>
                  <a
                    href={person.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mx-2 text-lg text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    {person.name}
                  </a>
                </div>
                <button
                  className="cursor-pointer ml-auto text-2xl p-1 bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/50 md:rounded-lg"
                  onClick={() => removePeople(index)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="min-h-screen  h-scren mx-4 text-white flex flex-col items-center">
        <h1 className="mb-2">Common Works</h1>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:mx-40">
          {commonAnime.length > 0
            ? commonAnime.map((anime, index) => {
                return (
                  <li
                    className="text-sm w-full flex text-left bg-slate-900 p-2 flex items-center justify-center"
                    key={index}
                  >
                    <img
                      className="h-20 w-auto"
                      src={Object.values(anime?.images)[0].image_url}
                      alt={anime.title}
                    ></img>
                    <a
                      href={anime.url}
                      className="font-medium mr-auto ml-2 text-blue-600 dark:text-blue-500 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {anime.title}
                    </a>
                  </li>
                );
              })
            : [
                <li key={1} className="col-span-1 py-2 "></li>,
                <li key={2} className="col-span-2 p-2 bg-red-600">
                  No Common Anime
                </li>,
              ]}
        </ul>
      </div>
    </>
  );
}

export default PersonForm;
