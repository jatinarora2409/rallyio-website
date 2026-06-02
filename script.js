// rallyio site — mobile nav, footer year, and dynamic catalog listing.
(function () {
  // ---- Mobile nav toggle ----
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Footer year ----
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ---- Catalogs: dynamic from the live API, with a built-in fallback ----
  var CATALOGS_API = 'https://rallyio-hfr-bmurezb4na-uc.a.run.app/catalogs';

  // Fallback used if the live API is unreachable (keeps the page useful offline
  // / before the backend is up). Mirrors the live catalog line-up.
  var FALLBACK = [
    { catalog_id: 'linkedin_people', name: 'LinkedIn Professional Search', domain: 'people', read_rate_usd: 0.05, is_real: true,
      description: 'Find people and look up individuals by name, company and location.' },
    { catalog_id: 'clinical_trials', name: 'Clinical Trials (ClinicalTrials.gov)', domain: 'health', read_rate_usd: 0, is_real: true,
      description: 'Registered clinical trials by condition, sponsor or status — phase, enrollment and more.' },
    { catalog_id: 'sec_filings', name: 'SEC Filings (EDGAR)', domain: 'finance', read_rate_usd: 0, is_real: true,
      description: 'Full-text search of U.S. public-company SEC filings (10-K, 10-Q, 8-K, S-1).' },
    { catalog_id: 'federal_contracts', name: 'U.S. Federal Contracts & Grants (USAspending)', domain: 'government', read_rate_usd: 0, is_real: true,
      description: 'Federal contracts and grants by keyword, recipient or agency.' },
    { catalog_id: 'research_papers', name: 'Academic Papers (OpenAlex)', domain: 'research', read_rate_usd: 0, is_real: true,
      description: '250M+ scholarly works — title, authors, year, venue, citations and DOI.' },
    { catalog_id: 'github_repos', name: 'GitHub Repositories', domain: 'software', read_rate_usd: 0, is_real: true,
      description: 'Search public repos by keyword or language — stars, forks, license, topics.' },
    { catalog_id: 'movies_tv', name: 'Movies & TV Shows (TVmaze)', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'Search TV shows — genres, network, premiere, rating, status and summary.' },
    { catalog_id: 'food_products', name: 'Food Products (Open Food Facts)', domain: 'food', read_rate_usd: 0, is_real: true,
      description: 'Packaged food & drink — brand, categories, Nutri-Score, NOVA group, ingredients.' },
    { catalog_id: 'recipes', name: 'Recipes (TheMealDB)', domain: 'food', read_rate_usd: 0, is_real: true,
      description: 'Recipes by dish — category, cuisine, ingredients, instructions and a photo.' },
    { catalog_id: 'books', name: 'Books (Open Library)', domain: 'books', read_rate_usd: 0, is_real: true,
      description: 'Books — title, author(s), first publication year, editions and subjects.' },
    { catalog_id: 'countries', name: 'Countries (REST Countries)', domain: 'geography', read_rate_usd: 0, is_real: true,
      description: 'Country facts — capital, population, region, languages and currencies.' },
    { catalog_id: 'crypto', name: 'Crypto Markets (CoinGecko)', domain: 'crypto', read_rate_usd: 0, is_real: true,
      description: 'Live crypto market data — price, market cap, rank and 24h change.' },
    { catalog_id: 'drug_labels', name: 'Drug Labels (openFDA)', domain: 'health', read_rate_usd: 0, is_real: true,
      description: 'FDA drug product labels — purpose, indications, manufacturer, route and warnings.' },
    { catalog_id: 'federal_register', name: 'Federal Register (U.S. regulations)', domain: 'government', read_rate_usd: 0, is_real: true,
      description: 'U.S. federal rules, proposed rules and notices by keyword — agency, abstract and link.' },
    { catalog_id: 'itunes', name: 'iTunes & App Store Search (Apple)', domain: 'media', read_rate_usd: 0, is_real: true,
      description: 'Music, podcasts, movies, TV, ebooks, audiobooks and apps — artist, genre, price and link.' },
    { catalog_id: 'anime', name: 'Anime (Jikan / MyAnimeList)', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'Search anime — type, episodes, score, year, status, genres and a synopsis.' },
    { catalog_id: 'breweries', name: 'Breweries (Open Brewery DB)', domain: 'business', read_rate_usd: 0, is_real: true,
      description: 'Find breweries by name or city — type, address, phone and website.' },
    { catalog_id: 'cocktails', name: 'Cocktails (TheCocktailDB)', domain: 'food', read_rate_usd: 0, is_real: true,
      description: 'Cocktail and drink recipes — category, glass, ingredients and instructions.' },
    { catalog_id: 'dictionary', name: 'Dictionary (Free Dictionary API)', domain: 'reference', read_rate_usd: 0, is_real: true,
      description: 'Define English words — part of speech, definitions, examples, synonyms and phonetics.' },
    { catalog_id: 'earthquakes', name: 'Earthquakes (USGS)', domain: 'science', read_rate_usd: 0, is_real: true,
      description: 'Recent earthquakes worldwide — magnitude, place, time, depth and a details link.' },
    { catalog_id: 'public_holidays', name: 'Public Holidays (Nager.Date)', domain: 'reference', read_rate_usd: 0, is_real: true,
      description: 'Official public holidays for any country and year — date, name and type.' },
    { catalog_id: 'spacex_launches', name: 'SpaceX Launches', domain: 'space', read_rate_usd: 0, is_real: true,
      description: 'SpaceX rocket launches — mission, date, rocket, success and webcast/wiki links.' },
    { catalog_id: 'wikipedia', name: 'Wikipedia Search', domain: 'reference', read_rate_usd: 0, is_real: true,
      description: 'Search Wikipedia articles — title, snippet, word count and a link.' },
    { catalog_id: 'exchange_rates', name: 'Currency Exchange Rates (Frankfurter / ECB)', domain: 'finance', read_rate_usd: 0, is_real: true,
      description: 'Latest FX reference rates for any base currency against major world currencies.' },
    { catalog_id: 'weather', name: 'Weather Forecast (Open-Meteo)', domain: 'weather', read_rate_usd: 0, is_real: true,
      description: 'Daily forecast for any place — high/low temp, precipitation, wind and current conditions.' },
    { catalog_id: 'world_bank', name: 'World Development Indicators (World Bank)', domain: 'economics', read_rate_usd: 0, is_real: true,
      description: 'Country indicators over recent years — population, GDP, life expectancy, inflation and more.' },
    { catalog_id: 'pokemon', name: 'Pokémon (PokeAPI)', domain: 'gaming', read_rate_usd: 0, is_real: true,
      description: 'Look up a Pokémon — types, height, weight, base experience, abilities and a sprite.' },
    { catalog_id: 'sports_teams', name: 'Sports Teams (TheSportsDB)', domain: 'sports', read_rate_usd: 0, is_real: true,
      description: 'Sports teams by name — sport, league, year formed, stadium, country and a description.' },
    { catalog_id: 'trivia', name: 'Trivia Questions (Open Trivia DB)', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'General-knowledge trivia — category, difficulty, question and correct/incorrect answers.' },
    { catalog_id: 'rick_and_morty', name: 'Rick and Morty Characters', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'Characters from Rick and Morty — status, species, gender, origin, location and episodes.' },
    { catalog_id: 'poetry', name: 'Poetry (PoetryDB)', domain: 'literature', read_rate_usd: 0, is_real: true,
      description: 'Classic public-domain poems by author or title — author, title, line count and an excerpt.' },
    { catalog_id: 'word_finder', name: 'Word Finder (Datamuse)', domain: 'language', read_rate_usd: 0, is_real: true,
      description: 'Find synonyms and related words ranked by relevance, with part of speech.' },
    { catalog_id: 'covid_stats', name: 'COVID-19 Statistics (disease.sh)', domain: 'health', read_rate_usd: 0, is_real: true,
      description: 'COVID-19 stats by country — cases, deaths, recovered, active, tests and per-capita rates.' },
    { catalog_id: 'music_tracks', name: 'Music Tracks (Deezer)', domain: 'media', read_rate_usd: 0, is_real: true,
      description: 'Search songs — title, artist, album, duration, popularity rank and a 30-second preview.' },
    { catalog_id: 'universities', name: 'Universities (Hipolabs)', domain: 'education', read_rate_usd: 0, is_real: true,
      description: 'Universities and colleges by country or name — country, state, website and domain.' },
    { catalog_id: 'art_institute', name: 'Artworks (Art Institute of Chicago)', domain: 'art', read_rate_usd: 0, is_real: true,
      description: 'Search the Art Institute of Chicago collection — title, artist, date, medium and image.' },
    { catalog_id: 'met_museum', name: 'Artworks (The Met Museum)', domain: 'art', read_rate_usd: 0, is_real: true,
      description: 'Search The Met collection — title, artist, date, medium, department and image.' },
    { catalog_id: 'spaceflight_news', name: 'Spaceflight News', domain: 'space', read_rate_usd: 0, is_real: true,
      description: 'Recent spaceflight & space-industry news — title, site, summary, date and link.' },
    { catalog_id: 'hacker_news', name: 'Hacker News Search', domain: 'technology', read_rate_usd: 0, is_real: true,
      description: 'Search Hacker News stories — title, author, points, comments and a link.' },
    { catalog_id: 'stackexchange', name: 'Stack Overflow Q&A (Stack Exchange)', domain: 'technology', read_rate_usd: 0, is_real: true,
      description: 'Search Stack Overflow questions — title, tags, score, answer count and a link.' },
    { catalog_id: 'npm_packages', name: 'npm Packages', domain: 'software', read_rate_usd: 0, is_real: true,
      description: 'Search npm — name, version, description, weekly downloads, publisher and link.' },
    { catalog_id: 'crates', name: 'Rust Crates (crates.io)', domain: 'software', read_rate_usd: 0, is_real: true,
      description: 'Search Rust crates — name, description, downloads and latest version.' },
    { catalog_id: 'nobel_prizes', name: 'Nobel Prizes', domain: 'reference', read_rate_usd: 0, is_real: true,
      description: 'Nobel laureates by category and year — laureate, category, year and motivation.' },
    { catalog_id: 'ghibli_films', name: 'Studio Ghibli Films', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'Studio Ghibli films — director, producer, year, running time, RT score and synopsis.' },
    { catalog_id: 'zip_lookup', name: 'Postal / ZIP Code Lookup (Zippopotam)', domain: 'geography', read_rate_usd: 0, is_real: true,
      description: 'Look up a postal/ZIP code — place name, state and coordinates, for many countries.' },
    { catalog_id: 'ip_geolocation', name: 'IP Geolocation (ip-api)', domain: 'technology', read_rate_usd: 0, is_real: true,
      description: 'Geolocate an IP or domain — country, region, city, coordinates, timezone and ISP.' },
    { catalog_id: 'f1_races', name: 'Formula 1 Race Calendar (Jolpica/Ergast)', domain: 'sports', read_rate_usd: 0, is_real: true,
      description: 'F1 race calendar for a season — round, race, date, circuit and location.' },
    { catalog_id: 'air_quality', name: 'Air Quality (Open-Meteo)', domain: 'environment', read_rate_usd: 0, is_real: true,
      description: 'Current air quality for any place — US AQI plus PM2.5, PM10, ozone, NO2, SO2 and CO.' },
    { catalog_id: 'food_recalls', name: 'Food Recalls (openFDA)', domain: 'food', read_rate_usd: 0, is_real: true,
      description: 'U.S. food recalls — firm, product, reason, classification, status and date.' },
    { catalog_id: 'weather_alerts', name: 'US Weather Alerts (NWS)', domain: 'weather', read_rate_usd: 0, is_real: true,
      description: 'Active U.S. weather alerts by state — event, severity, urgency, area and timing.' },
    { catalog_id: 'gbif_species', name: 'Species (GBIF)', domain: 'science', read_rate_usd: 0, is_real: true,
      description: 'Search species and taxa — scientific name, rank, kingdom, family, genus and status.' },
    { catalog_id: 'tv_people', name: 'TV & Film People (TVmaze)', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'Search actors and TV/film people — country, birthday, gender and a profile link.' },
    { catalog_id: 'pypi_packages', name: 'Python Packages (PyPI)', domain: 'software', read_rate_usd: 0, is_real: true,
      description: 'Look up a Python package — version, summary, author, license and required Python.' },
    { catalog_id: 'research_institutions', name: 'Research Institutions (OpenAlex)', domain: 'research', read_rate_usd: 0, is_real: true,
      description: 'Search universities & research institutions — country, type, works, citations, homepage.' },
    { catalog_id: 'rhymes', name: 'Rhyming Words (Datamuse)', domain: 'language', read_rate_usd: 0, is_real: true,
      description: 'Find words that rhyme with a given word, ranked, with syllable counts.' },
    { catalog_id: 'device_recalls', name: 'Medical Device Recalls (openFDA)', domain: 'health', read_rate_usd: 0, is_real: true,
      description: 'U.S. medical device recalls — firm, device, reason, classification, status and date.' },
    { catalog_id: 'countries_by_region', name: 'Countries by Region (REST Countries)', domain: 'geography', read_rate_usd: 0, is_real: true,
      description: 'All countries in a region — capital, population, subregion, languages and currencies.' },
    { catalog_id: 'trending_crypto', name: 'Trending Crypto (CoinGecko)', domain: 'crypto', read_rate_usd: 0, is_real: true,
      description: 'Cryptocurrencies trending right now — name, symbol, rank, price and 24h change.' },
    { catalog_id: 'fbi_wanted', name: 'FBI Wanted', domain: 'government', read_rate_usd: 0, is_real: true,
      description: "People on the FBI's wanted list — name, category, reward, field office and a link." },
    { catalog_id: 'internet_archive', name: 'Internet Archive', domain: 'media', read_rate_usd: 0, is_real: true,
      description: 'Search millions of free books, films, audio and software — title, creator, year, type.' },
    { catalog_id: 'name_predictions', name: 'Name Predictions (gender / age / nationality)', domain: 'data', read_rate_usd: 0, is_real: true,
      description: 'Predict likely gender, age and nationality for a first name, with probabilities.' },
    { catalog_id: 'quotes', name: 'Inspirational Quotes (ZenQuotes)', domain: 'reference', read_rate_usd: 0, is_real: true,
      description: 'A selection of inspirational quotes with their authors.' },
    { catalog_id: 'free_games', name: 'Free-to-Play Games (FreeToGame)', domain: 'gaming', read_rate_usd: 0, is_real: true,
      description: 'Browse free-to-play PC & browser games — title, genre, platform, publisher and link.' },
    { catalog_id: 'game_deals', name: 'PC Game Deals (CheapShark)', domain: 'gaming', read_rate_usd: 0, is_real: true,
      description: 'Discounted PC game deals — title, sale price, normal price, savings and a link.' },
    { catalog_id: 'wikidata', name: 'Wikidata Entities', domain: 'reference', read_rate_usd: 0, is_real: true,
      description: 'Search Wikidata for entities — label, description, entity id and a link.' },
    { catalog_id: 'inaturalist', name: 'Wildlife Taxa (iNaturalist)', domain: 'science', read_rate_usd: 0, is_real: true,
      description: 'Search plants & animals — scientific & common name, rank, observations, photo, wiki.' },
    { catalog_id: 'music_artists', name: 'Music Artists (TheAudioDB)', domain: 'media', read_rate_usd: 0, is_real: true,
      description: 'Look up artists & bands — genre, style, year formed, country, label and biography.' },
    { catalog_id: 'fx_history', name: 'Historical Exchange Rates (Frankfurter / ECB)', domain: 'finance', read_rate_usd: 0, is_real: true,
      description: 'Daily historical FX of one currency vs another over a recent window — date and rate.' },
    { catalog_id: 'xkcd', name: 'xkcd Comics', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'xkcd webcomics — number, title, alt-text, image and date. By number or the latest.' },
    { catalog_id: 'book_subjects', name: 'Books by Subject (Open Library)', domain: 'books', read_rate_usd: 0, is_real: true,
      description: 'Browse popular books in a subject/genre — title, author(s), year and edition count.' },
    { catalog_id: 'sunrise_sunset', name: 'Sunrise & Sunset Times', domain: 'reference', read_rate_usd: 0, is_real: true,
      description: 'Sunrise, sunset, solar noon and day length for any place by name.' },
    { catalog_id: 'rocket_launches', name: 'Upcoming Rocket Launches (Launch Library)', domain: 'space', read_rate_usd: 0, is_real: true,
      description: 'Upcoming orbital launches from all providers — mission, date, status, rocket and pad.' },
    { catalog_id: 'jisho', name: 'Japanese Dictionary (Jisho)', domain: 'language', read_rate_usd: 0, is_real: true,
      description: 'Look up Japanese words — kanji/kana, reading, English meanings, part of speech, JLPT.' },
    { catalog_id: 'school_holidays', name: 'School Holidays (OpenHolidays)', domain: 'reference', read_rate_usd: 0, is_real: true,
      description: 'School holiday periods for a country and year — name, start/end dates and scope.' },
    { catalog_id: 'on_this_day', name: 'On This Day (Wikipedia)', domain: 'reference', read_rate_usd: 0, is_real: true,
      description: 'Notable historical events on a given calendar date — year, event and a link.' },
    { catalog_id: 'music_albums', name: 'Music Albums (Deezer)', domain: 'media', read_rate_usd: 0, is_real: true,
      description: 'Search music albums — title, artist, track count, type and a link.' },
    { catalog_id: 'drug_adverse_events', name: 'Drug Adverse Events (openFDA)', domain: 'health', read_rate_usd: 0, is_real: true,
      description: 'Reported drug side effects — drug, reactions, seriousness, country and date.' },
    { catalog_id: 'device_clearances', name: 'Medical Device Clearances (openFDA 510k)', domain: 'health', read_rate_usd: 0, is_real: true,
      description: 'FDA 510(k) device clearances — device, applicant, decision date, type and K-number.' },
    { catalog_id: 'astronauts', name: 'SpaceX Astronauts (Crew)', domain: 'space', read_rate_usd: 0, is_real: true,
      description: 'Astronauts on SpaceX crewed missions — name, agency, status, launches and wiki.' },
    { catalog_id: 'tv_episodes', name: 'TV Episodes (TVmaze)', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'Episode list for a TV show — season, number, title, air date, runtime and rating.' },
    { catalog_id: 'adjectives', name: 'Describing Words (Datamuse)', domain: 'language', read_rate_usd: 0, is_real: true,
      description: 'Find adjectives that commonly describe a noun, ranked by relevance.' },
    { catalog_id: 'meals_by_ingredient', name: 'Meals by Ingredient (TheMealDB)', domain: 'food', read_rate_usd: 0, is_real: true,
      description: 'Find recipes that use a given ingredient — dish name, a photo and a link.' },
    { catalog_id: 'cocktails_by_ingredient', name: 'Cocktails by Ingredient (TheCocktailDB)', domain: 'food', read_rate_usd: 0, is_real: true,
      description: 'Find cocktails that use a given spirit or ingredient — drink, a photo and a link.' },
    { catalog_id: 'github_users', name: 'GitHub Users', domain: 'software', read_rate_usd: 0, is_real: true,
      description: 'Search GitHub users and organizations — username, type, profile link and avatar.' },
    { catalog_id: 'podcasts', name: 'Podcasts (Apple)', domain: 'media', read_rate_usd: 0, is_real: true,
      description: 'Search podcasts — show, creator, genre, episode count, RSS feed and a link.' },
    { catalog_id: 'commons_images', name: 'Free Images (Wikimedia Commons)', domain: 'media', read_rate_usd: 0, is_real: true,
      description: 'Search freely-licensed images — title, direct image URL and a description page.' },
    { catalog_id: 'ebooks', name: 'eBooks (Apple Books)', domain: 'books', read_rate_usd: 0, is_real: true,
      description: 'Search Apple Books — title, author, genre, release date, price and a link.' },
    { catalog_id: 'spacex_rockets', name: 'SpaceX Rockets', domain: 'space', read_rate_usd: 0, is_real: true,
      description: 'SpaceX rocket specs — type, first flight, height, mass, stages, cost and success rate.' },
    { catalog_id: 'ghibli_characters', name: 'Studio Ghibli Characters', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'Characters from Studio Ghibli films — name, gender, age, eye and hair color.' },
    { catalog_id: 'dnd_spells', name: 'D&D 5e Spells', domain: 'gaming', read_rate_usd: 0, is_real: true,
      description: 'Dungeons & Dragons 5e spells — level, school, casting time, range and description.' },
    { catalog_id: 'dnd_monsters', name: 'D&D 5e Monsters', domain: 'gaming', read_rate_usd: 0, is_real: true,
      description: 'D&D 5e monsters — size, type, alignment, armor class, hit points and challenge rating.' },
    { catalog_id: 'food_categories', name: 'Food Categories (TheMealDB)', domain: 'food', read_rate_usd: 0, is_real: true,
      description: 'The list of meal categories with descriptions and images.' },
    { catalog_id: 'authors', name: 'Book Authors (Open Library)', domain: 'books', read_rate_usd: 0, is_real: true,
      description: 'Search book authors — name, birth date, top work and number of works.' },
    { catalog_id: 'covid_history', name: 'COVID-19 History (disease.sh)', domain: 'health', read_rate_usd: 0, is_real: true,
      description: 'Daily historical COVID-19 case and death counts for a country over a recent window.' },
    { catalog_id: 'tv_schedule', name: 'TV Schedule (TVmaze)', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'TV episodes airing on a date — show, episode, season/number, air time and network.' },
    { catalog_id: 'sounds_like', name: 'Sounds-Like Words (Datamuse)', domain: 'language', read_rate_usd: 0, is_real: true,
      description: 'Find words that sound like a given word or spelling — for spelling, puns and names.' },
    { catalog_id: 'countries_by_currency', name: 'Countries by Currency (REST Countries)', domain: 'geography', read_rate_usd: 0, is_real: true,
      description: 'List countries that use a given currency — capital, population and region.' },
    { catalog_id: 'currency_convert', name: 'Currency Converter (Frankfurter / ECB)', domain: 'finance', read_rate_usd: 0, is_real: true,
      description: 'Convert an amount from one currency to another at the latest reference rate.' },
    { catalog_id: 'openalex_authors', name: 'Researchers (OpenAlex Authors)', domain: 'research', read_rate_usd: 0, is_real: true,
      description: 'Search academic authors — name, works, citations, last-known institution and ORCID.' },
    { catalog_id: 'meals_by_category', name: 'Meals by Category (TheMealDB)', domain: 'food', read_rate_usd: 0, is_real: true,
      description: 'List meals in a category (Seafood, Vegetarian, Dessert…) — dish, a photo and a link.' },
    { catalog_id: 'manga', name: 'Manga (Jikan / MyAnimeList)', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'Search manga — type, chapters, volumes, score, status, genres and a synopsis.' },
    { catalog_id: 'anime_characters', name: 'Anime & Manga Characters (Jikan)', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'Search anime/manga characters — name, Japanese name, favorites and an about blurb.' },
    { catalog_id: 'top_anime', name: 'Top Anime Rankings (Jikan)', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'The highest-ranked anime — rank, title, type, score, members and year.' },
    { catalog_id: 'pokemon_items', name: 'Pokémon Items (PokeAPI)', domain: 'gaming', read_rate_usd: 0, is_real: true,
      description: 'Look up a Pokémon item — cost, category, fling power, effect and a sprite.' },
    { catalog_id: 'pokemon_moves', name: 'Pokémon Moves (PokeAPI)', domain: 'gaming', read_rate_usd: 0, is_real: true,
      description: 'Look up a Pokémon move — type, power, accuracy, PP, damage class and effect.' },
    { catalog_id: 'pokemon_abilities', name: 'Pokémon Abilities (PokeAPI)', domain: 'gaming', read_rate_usd: 0, is_real: true,
      description: "Look up a Pokémon ability — effect, generation and whether it's main-series." },
    { catalog_id: 'github_user_repos', name: 'GitHub User Repositories', domain: 'software', read_rate_usd: 0, is_real: true,
      description: "List a user's or org's public repos — name, description, language, stars and forks." },
    { catalog_id: 'audiobooks', name: 'Audiobooks (Apple)', domain: 'books', read_rate_usd: 0, is_real: true,
      description: 'Search audiobooks — title, author/narrator, genre, release date, price and a link.' },
    { catalog_id: 'apps', name: 'App Store Apps (Apple)', domain: 'software', read_rate_usd: 0, is_real: true,
      description: 'Search the App Store — app name, developer, genre, price and rating.' },
    { catalog_id: 'countries_by_language', name: 'Countries by Language (REST Countries)', domain: 'geography', read_rate_usd: 0, is_real: true,
      description: 'List countries where a language is spoken — capital, population and region.' },
    { catalog_id: 'weather_history', name: 'Historical Weather (Open-Meteo)', domain: 'weather', read_rate_usd: 0, is_real: true,
      description: 'Past daily weather for any place — high/low temperature and precipitation over a range.' },
    { catalog_id: 'vaccine_coverage', name: 'COVID-19 Vaccine Coverage (disease.sh)', domain: 'health', read_rate_usd: 0, is_real: true,
      description: 'Daily cumulative COVID-19 vaccine doses administered in a country over time.' },
    { catalog_id: 'discography', name: 'Album Discography (TheAudioDB)', domain: 'media', read_rate_usd: 0, is_real: true,
      description: "List an artist's albums — title, year released, genre and label." },
    { catalog_id: 'top_manga', name: 'Top Manga Rankings (Jikan)', domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'The highest-ranked manga — rank, title, type, score, members and status.' },
    { catalog_id: 'anime_season', name: "This Season's Anime (Jikan)", domain: 'entertainment', read_rate_usd: 0, is_real: true,
      description: 'Anime airing this season — title, type, episodes, score, status and genres.' },
    { catalog_id: 'pokemon_types', name: 'Pokémon Type Matchups (PokeAPI)', domain: 'gaming', read_rate_usd: 0, is_real: true,
      description: "Damage relations for a Pokémon type — what it's strong/weak against and immunities." },
    { catalog_id: 'pokemon_natures', name: 'Pokémon Natures (PokeAPI)', domain: 'gaming', read_rate_usd: 0, is_real: true,
      description: 'A nature’s stat effects and flavor preferences — increased/decreased stat and flavors.' },
    { catalog_id: 'pokemon_berries', name: 'Pokémon Berries (PokeAPI)', domain: 'gaming', read_rate_usd: 0, is_real: true,
      description: 'A berry’s attributes — firmness, growth time, harvest, size, smoothness and gift power.' },
    { catalog_id: 'crypto_categories', name: 'Crypto Categories (CoinGecko)', domain: 'crypto', read_rate_usd: 0, is_real: true,
      description: 'Crypto categories by market cap — name, market cap, 24h change and trading volume.' },
    { catalog_id: 'crypto_exchanges', name: 'Crypto Exchanges (CoinGecko)', domain: 'crypto', read_rate_usd: 0, is_real: true,
      description: 'Top crypto exchanges — name, year, country, trust score and 24h BTC volume.' },
    { catalog_id: 'stackoverflow_by_tag', name: 'Top Stack Overflow Questions by Tag', domain: 'technology', read_rate_usd: 0, is_real: true,
      description: 'Highest-voted Stack Overflow questions for a tag — title, score, answers, views, link.' },
    { catalog_id: 'music_playlists', name: 'Music Playlists (Deezer)', domain: 'media', read_rate_usd: 0, is_real: true,
      description: 'Search music playlists — title, track count, creator and a link.' },
    { catalog_id: 'iss_astronauts', name: 'People in Space Right Now (Open Notify)', domain: 'space', read_rate_usd: 0, is_real: true,
      description: "The people currently in space and which spacecraft they're aboard." },
    { catalog_id: 'research_concepts', name: 'Research Fields & Concepts (OpenAlex)', domain: 'research', read_rate_usd: 0, is_real: true,
      description: 'Search academic fields/concepts — name, level, works count, citations and description.' },
    { catalog_id: 'meals_by_area', name: 'Meals by Cuisine (TheMealDB)', domain: 'food', read_rate_usd: 0, is_real: true,
      description: 'List dishes from a cuisine (Italian, Japanese, Mexican…) — dish, a photo and a link.' },
    { catalog_id: 'wiki_featured', name: 'Wikipedia Most-Read (by date)', domain: 'reference', read_rate_usd: 0, is_real: true,
      description: 'The most-read Wikipedia articles on a day — title, view count, an extract and a link.' }
  ];

  var list = document.getElementById('catalogList');
  var note = document.getElementById('catalogNote');
  if (!list) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function rateLabel(r) {
    var n = Number(r) || 0;
    if (n <= 0) return 'free';
    var per1k = n * 1000;
    var amt = per1k % 1 === 0 ? per1k.toFixed(0) : per1k.toFixed(2);
    return '$' + amt + ' / 1,000 records';
  }

  function prettyDomain(d) {
    return esc(String(d || '—').replace(/_/g, ' '));
  }

  var search = document.getElementById('catalogSearch');
  var allCatalogs = [];
  var isLive = true;

  function cardHtml(c) {
    var badge = c.is_real
      ? '<span class="badge badge--live">live</span>'
      : '<span class="badge badge--test">TEST_ONLY</span>';
    var href = 'catalog.html?id=' + encodeURIComponent(c.catalog_id || '');
    return '<a class="catalog-card-link" href="' + href + '">' +
      '<article class="card catalog-card' + (c.is_real ? '' : ' catalog-card--test') + '">' +
      '<div class="catalog-card__head"><h3>' + esc(c.name) + '</h3>' + badge + '</div>' +
      '<span class="catalog-pill">' + prettyDomain(c.domain) + '</span>' +
      '<p>' + esc(c.description) + '</p>' +
      '<div class="catalog-card__rate"><span>Read rate</span><strong>' + rateLabel(c.read_rate_usd) + '</strong>' +
      '<span class="catalog-card__more">Details →</span></div>' +
      '</article></a>';
  }

  function applyFilter() {
    var q = ((search && search.value) || '').trim().toLowerCase();
    var filtered = !q ? allCatalogs : allCatalogs.filter(function (c) {
      return (String(c.name || '') + ' ' + String(c.domain || '') + ' ' + String(c.description || ''))
        .toLowerCase().indexOf(q) !== -1;
    });
    list.innerHTML = filtered.length
      ? filtered.map(cardHtml).join('')
      : '<p class="catalog-loading">No catalogs match “' + esc(q) + '”.</p>';
    if (note) note.textContent = isLive ? '' : 'Showing the latest known catalogs.';
  }

  function load(catalogs, live) { allCatalogs = catalogs; isLive = live; applyFilter(); }

  if (search) search.addEventListener('input', applyFilter);

  fetch(CATALOGS_API, { mode: 'cors' })
    .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(function (data) {
      var cats = (data && data.catalogs) || [];
      if (!cats.length) throw new Error('empty');
      load(cats, true);
    })
    .catch(function () { load(FALLBACK, false); });
})();

