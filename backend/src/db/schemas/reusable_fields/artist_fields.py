class ArtistFields:
    """Fields common to all artist tables."""

    external_urls_spotify: str
    followers_total: int
    genres: str | None
    id: str
    images_height: int | None
    images_url: str | None
    name: str
    popularity: int
    type: str
    main_genre: str | None