// Reflect signed-in state in the nav (so "Sign in" becomes "Dashboard" when logged in).
(function () {
  var TOKEN_KEY = 'rallyio_gtoken';
  function decodeJwt(t) {
    try {
      var p = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(atob(p))));
    } catch (e) { return null; }
  }
  var tok = null;
  try { tok = localStorage.getItem(TOKEN_KEY); } catch (e) {}
  var claims = tok ? decodeJwt(tok) : null;
  var loggedIn = !!(claims && claims.exp && claims.exp * 1000 > Date.now());
  if (!loggedIn) return;
  var first = String(claims.name || claims.email || 'Account').split(' ')[0];
  var greeting = document.getElementById('navGreeting');
  var cta = document.getElementById('navCta');
  if (greeting) { greeting.textContent = 'Hi, ' + first; greeting.hidden = false; }
  if (cta) cta.textContent = 'Dashboard';
})();

// Home "Connect to Claude" copy button.
(function () {
  var b = document.getElementById('copyHomeConnect');
  if (!b) return;
  b.addEventListener('click', function () {
    var v = document.getElementById('homeConnectUrl').textContent.trim();
    if (navigator.clipboard) navigator.clipboard.writeText(v);
    this.textContent = 'Copied';
    var s = this; setTimeout(function () { s.textContent = 'Copy'; }, 1500);
  });
})();
